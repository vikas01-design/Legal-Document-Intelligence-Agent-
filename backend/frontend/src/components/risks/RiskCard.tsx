import { motion } from "framer-motion";
import type { Risk } from "../../types/risk";
import TextReveal from "../common/TextReveal";

interface Props { risk: Risk; index: number; }

const cfg = {
  High: {
    dot: "bg-rose-500",
    badge: "text-rose-700 bg-rose-50 border-rose-200 font-semibold",
    border: "rgba(244,63,94,0.25)",
    bg: "linear-gradient(135deg, rgba(244,63,94,0.04), #FFFFFF)",
    glow: "rgba(244,63,94,0.01)",
    titleGlow: "bg-rose-50 border border-rose-100 text-rose-700 font-semibold",
  },
  Medium: {
    dot: "bg-amber-500",
    badge: "text-amber-700 bg-amber-50 border-amber-200 font-semibold",
    border: "rgba(245,158,11,0.2)",
    bg: "linear-gradient(135deg, rgba(245,158,11,0.03), #FFFFFF)",
    glow: "rgba(245,158,11,0.01)",
    titleGlow: "bg-amber-50 border border-amber-100 text-amber-800 font-semibold",
  },
  Low: {
    dot: "bg-emerald-500",
    badge: "text-emerald-700 bg-emerald-50 border-emerald-200 font-semibold",
    border: "rgba(16,185,129,0.2)",
    bg: "linear-gradient(135deg, rgba(16,185,129,0.02), #FFFFFF)",
    glow: "rgba(16,185,129,0.005)",
    titleGlow: "bg-emerald-50 border border-emerald-100 text-emerald-800 font-semibold",
  },
};

export default function RiskCard({ risk, index }: Props) {
  const c = cfg[risk.level] ?? cfg.Low;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group p-3.5 rounded-2xl border transition-all hover:scale-[1.01] duration-300"
      style={{
        background: c.bg,
        borderColor: c.border,
        boxShadow: `0 4px 20px -2px ${c.glow}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`text-[13px] font-semibold px-2 py-0.5 rounded font-display tracking-wide ${c.titleGlow} truncate`}>
              {risk.title}
            </h3>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${c.badge}`}>
              {risk.level}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            <TextReveal text={risk.description} delay={index * 0.12 + 0.1} />
          </p>
        </div>
      </div>
    </motion.div>
  );
}
