import { motion } from "framer-motion";
import type { ChatMessage } from "../../types/chat";
import AIResponse from "./AIResponse";

interface Props {
  message: ChatMessage;
}

export default function ChatBubble({ message }: Props) {
  // ── User bubble ───────────────────────────────────────
  if (message.role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="flex justify-end"
      >
        <div
          className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed text-white shadow-sm"
          style={{
            background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
            border: "none",
          }}
        >
          {message.text}
        </div>
      </motion.div>
    );
  }

  // ── AI structured/unstructured response ───────────────
  return (
    <div className="flex justify-start w-full">
      <div className="w-full">
        <AIResponse message={message} />
      </div>
    </div>
  );
}
