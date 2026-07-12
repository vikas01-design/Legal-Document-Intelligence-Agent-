import { motion } from "framer-motion";
import type { Risk } from "../../types/risk";

interface Props { risks: Risk[]; }

export default function RiskSummary({ risks }: Props) {
  const counts = { High: 0, Medium: 0, Low: 0 };

  risks.forEach((r) => {
    const level = String(r.level ?? "").trim().toLowerCase();
    if (level === "high") counts.High++;
    else if (level === "medium") counts.Medium++;
    else if (level === "low") counts.Low++;
  });

  const total = risks.length;

  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {(["High", "Medium", "Low"] as const).map((level) => {
        const pct = total ? (counts[level] / total) * 100 : 0;
        const colors = {
          High:   { text: "text-rose-700",    bar: "bg-rose-500",    bg: "bg-rose-50 border border-rose-100"    },
          Medium: { text: "text-amber-700",   bar: "bg-amber-500",   bg: "bg-amber-50 border border-amber-100"   },
          Low:    { text: "text-emerald-700", bar: "bg-emerald-500", bg: "bg-emerald-50 border border-emerald-100" },
        }[level];

        return (
          <div key={level} className={`rounded-xl p-3 ${colors.bg}`}>
            <div className={`text-2xl font-bold font-display ${colors.text}`}>{counts[level]}</div>
            <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{level}</div>
            <div className="mt-2 h-1 rounded-full bg-slate-200 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className={`h-full rounded-full ${colors.bar}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
