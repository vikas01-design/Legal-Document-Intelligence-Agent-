import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  glass?: boolean;
}

export default function Card({ children, className = "", glass = false }: Props) {
  return (
    <div
      className={`
        rounded-2xl border
        ${
          glass
            ? "bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-white/50 dark:border-slate-700/50"
            : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
        }
        shadow-sm
        ${className}
      `}
    >
      {children}
    </div>
  );
}
