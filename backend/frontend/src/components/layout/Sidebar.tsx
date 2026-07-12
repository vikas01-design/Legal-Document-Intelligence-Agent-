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
      {/* Logo */}
      <div
        onClick={onLogoClick}
        className="mb-8 relative group cursor-pointer select-none"
        title="Go back to landing page"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 opacity-15 blur-[6px] group-hover:opacity-30 transition-opacity duration-300" />
        <motion.div
          whileHover={{ scale: 1.06 }}
          className="relative w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-200/80 overflow-hidden"
        >
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
            <defs>
              <linearGradient id="lexoraGrad1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
              <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx="20" cy="20" r="18" fill="url(#lexoraGrad1)" fillOpacity="0.1" />
            <path className="animate-left-scale" d="M12 16L7 27H17L12 16Z" fill="url(#lexoraGrad1)" fillOpacity="0.15" stroke="url(#lexoraGrad1)" strokeWidth="1.2" strokeLinejoin="round" />
            <path className="animate-right-scale" d="M28 16L23 27H33L28 16Z" fill="url(#lexoraGrad1)" fillOpacity="0.15" stroke="url(#lexoraGrad1)" strokeWidth="1.2" strokeLinejoin="round" filter="url(#logoGlow)" />
            <path className="animate-balance-beam" d="M8 16C13 19.5 27 19.5 32 16" stroke="url(#lexoraGrad1)" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M20 7.5V27C20 29.2091 18.2091 31 16 31H11" stroke="url(#lexoraGrad1)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="7.5" r="1.5" fill="#4f46e5" />
            <circle cx="12" cy="16" r="2.2" fill="url(#lexoraGrad1)" className="animate-left-scale" />
            <circle cx="28" cy="16" r="2.2" fill="url(#lexoraGrad1)" className="animate-right-scale" />
          </svg>
        </motion.div>
      </div>

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
