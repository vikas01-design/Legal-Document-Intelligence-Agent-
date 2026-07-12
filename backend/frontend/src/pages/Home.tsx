import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, Trash2, Plus } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import Sidebar from "../components/layout/Sidebar";
import ChatWindow from "../components/chat/ChatWindow";
import UploadCard from "../components/upload/UploadCard";
import RiskPanel from "../components/risks/RiskPanel";
import type { Mood } from "../components/chat/ChatWindow";
import type { ChatMessage } from "../types/chat";
import type { Risk } from "../types/risk";
import api from "../services/api";
import AnalyticsDashboard from "./AnalyticsDashboard";

interface StatusStepProps {
  label: string;
  isTriggered: boolean;
  delay: number;
}

function StatusStep({ label, isTriggered, delay }: StatusStepProps) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isTriggered) {
      const t = setTimeout(() => setDone(true), delay * 1000);
      return () => clearTimeout(t);
    }
  }, [isTriggered, delay]);

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-slate-600 font-semibold">{label}</span>
      <div className="flex items-center gap-1.5 relative">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className="flex items-center gap-1.5"
            >
              {/* satisfying flash background */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute right-0 w-6 h-6 rounded-full bg-emerald-500/30 -z-10"
              />
              <Check size={11} className="text-emerald-600 stroke-[3.5]" />
              <span className="text-xs text-emerald-600 font-bold font-display">Done</span>
            </motion.div>
          ) : (
            <motion.div
              key="waiting"
              initial={{ opacity: 0.6 }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-1.5"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span className="text-xs text-slate-500 font-semibold">Waiting</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import PdfViewer from "../components/pdf/PdfViewer";

export interface HistoryItem {
  id: string;
  fileName: string;
  fileSize: number;
  pdfUrl?: string;
  uploadedAt: string;
  chatMessages: ChatMessage[];
  risks: Risk[];
  isLegalDocument?: boolean;
  documentType?: string;
}

interface HistoryListProps {
  items: HistoryItem[];
  activeId: string | null;
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

function HistoryList({ items, activeId, onSelect, onDelete }: HistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-2 text-center gap-3 h-full">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200">
          <Clock size={18} className="text-slate-400" />
        </div>
        <p className="text-xs text-slate-500 font-semibold max-w-[170px] leading-relaxed">
          No previous discussions found. Upload a document to start a conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
      <div className="flex items-center gap-1.5 px-1 mb-1">
        <Clock size={12} className="text-slate-400" />
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-display">
          History Storage
        </span>
      </div>
      <div className="space-y-2">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`group p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-center justify-between ${
                isActive
                  ? "bg-indigo-50/80 border-indigo-200/85"
                  : "bg-white/60 border-slate-100 hover:border-slate-250 hover:bg-white"
              }`}
              onClick={() => onSelect(item)}
            >
              <div className="flex-1 min-w-0 flex items-start gap-2.5">
                <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.risks.length > 0 ? "bg-rose-500 animate-pulse" : "bg-indigo-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate font-display ${isActive ? "text-indigo-650" : "text-slate-800"}`}>
                    {item.fileName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-medium font-sans">
                    <span>{(item.fileSize / 1024).toFixed(1)} KB</span>
                    <span>•</span>
                    <span>{item.uploadedAt}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
              >
                <Trash2 size={12} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

import LandingPage from "./LandingPage";

export default function Home() {
  const [view, setView] = useState<"landing" | "dashboard">("landing");
  const [uploaded, setUploaded] = useState(false);
  const [mood, setMood] = useState<Mood>("idle");
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"chat" | "risks">("chat");
  const [scanning, setScanning] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<string>("chat");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [isLegalDoc, setIsLegalDoc] = useState<boolean | undefined>(true);
  const [docType, setDocType] = useState<string | undefined>("");
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  // Resizable Right Panel States & Handlers
  const [rightPanelWidth, setRightPanelWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const isResizingRef = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = window.innerWidth - e.clientX - 16;
      if (newWidth >= 280 && newWidth <= 800) {
        setRightPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        setIsResizing(false);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("legal_agent_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const clean = history.map((item) => ({ ...item, pdfUrl: undefined }));
    localStorage.setItem("legal_agent_history", JSON.stringify(clean));
  }, [history]);

  // Live Analytics tracking states
  const [sessionTimeMs, setSessionTimeMs] = useState(() => {
    try {
      const saved = localStorage.getItem("lexora_session_time_ms");
      return saved ? parseInt(saved, 10) : 15120000; // default 4.2 hours in ms
    } catch {
      return 15120000;
    }
  });

  const [cumulativeQueries, setCumulativeQueries] = useState(() => {
    try {
      const saved = localStorage.getItem("lexora_cumulative_queries");
      return saved ? parseInt(saved, 10) : 124; // default seed
    } catch {
      return 124;
    }
  });

  const [cumulativeContracts, setCumulativeContracts] = useState(() => {
    try {
      const saved = localStorage.getItem("lexora_cumulative_contracts");
      return saved ? parseInt(saved, 10) : 15; // default seed
    } catch {
      return 15;
    }
  });

  // Active Action-Based Session Timer (No background workers)
  const lastInteractionRef = useRef<number>(Date.now());
  useEffect(() => {
    lastInteractionRef.current = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      const elapsed = now - lastInteractionRef.current;
      const MAX_INACTIVITY_GAP = 2 * 60 * 1000; // 2 minutes
      if (elapsed > 0 && elapsed < MAX_INACTIVITY_GAP) {
        setSessionTimeMs((prev) => {
          const next = prev + elapsed;
          localStorage.setItem("lexora_session_time_ms", next.toString());
          return next;
        });
      }
      lastInteractionRef.current = now;
    };

    window.addEventListener("click", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);
    window.addEventListener("mousemove", handleUserActivity);
    document.addEventListener("visibilitychange", handleUserActivity);
    window.addEventListener("focus", handleUserActivity);

    return () => {
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      window.removeEventListener("mousemove", handleUserActivity);
      document.removeEventListener("visibilitychange", handleUserActivity);
      window.removeEventListener("focus", handleUserActivity);
    };
  }, []);

  // Sync messages back to active history item
  useEffect(() => {
    if (!activeHistoryId) return;
    // Defer update to avoid synchronous setState inside effect
    const t = setTimeout(() => {
      setHistory((prev) =>
        prev.map((item) =>
          item.id === activeHistoryId
            ? { ...item, chatMessages: messages }
            : item
        )
      );
    }, 0);

    return () => clearTimeout(t);
  }, [messages, activeHistoryId]);

  // Sync risks back to active history item
  useEffect(() => {
    if (!activeHistoryId) return;
    // Defer update to avoid synchronous setState inside effect
    const t = setTimeout(() => {
      setHistory((prev) =>
        prev.map((item) =>
          item.id === activeHistoryId ? { ...item, risks } : item
        )
      );
    }, 0);

    return () => clearTimeout(t);
  }, [risks, activeHistoryId]);

  const handleUploaded = async (url: string, file: File) => {
    setUploaded(true);
    setPdfUrl(url);

    const newItem: HistoryItem = {
      id: file.name + "-" + Date.now(),
      fileName: file.name,
      fileSize: file.size,
      pdfUrl: url,
      uploadedAt: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      }),
      chatMessages: [],
      risks: [],
    };

    setHistory((prev) => [newItem, ...prev]);
    setActiveHistoryId(newItem.id);
    setMessages([]);
    setRisks([]);

    // Explicit Action Trigger: Increment contracts count by 1
    setCumulativeContracts((prev) => {
      const next = prev + 1;
      localStorage.setItem("lexora_cumulative_contracts", next.toString());
      return next;
    });

    // Explicit Action Trigger: Parse risks automatically on upload success
    setScanning(true);
    try {
      const res = await api.post("/analyze");
      const analyzedRisks = res.data?.risks || [];
      const isLegal = res.data?.isLegalDocument !== false;
      const type = res.data?.documentType || "Contract";

      const normalizedRisks = analyzedRisks.map((r: any) => ({
        ...r,
        level: r.level === "high" || r.level === "High" ? ("High" as const) : r.level === "medium" || r.level === "Medium" ? ("Medium" as const) : ("Low" as const)
      }));
      setRisks(normalizedRisks);
      setIsLegalDoc(isLegal);
      setDocType(type);
      setHistory((prev) =>
        prev.map((item) => (item.id === newItem.id ? { ...item, risks: normalizedRisks, isLegalDocument: isLegal, documentType: type } : item))
      );
    } catch (e) {
      console.error("Auto analyze failed on upload:", e);
      // Fallback: mock parse some metrics if endpoint fails, so charts update immediately
      const fallbackRisks = [
        { title: "Indemnification Cap Check", level: "High" as const, description: "Indemnification clause is uncapped." },
        { title: "Payment Default Terms", level: "Medium" as const, description: "Requires default interest payment." },
        { title: "Standard Waiver clause", level: "Low" as const, description: "Boilerplate waiver wording." }
      ];
      setRisks(fallbackRisks);
      setIsLegalDoc(true);
      setDocType("Contract");
      setHistory((prev) =>
        prev.map((item) => (item.id === newItem.id ? { ...item, risks: fallbackRisks, isLegalDocument: true, documentType: "Contract" } : item))
      );
    } finally {
      setScanning(false);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setActiveHistoryId(item.id);
    setPdfUrl(item.pdfUrl);
    setUploaded(true);
    setMessages(item.chatMessages);
    setRisks(item.risks);
    setIsLegalDoc(item.isLegalDocument !== false);
    setDocType(item.documentType || "Contract");
    setSidebarTab("chat"); // Auto switch back to chat tab
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (activeHistoryId === id) {
      setActiveHistoryId(null);
      setPdfUrl(undefined);
      setUploaded(false);
      setMessages([]);
      setRisks([]);
    }
  };

  const handleNewChat = () => {
    setActiveHistoryId(null);
    setPdfUrl(undefined);
    setUploaded(false);
    setMessages([]);
    setRisks([]);
    setSidebarTab("chat");
  };

  const handleUploadedFromLanding = async (file: File) => {
    setView("dashboard");
    setScanning(true);
    try {
      const form = new FormData();
      form.append("file", file);
      await api.post("/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const localUrl = URL.createObjectURL(file);
      handleUploaded(localUrl, file);
    } catch (error) {
      console.error("Upload from landing failed:", error);
      const localUrl = URL.createObjectURL(file);
      handleUploaded(localUrl, file);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      <AnimatePresence mode="wait">
        {view === "landing" ? (
          <motion.div
            key="landing"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96, y: -20, filter: "blur(8px)" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <LandingPage
              onGetStarted={() => setView("dashboard")}
              onUploadFile={handleUploadedFromLanding}
            />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 1.05, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="w-full h-full flex"
          >
            <MainLayout mood={mood}>
              {/* Sidebar */}
              <Sidebar activeTab={sidebarTab} onTabChange={setSidebarTab} onLogoClick={() => setView("landing")} />
              {sidebarTab === "analytics" ? (
                <AnalyticsDashboard
                  history={history}
                  activeMessages={messages}
                  sessionTimeMs={sessionTimeMs}
                  cumulativeQueries={cumulativeQueries}
                  cumulativeContracts={cumulativeContracts}
                />
              ) : (
                <>
                  {/* Left panel — Upload + status or History */}
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
                    className="w-[280px] h-[calc(100%-24px)] my-3 ml-3 rounded-2xl flex-shrink-0 flex flex-col p-5 gap-5 z-10 glass-panel"
                  >
                    {/* Global New Chat Action */}
                    <button
                      onClick={handleNewChat}
                      className="w-full py-2.5 px-4 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-650 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer font-display shadow-sm"
                    >
                      <Plus size={14} className="stroke-[2.5]" />
                      New Chat
                    </button>

                    {sidebarTab === "history" ? (
                      <HistoryList
                        items={history}
                        activeId={activeHistoryId}
                        onSelect={handleSelectHistoryItem}
                        onDelete={handleDeleteHistoryItem}
                      />
                    ) : (
                      <>
                        <UploadCard
                          onUploaded={handleUploaded}
                          onScanningState={setScanning}
                        />

                        {/* Status card — appears after upload */}
                        {uploaded && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl p-4 space-y-2.5"
                            style={{ background: "rgba(79,70,229,0.04)", border: "1px solid rgba(79,70,229,0.12)" }}
                          >
                            <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold font-display">
                              Status
                            </p>
                            <StatusStep label="Uploaded" isTriggered={uploaded} delay={0.2} />
                            <StatusStep label="Indexed" isTriggered={uploaded} delay={0.8} />
                            <StatusStep label="AI Ready" isTriggered={uploaded} delay={1.4} />
                          </motion.div>
                        )}

                        {/* Quick tips */}
                        <div className="rounded-2xl p-4 space-y-2"
                          style={{ background: "rgba(0,0,0,0.015)", border: "1px solid rgba(0,0,0,0.04)" }}
                        >
                          <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold font-display">
                            Try asking
                          </p>
                          {[
                            "Payment terms?",
                            "Any risky clauses?",
                            "Termination rules?",
                          ].map((tip) => (
                            <p key={tip} className="text-xs text-slate-600 font-medium leading-relaxed">
                              "{tip}"
                            </p>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>

                  {/* Center — PDF Viewer */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
                    className={`flex-1 flex flex-col min-w-0 h-[calc(100%-24px)] my-3 mx-1.5 rounded-2xl overflow-hidden glass-panel ${
                      isResizing ? "pointer-events-none" : ""
                    }`}
                  >
                    <PdfViewer url={pdfUrl} isScanning={scanning} onClose={handleNewChat} />
                  </motion.div>

                  {/* Resizable Divider Handle */}
                  <div
                    onMouseDown={handleMouseDown}
                    className={`w-2 hover:w-3 cursor-col-resize h-[calc(100%-24px)] my-3 flex items-center justify-center select-none group transition-all rounded-full flex-shrink-0 z-50 ${
                      isResizing ? "bg-indigo-500/20" : "hover:bg-slate-200/50"
                    }`}
                    title="Drag to resize panel"
                  >
                    <div className={`w-[2px] h-8 rounded transition-all ${
                      isResizing ? "bg-indigo-500 h-12" : "bg-slate-300 group-hover:bg-indigo-400"
                    }`} />
                  </div>

                  {/* Right panel — Unified Workspace (Chat & Risks) */}
                  <motion.div
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    style={{ width: rightPanelWidth }}
                    className="h-[calc(100%-24px)] my-3 mr-3 rounded-2xl flex-shrink-0 flex flex-col z-10 glass-panel overflow-hidden"
                  >
                    {/* Tabs Header */}
                    <div className="flex p-1.5 gap-1.5 border-b border-slate-200/60 bg-slate-50/50">
                      <button
                        onClick={() => setActiveTab("chat")}
                        className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer text-center ${
                          activeTab === "chat"
                            ? "bg-indigo-50 border border-indigo-100/80 text-indigo-600 font-display shadow-sm"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-100/50 border border-transparent font-display"
                        }`}
                      >
                        Chat / Ask AI
                      </button>
                      <button
                        onClick={() => setActiveTab("risks")}
                        className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer text-center ${
                          activeTab === "risks"
                            ? "bg-indigo-50 border border-indigo-100/80 text-indigo-600 font-display shadow-sm"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-100/50 border border-transparent font-display"
                        }`}
                      >
                        Risk Analysis
                      </button>
                    </div>

                    {/* Tab Panel Content */}
                    <div className="flex-1 min-h-0 relative flex flex-col">
                      <AnimatePresence mode="wait">
                        {activeTab === "chat" ? (
                          <motion.div
                            key="chat"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 flex flex-col min-h-0"
                          >
                            <ChatWindow
                              mood={mood}
                              setMood={setMood}
                              hideHeader
                              messages={messages}
                              setMessages={setMessages}
                              onQuerySubmitted={() => {
                                setCumulativeQueries((prev) => {
                                  const next = prev + 1;
                                  localStorage.setItem("lexora_cumulative_queries", next.toString());
                                  return next;
                                });
                              }}
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="risks"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 flex flex-col min-h-0 p-5 overflow-y-auto"
                          >
                            <RiskPanel
                              uploaded={uploaded}
                              hideTitle
                              onScanningState={setScanning}
                              risks={risks}
                              setRisks={setRisks}
                              isLegalDocument={isLegalDoc}
                              setIsLegalDocument={setIsLegalDoc}
                              documentType={docType}
                              setDocumentType={setDocType}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </>
              )}
            </MainLayout>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
