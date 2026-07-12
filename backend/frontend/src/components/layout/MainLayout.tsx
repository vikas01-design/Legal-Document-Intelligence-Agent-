import type { ReactNode } from "react";
import type { Mood } from "../chat/ChatWindow";
import { motion } from "framer-motion";

interface Props {
  children: ReactNode;
  mood?: Mood;
}

export default function MainLayout({ children, mood = "idle" }: Props) {
  const glowConfig = {
    idle: {
      glow1: "bg-indigo-500/4 blur-[130px] w-[500px] h-[500px]",
      glow2: "bg-violet-500/3 blur-[110px] w-[400px] h-[400px]",
      glow3: "bg-blue-400/3 blur-[90px] w-[300px] h-[300px]",
    },
    thinking: {
      glow1: "bg-indigo-500/6 blur-[140px] w-[600px] h-[600px] animate-pulse duration-[3000ms]",
      glow2: "bg-violet-500/5 blur-[120px] w-[450px] h-[450px]",
      glow3: "bg-blue-400/4 blur-[100px] w-[350px] h-[350px]",
    },
    talking: {
      glow1: "bg-emerald-500/4 blur-[130px] w-[550px] h-[550px]",
      glow2: "bg-indigo-500/5 blur-[110px] w-[450px] h-[450px] animate-pulse duration-[2000ms]",
      glow3: "bg-blue-400/3 blur-[90px] w-[300px] h-[300px]",
    },
    happy: {
      glow1: "bg-emerald-500/5 blur-[130px] w-[550px] h-[550px]",
      glow2: "bg-teal-500/4 blur-[110px] w-[400px] h-[400px]",
      glow3: "bg-indigo-500/3 blur-[90px] w-[300px] h-[300px]",
    },
  }[mood];

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8F9FA] relative flex transition-colors duration-1000">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          layout
          className={`absolute top-[-20%] left-[10%] rounded-full transition-all duration-1000 ${glowConfig.glow1}`}
        />
        <motion.div
          layout
          className={`absolute bottom-[-10%] right-[5%] rounded-full transition-all duration-1000 ${glowConfig.glow2}`}
        />
        <motion.div
          layout
          className={`absolute top-[40%] left-[40%] rounded-full transition-all duration-1000 ${glowConfig.glow3}`}
        />
      </div>
      {children}
    </div>
  );
}
