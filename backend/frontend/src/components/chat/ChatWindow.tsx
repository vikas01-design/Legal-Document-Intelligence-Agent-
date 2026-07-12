import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, MoreHorizontal, RefreshCw } from "lucide-react";
import axios from "axios";
import api from "../../services/api";
import type { ChatMessage } from "../../types/chat";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import LexBot from "../robot/LexBot";

export type Mood = "idle" | "thinking" | "talking" | "happy";

interface ChatWindowProps {
  mood: Mood;
  setMood: (mood: Mood) => void;
  hideHeader?: boolean;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onQuerySubmitted?: (text: string) => void;
}

const GHOST_PROMPTS = [
  "What are the payment terms in this contract?",
  "Summarise the key obligations of each party",
  "Are there any non-compete clauses?",
  "What are the termination conditions?",
  "Identify any unusual or risky clauses",
];

/** Sleep helper for retry back-off */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Call /chat with up to `maxRetries` automatic retries on network-level
 * failures (no response). Server errors (4xx / 5xx) are NOT retried —
 * they carry a meaningful message we should show the user.
 */
async function chatWithRetry(
  question: string,
  maxRetries = 2,
  baseDelay = 1200
): Promise<{ answer: string; source?: string }> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await api.post("/chat", { question });
      const data = res.data;

      // Backend always returns { success, answer } — show answer either way.
      // success:false just means the AI couldn't help (e.g. no doc uploaded),
      // but the answer field contains a useful explanation.
      const answer: string =
        data.answer ||
        data.message ||
        "I couldn't generate a response. Please try again.";

      const source: string | undefined =
        data.toolResults?.[0]?.payload?.result?.source;

      return { answer, source };
    } catch (err) {
      lastError = err;

      // Only retry on genuine network failures (no response).
      // If the server replied with an error status, surface it immediately.
      if (axios.isAxiosError(err) && err.response) {
        // Server is up but unhappy — don't retry, just surface the message
        const msg =
          err.response.data?.message ||
          err.response.data?.error ||
          err.response.data?.answer;
        if (msg) return { answer: msg };
        throw err; // re-throw for classifyError below
      }

      // Network / proxy / timeout — retry after back-off unless last attempt
      if (attempt < maxRetries) {
        await sleep(baseDelay * (attempt + 1));
      }
    }
  }

  // All retries exhausted
  throw lastError;
}

/** Map a final error into a human-readable message */
function classifyError(err: unknown): string {
  if (!axios.isAxiosError(err)) {
    return "Something went wrong. Please try again.";
  }

  if (err.response) {
    const msg = err.response.data?.message || err.response.data?.error;
    if (msg) return String(msg);
    if (err.response.status === 500)
      return "The AI service hit an internal error. Please try again.";
    if (err.response.status === 429)
      return "Too many requests — please wait a moment and try again.";
    return `Request failed (${err.response.status}). Please try again.`;
  }

  if (err.code === "ECONNABORTED" || err.code === "ERR_CANCELED") {
    return "The AI took too long to respond. Please try again — complex queries can take up to 30 seconds.";
  }

  // No response after retries — give actionable info without being alarmist
  return "Could not reach the server after multiple attempts. Please make sure the backend is running (`npm run server` in the backend folder) and try again.";
}

export default function ChatWindow({
  mood,
  setMood,
  hideHeader,
  messages,
  setMessages,
  onQuerySubmitted,
}: ChatWindowProps) {
  const [loading, setLoading] = useState(false);
  const [ghostIndex, setGhostIndex] = useState(0);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Rotate ghost prompts when idle
  useEffect(() => {
    if (messages.length > 0) return;
    const t = setInterval(
      () => setGhostIndex((i) => (i + 1) % GHOST_PROMPTS.length),
      3800
    );
    return () => clearInterval(t);
  }, [messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(
    async (text: string) => {
      setLastFailedText(null);

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        text,
      };
      setMessages((p) => [...p, userMsg]);
      onQuerySubmitted?.(text);
      setLoading(true);
      setMood("thinking");

      try {
        const { answer, source } = await chatWithRetry(text);

        const aiMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          text: answer,
          source,
        };
        setMood("talking");
        setMessages((p) => [...p, aiMsg]);
        setTimeout(() => setMood("idle"), 2000);
      } catch (err) {
        console.error("[ChatWindow] send failed after retries:", err);

        setMessages((p) => [
          ...p,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: classifyError(err),
          },
        ]);

        // Keep the retry button for genuine failures
        setLastFailedText(text);
        setMood("idle");
      } finally {
        setLoading(false);
      }
    },
    [setMessages, setMood, onQuerySubmitted]
  );

  const isHeroState =
    messages.length === 0 || (messages.length === 1 && loading);

  return (
    <div className="flex flex-col h-full relative">
      {/* ── Header ───────────────────────────────────── */}
      {!hideHeader && (
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-[11px] text-white/30 uppercase tracking-widest font-semibold font-display">
              Speaking to
            </p>
            <h2 className="text-base font-semibold text-white font-display">
              Lexora AI
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={() => {
                  setMessages([]);
                  setMood("idle");
                  setLastFailedText(null);
                }}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors cursor-pointer">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Retry bar (only after genuine failure) ─────── */}
      <AnimatePresence>
        {lastFailedText && !loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mb-2"
          >
            <button
              onClick={() => send(lastFailedText)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <RefreshCw size={12} />
              Retry last message
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Robot hero (empty state) ──────────────────── */}
      <AnimatePresence>
        {isHeroState && (
          <motion.div
            key="robot-hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col items-center justify-center flex-1 px-6 pb-4"
          >
            <div className="relative">
              <div
                className={`absolute inset-0 m-auto -z-10 rounded-full blur-[80px] transition-all duration-1000 ${
                  mood === "thinking"
                    ? "w-[260px] h-[260px] bg-violet-500/12 animate-pulse"
                    : mood === "talking"
                    ? "w-[240px] h-[240px] bg-emerald-500/10"
                    : "w-[220px] h-[220px] bg-violet-500/6"
                }`}
              />
              <LexBot mood={mood} size={200} />
            </div>

            <div className="mt-8 text-center max-w-sm min-h-[72px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="query"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="text-center"
                  >
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2 font-display">
                      Analyzing Query
                    </p>
                    <p className="text-[19px] font-semibold text-indigo-600 font-display leading-snug">
                      "{messages[0]?.text}"
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={ghostIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className="text-[22px] font-semibold text-slate-800 leading-snug font-display">
                      {GHOST_PROMPTS[ghostIndex].split(" ").slice(0, 4).join(" ")}{" "}
                      <span className="text-slate-400">
                        {GHOST_PROMPTS[ghostIndex].split(" ").slice(4).join(" ")}
                      </span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Message thread ────────────────────────────── */}
      {!isHeroState && (
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-shrink-0">
              <LexBot mood={mood} size={44} />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold leading-none font-display">
                Lexora AI
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {mood === "thinking"
                  ? "Analysing your contract…"
                  : "Legal Intelligence Platform"}
              </p>
            </div>
          </div>

          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div
                className="px-4 py-3 rounded-2xl rounded-bl-sm"
                style={{
                  background: "rgba(0,0,0,0.02)",
                  border: "1px solid rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex gap-1.5 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="typing-dot w-1.5 h-1.5 rounded-full bg-indigo-500"
                      style={{ boxShadow: "0 0 6px rgba(79,70,229,0.4)" }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* ── Input ─────────────────────────────────────── */}
      <div className="px-4 pb-4 pt-2">
        <ChatInput onSend={send} disabled={loading} />
      </div>
    </div>
  );
}
