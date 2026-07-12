import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, AlertTriangle, BookOpen, BarChart2,
  ShieldCheck, Pencil, AlertCircle, Zap, Gauge,
  CheckCircle2, ChevronDown,
} from "lucide-react";
import type { ParsedSection } from "../../lib/parseAIResponse";
import { SECTION_META } from "../../lib/parseAIResponse";
import { renderMarkdownContent } from "../../lib/renderMarkdown";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  FileText, AlertTriangle, BookOpen, BarChart2,
  ShieldCheck, Pencil, AlertCircle, Zap, Gauge, CheckCircle2,
};

// Per-accent colour tokens (Tailwind-safe, written as inline styles to avoid purge issues)
const ACCENT_COLORS: Record<string, { border: string; bg: string; icon: string; header: string }> = {
  cyan:    { border: "rgba(6,182,212,0.12)",    bg: "#FFFFFF",                 icon: "#0891b2", header: "rgba(6,182,212,0.04)"    },
  rose:    { border: "rgba(225,29,72,0.12)",    bg: "#FFFFFF",                 icon: "#e11d48", header: "rgba(225,29,72,0.04)"    },
  violet:  { border: "rgba(124,58,237,0.12)",   bg: "#FFFFFF",                 icon: "#7c3aed", header: "rgba(124,58,237,0.04)"   },
  blue:    { border: "rgba(37,99,235,0.12)",    bg: "#FFFFFF",                 icon: "#2563eb", header: "rgba(37,99,235,0.04)"    },
  emerald: { border: "rgba(5,150,105,0.12)",    bg: "#FFFFFF",                 icon: "#059669", header: "rgba(5,150,105,0.04)"    },
  amber:   { border: "rgba(217,119,6,0.12)",    bg: "#FFFFFF",                 icon: "#d97706", header: "rgba(217,119,6,0.04)"    },
  orange:  { border: "rgba(234,88,12,0.12)",    bg: "#FFFFFF",                 icon: "#ea580c", header: "rgba(234,88,12,0.04)"    },
  red:     { border: "rgba(220,38,38,0.12)",    bg: "#FFFFFF",                 icon: "#dc2626", header: "rgba(220,38,38,0.04)"    },
  pink:    { border: "rgba(219,39,119,0.12)",   bg: "#FFFFFF",                 icon: "#db2777", header: "rgba(219,39,119,0.04)"   },
  teal:    { border: "rgba(13,148,136,0.12)",   bg: "#FFFFFF",                 icon: "#0d9488", header: "rgba(13,148,136,0.04)"   },
};

interface Props {
  section: ParsedSection;
  index: number;
}

export default function ResponseCard({ section, index }: Props) {
  const [open, setOpen] = useState(index < 2); // first 2 cards expanded by default
  const meta   = SECTION_META[section.number] ?? { short: section.title, icon: "FileText", accentClass: "cyan" };
  const colors = ACCENT_COLORS[meta.accentClass] ?? ACCENT_COLORS.cyan;
  const Icon   = ICON_MAP[meta.icon] ?? FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.055, ease: [0.23, 1, 0.32, 1] }}
      className="rounded-2xl overflow-hidden shadow-xs"
      style={{ border: `1px solid ${colors.border}`, background: colors.bg }}
    >
      {/* ── Card Header ─────────────────────────── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:brightness-[0.98]"
        style={{ background: colors.header }}
      >
        {/* Number badge */}
        <span
          className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold border border-slate-100"
          style={{ background: "rgba(0,0,0,0.02)", color: colors.icon }}
        >
          {section.number}
        </span>

        {/* Icon */}
        <Icon size={14} style={{ color: colors.icon, flexShrink: 0 }} />

        {/* Title */}
        <span className="flex-1 text-sm font-semibold text-slate-800">
          {meta.short}
        </span>

        {/* Risk level badge — only on section 9 */}
        {section.riskLevel && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 border"
            style={{
              background:
                section.riskLevel === "high"     ? "rgba(220,38,38,0.06)"  :
                section.riskLevel === "moderate" ? "rgba(217,119,6,0.06)"  :
                                                   "rgba(5,150,105,0.06)",
              borderColor:
                section.riskLevel === "high"     ? "rgba(220,38,38,0.15)"  :
                section.riskLevel === "moderate" ? "rgba(217,119,6,0.15)"  :
                                                   "rgba(5,150,105,0.15)",
              color:
                section.riskLevel === "high"     ? "#dc2626" :
                section.riskLevel === "moderate" ? "#d97706" :
                                                   "#059669",
            }}
          >
            {section.riskLevel === "high" ? "HIGH" : section.riskLevel === "moderate" ? "MODERATE" : "LOW"}
          </span>
        )}

        {/* Chevron */}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown size={14} className="text-slate-400" />
        </motion.div>
      </button>

      {/* ── Card Body ───────────────────────────── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 py-3 border-t text-slate-700 leading-relaxed text-xs font-sans" style={{ borderColor: colors.border }}>
              {renderMarkdownContent(section.content)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
