import { useState } from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, ArrowLeft } from "lucide-react";

interface Props {
  onBack?: () => void;
}

export default function AuthPage({ onBack }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background blobs for premium glassmorphism */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-bl from-pink-500/10 to-transparent rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-gradient-to-r from-purple-500/5 to-transparent rounded-full filter blur-[100px] pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-12 left-[15%] w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
        <div className="absolute bottom-24 right-[20%] w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
        <div className="absolute top-1/3 right-[10%] w-1 h-1 rounded-full bg-pink-400 animate-bounce" style={{ animationDuration: "3s" }} />
      </div>

      {/* Back to landing button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all px-3 py-2 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 cursor-pointer shadow-sm z-50 font-display"
        >
          <ArrowLeft size={13} />
          Back to Home
        </button>
      )}

      {/* Main glass box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-4xl h-auto min-h-[580px] rounded-3xl border border-slate-800/80 bg-slate-900/30 backdrop-blur-xl flex flex-col md:flex-row overflow-hidden shadow-2xl relative z-10"
      >
        {/* Left pane: Marketing Column */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/25 flex items-center justify-center">
              <Scale className="text-indigo-500" size={18} />
            </div>
            <span className="text-sm font-bold tracking-tight text-white font-display">Lexora AI</span>
          </div>

          <div className="space-y-4 my-8 md:my-0">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight font-display">
              Production-Grade <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Legal Intelligence
              </span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed font-sans max-w-sm">
              Review complex commercial agreements, flag severe liability risks, check statutory compliance under Indian law, and edit clauses dynamically.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold font-display">
              Enterprise Standard Integration
            </span>
          </div>
        </div>

        {/* Right pane: Auth Column */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {mode === "signin" ? (
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center"
              >
                <SignIn
                  routing="hash"
                  signUpUrl="" // handled via our custom switch below
                  appearance={{
                    elements: {
                      rootBox: "w-full max-w-md",
                      card: "bg-transparent shadow-none border-none p-0 text-white",
                      headerTitle: "text-xl font-bold font-display text-white",
                      headerSubtitle: "text-xs text-slate-400",
                      socialButtonsBlockButton: "bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800/80 transition-colors py-2 rounded-xl text-xs",
                      socialButtonsBlockButtonText: "font-semibold text-slate-200",
                      formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors",
                      formFieldLabel: "text-xs font-semibold text-slate-350",
                      formFieldInput: "bg-slate-900/60 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500",
                      footer: "hidden", // hide standard footer redirects so we control it
                    },
                  }}
                />
                
                <p className="text-xs text-slate-400 mt-6 font-sans">
                  Don't have an account?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer transition-colors"
                  >
                    Sign Up
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center"
              >
                <SignUp
                  routing="hash"
                  signInUrl=""
                  appearance={{
                    elements: {
                      rootBox: "w-full max-w-md",
                      card: "bg-transparent shadow-none border-none p-0 text-white",
                      headerTitle: "text-xl font-bold font-display text-white",
                      headerSubtitle: "text-xs text-slate-400",
                      socialButtonsBlockButton: "bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800/80 transition-colors py-2 rounded-xl text-xs",
                      socialButtonsBlockButtonText: "font-semibold text-slate-200",
                      formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors",
                      formFieldLabel: "text-xs font-semibold text-slate-350",
                      formFieldInput: "bg-slate-900/60 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500",
                      footer: "hidden",
                    },
                  }}
                />

                <p className="text-xs text-slate-400 mt-6 font-sans">
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("signin")}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer transition-colors"
                  >
                    Sign In
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
