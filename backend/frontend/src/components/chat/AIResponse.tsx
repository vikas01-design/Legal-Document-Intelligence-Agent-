import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import type { ChatMessage } from "../../types/chat";
import { parseAIResponse } from "../../lib/parseAIResponse";
import ResponseCard from "./ResponseCard";
import { renderMarkdownContent } from "../../lib/renderMarkdown";

interface Props {
  message: ChatMessage;
}

export default function AIResponse({ message }: Props) {
  const parsed = parseAIResponse(message.text);
  const [collapsed, setCollapsed] = useState(false);

  // ── Unstructured fallback ─────────────────────────────
  if (!parsed.isStructured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl rounded-bl-sm px-4 py-3 max-w-[92%] shadow-sm"
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(0, 0, 0, 0.06)",
        }}
      >
        <div className="text-[13px] text-slate-700 leading-relaxed">
          {renderMarkdownContent(message.text)}
        </div>
        {message.source && (
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
            <FileText size={11} />
            {message.source}
          </div>
        )}
      </motion.div>
    );
  }

  // ── Structured 10-card response ───────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-2"
    >
      {/* Collapse / expand all toggle */}
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-[11px] text-slate-450 font-medium">
          {parsed.sections.length} sections
        </span>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors"
        >
          {collapsed ? <><ChevronDown size={12} /> Expand all</> : <><ChevronUp size={12} /> Collapse all</>}
        </button>
      </div>

      {/* Cards */}
      {parsed.sections.map((section, i) => (
        <ResponseCard key={section.number} section={section} index={i} />
      ))}

      {/* Source citation */}
      {message.source && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1 pt-1">
          <FileText size={11} />
          {message.source}
        </div>
      )}
    </motion.div>
  );
}
