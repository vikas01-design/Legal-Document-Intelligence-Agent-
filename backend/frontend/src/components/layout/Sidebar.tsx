import { UserButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import {
  MessageSquare, History, BarChart3,
} from "lucide-react";

const nav = [
  { icon: MessageSquare, label: "Chat",      active: true },
  { icon: History,       label: "History",   active: false },
  { icon: BarChart3,     label: "Analytics", active: false },
];

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onLogoClick?: () => void;
}

export default function Sidebar({ activeTab = "chat", onTabChange, onLogoClick }: SidebarProps) {
  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="w-[70px] h-[calc(100%-24px)] my-3 ml-3 rounded-2xl flex flex-col items-center py-6 z-20 relative glass-panel"
    >

      {/* ThinkDoc text logo — click to return to landing page */}
      <motion.button
        onClick={onLogoClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        title="Back to landing page"
        className="mb-7 flex flex-col items-center gap-0.5 cursor-pointer select-none group"
      >
        <span className="text-[11px] font-extrabold tracking-tight leading-none bg-gradient-to-b from-indigo-500 to-violet-500 bg-clip-text text-transparent group-hover:from-indigo-400 group-hover:to-violet-400 transition-all duration-200">
          Think
        </span>
        <span className="text-[11px] font-extrabold tracking-tight leading-none bg-gradient-to-b from-violet-500 to-indigo-400 bg-clip-text text-transparent group-hover:from-violet-400 group-hover:to-indigo-300 transition-all duration-200">
          Doc
        </span>
      </motion.button>

      {/* Nav icons */}
      <nav className="flex flex-col gap-1 flex-1">
        {nav.map(({ icon: Icon, label }, i) => {
          const isActive = activeTab === label.toLowerCase();
          return (
            <motion.button
              key={label}
              onClick={() => onTabChange?.(label.toLowerCase())}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              title={label}
              className={`
                relative w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer
                ${isActive
                  ? "bg-indigo-50 text-indigo-600 border border-indigo-100/50"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-indigo-600" />
              )}
              <Icon size={17} />
            </motion.button>
          );
        })}
      </nav>

      {/* Avatar (Clerk UserButton) */}
      <div className="w-8 h-8 flex items-center justify-center relative z-50">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8 rounded-full border border-slate-200/50 shadow-sm",
            }
          }}
        />
      </div>
    </motion.aside>
  );
}
