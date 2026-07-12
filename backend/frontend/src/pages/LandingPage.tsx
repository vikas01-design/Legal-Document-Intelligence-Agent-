import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Play, Sparkles, HelpCircle, Shield, Database, Cpu, AlertTriangle, FileText, ArrowRight
} from "lucide-react";
import LexBot from "../components/robot/LexBot";

interface Props {
  onGetStarted: () => void;
  onUploadFile: (file: File) => void;
}

// Interactive Dashboard Mockup shown in the Hero section (Light Mode Refactored)
function DashboardMockup() {
  const [activeTab, setActiveTab] = useState<"summary" | "chat" | "risks">("summary");
  const [scrollingText, setScrollingText] = useState("");

  useEffect(() => {
    const fullText = "The lease agreement outlines a standard 3-year term. Under Section 12.1 (Indemnification), liability for breaches is uncapped, which presents a significant risk. The termination clause requires a 90-day written notice, with automatic renewal unless cancelled...";
    let index = 0;
    const interval = setInterval(() => {
      setScrollingText(fullText.slice(0, index));
      index = (index + 1) % (fullText.length + 10);
    }, 45);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-[480px] h-[330px] rounded-2xl bg-white border border-slate-200 shadow-xl relative overflow-hidden flex flex-col font-sans select-none text-slate-800">
      {/* Top Header Mockup */}
      <div className="h-10 border-b border-slate-100 bg-slate-50/80 px-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-slate-600 font-bold ml-2 font-display">Lexora Workspace v1.4</span>
        </div>
        <div className="px-2.5 py-0.5 rounded bg-indigo-50 border border-indigo-150 text-[9px] text-indigo-650 font-bold uppercase tracking-wider">
          AI Shield Active
        </div>
      </div>
      
      {/* Dashboard Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side Navigation (Mock) */}
        <div className="w-12 border-r border-slate-100 bg-slate-50/20 p-2 flex flex-col gap-2 items-center">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <FileText size={14} />
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700">
            <Shield size={14} />
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700">
            <Database size={14} />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden p-3 gap-3">
          {/* Tabs */}
          <div className="flex gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200/40">
            {["Summary", "AI Chat", "Risks"].map((tab) => {
              const tabId = tab.toLowerCase().replace(" ", "") as "summary" | "chat" | "risks";
              const active = activeTab === tabId;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tabId)}
                  className={`flex-1 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    active ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 bg-slate-50/40 rounded-lg border border-slate-200/30 p-2.5 overflow-hidden text-[11px] leading-relaxed relative">
            <AnimatePresence mode="wait">
              {activeTab === "summary" && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-2 h-full flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[9px] font-bold text-indigo-650 uppercase tracking-widest block mb-1">CONTRACT OVERVIEW</span>
                    <p className="text-slate-700 font-semibold h-[85px] overflow-hidden text-ellipsis">
                      {scrollingText}
                      <span className="animate-pulse bg-indigo-600 text-indigo-600">|</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[9px] text-slate-550">
                    <span>File: commercial_lease.pdf</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Fully Indexed</span>
                  </div>
                </motion.div>
              )}

              {activeTab === "chat" && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-2 h-full flex flex-col justify-between"
                >
                  <div className="space-y-2 overflow-y-auto max-h-[105px] pr-1">
                    <div className="bg-slate-100/80 p-2 rounded-lg border border-slate-200/40 text-right">
                      <span className="text-[8px] text-slate-500 block mb-0.5">YOU</span>
                      <p className="text-slate-800 font-semibold leading-normal">Are there renewal costs?</p>
                    </div>
                    <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/65 text-left">
                      <span className="text-[8px] text-indigo-600 block mb-0.5">LEXORA AI</span>
                      <p className="text-slate-800 font-semibold leading-normal">Yes. Section 4.3 details an automatic 5% annual escalator fee on the base rent rate.</p>
                    </div>
                  </div>
                  <div className="h-6 border border-slate-200 rounded bg-white px-2 flex items-center justify-between text-[9px] text-slate-500">
                    <span>Ask another question...</span>
                    <ArrowRight size={10} className="text-indigo-650" />
                  </div>
                </motion.div>
              )}

              {activeTab === "risks" && (
                <motion.div
                  key="risks"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-2 h-full flex flex-col justify-between"
                >
                  <div className="space-y-1.5 max-h-[105px] overflow-y-auto pr-1">
                    <div className="flex items-center justify-between p-1.5 rounded bg-rose-50 border border-rose-100">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle size={11} className="text-rose-600" />
                        <span className="font-bold text-rose-800 text-[10px]">Uncapped Liability</span>
                      </div>
                      <span className="text-[8px] bg-rose-100 text-rose-700 font-bold px-1 rounded">CRITICAL</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-amber-50 border border-amber-100">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle size={11} className="text-amber-600" />
                        <span className="font-bold text-amber-800 text-[10px]">Renewal Escalator</span>
                      </div>
                      <span className="text-[8px] bg-amber-100 text-amber-700 font-bold px-1 rounded">WARNING</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-200/40">
                    <span>Total Risks Found: 2</span>
                    <span className="text-rose-700 font-bold">Action Required</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage({ onGetStarted, onUploadFile }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [activeStep, setActiveStep] = useState<
    "idle" | "intent" | "guard" | "retrieval" | "agent" | "risk" | "formatter"
  >("idle");
  const [ambientStep, setAmbientStep] = useState<number>(0);

  useEffect(() => {
    if (activeStep !== "idle") return;
    const interval = setInterval(() => {
      setAmbientStep((prev) => (prev + 1) % 6);
    }, 2800);
    return () => clearInterval(interval);
  }, [activeStep]);

  const handleAnimateAndUpload = (file: File) => {
    const steps: Array<typeof activeStep> = [
      "intent",
      "guard",
      "retrieval",
      "agent",
      "risk",
      "formatter"
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setActiveStep(step);
        if (step === "formatter") {
          setTimeout(() => {
            onUploadFile(file);
          }, 900);
        }
      }, index * 500);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      handleAnimateAndUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      handleAnimateAndUpload(file);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el && containerRef.current) {
      containerRef.current.scrollTo({
        top: el.offsetTop - 70,
        behavior: "smooth"
      });
    }
  };

  // Steps configuration for Interactive Blueprint
  const blueprintSteps = [
    { id: "intent", title: "Ingestion", icon: HelpCircle, label: "User Question", desc: "User uploads PDF contract or asks a legal question. Lexora reads, parses, and structures text inputs." },
    { id: "guard", title: "Prompt Guard", icon: Shield, label: "Enkrypt Guard", desc: "Enkrypt AI instantly sanitizes prompts, checks boundaries, and neutralizes injection threats." },
    { id: "retrieval", title: "Retrieval", icon: Database, label: "Qdrant Index", desc: "Queries Qdrant for semantic match indices, pulling matching context snippets." },
    { id: "agent", title: "AI Agent", icon: Cpu, label: "Mastra Core", desc: "Mastra directs the core legal model to cross-reference contract sections and check compliance." },
    { id: "risk", title: "Risk Analyzer", icon: AlertTriangle, label: "Risk Assessment", desc: "Discovers indemnification gaps, uncapped liabilities, and compliance items." },
    { id: "formatter", title: "Structured UI", icon: FileText, label: "Frontend Render", desc: "Converts output to structured formats and streams reports back to the UI." },
  ];

  // Resolve current active index
  const getCurrentStepIndex = () => {
    if (activeStep !== "idle") {
      const stepOrder: Array<typeof activeStep> = ["intent", "guard", "retrieval", "agent", "risk", "formatter"];
      return stepOrder.indexOf(activeStep);
    }
    return ambientStep;
  };

  const currentStepIndex = getCurrentStepIndex();
  const currentStep = blueprintSteps[currentStepIndex];

  return (
    <div
      ref={containerRef}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`h-screen w-screen ambient-mesh-bg text-slate-800 relative overflow-y-auto selection:bg-indigo-500/10 selection:text-indigo-650 transition-all duration-300 ${
        dragging ? "ring-4 ring-indigo-500/20 ring-inset" : ""
      }`}
    >
      {/* Noise overlay texture */}
      <div className="absolute inset-0 noise-overlay pointer-events-none -z-10" />

      {/* Header navbar */}
      <header className="sticky top-0 bg-[#F8F9FA]/80 backdrop-blur-md border-b border-slate-200/50 z-50 flex items-center justify-between px-8 py-4 select-none">
        <div
          onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <motion.div
            whileHover={{ scale: 1.06 }}
            className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-slate-200 overflow-hidden"
          >
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
              <defs>
                <linearGradient id="lexoraGradHeader" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
              <circle cx="20" cy="20" r="18" fill="url(#lexoraGradHeader)" fillOpacity="0.08" />
              <path className="animate-left-scale" d="M12 16L7 27H17L12 16Z" fill="url(#lexoraGradHeader)" fillOpacity="0.1" stroke="url(#lexoraGradHeader)" strokeWidth="1.2" strokeLinejoin="round" />
              <path className="animate-right-scale" d="M28 16L23 27H33L28 16Z" fill="url(#lexoraGradHeader)" fillOpacity="0.1" stroke="url(#lexoraGradHeader)" strokeWidth="1.2" strokeLinejoin="round" />
              <path className="animate-balance-beam" d="M8 16C13 19.5 27 19.5 32 16" stroke="url(#lexoraGradHeader)" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M20 7.5V27C20 29.2091 18.2091 31 16 31H11" stroke="url(#lexoraGradHeader)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="20" cy="7.5" r="1.5" fill="#4f46e5" />
              <circle cx="12" cy="16" r="2.2" fill="url(#lexoraGradHeader)" className="animate-left-scale" />
              <circle cx="28" cy="16" r="2.2" fill="url(#lexoraGradHeader)" className="animate-right-scale" />
            </svg>
          </motion.div>
          <span className="font-bold text-sm tracking-wider font-display bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Lexora AI
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollToSection("tech-stack")} className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer font-display uppercase tracking-wider">
            Tech Stack
          </button>
          <button onClick={() => scrollToSection("blueprint")} className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer font-display uppercase tracking-wider">
            Interactive Blueprint
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={onGetStarted} className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer font-display uppercase tracking-wider">
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="px-4 py-2 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-sm cursor-pointer font-display transition-all"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-8 pt-20 pb-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left column: Typography, Dropzone, and Details */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-7"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-150 bg-indigo-50 text-indigo-700 select-none">
            <Sparkles size={11} className="animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase font-display">
              Lexora AI • Enterprise Standard
            </span>
          </div>

          {/* Typewriter Clarify Animation for Headline Tagline */}
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.18] font-display flex flex-wrap gap-x-2.5 gap-y-1.5">
            {"Understand Legal Documents".split(" ").map((word, idx) => (
              <motion.span
                key={idx}
                initial={{ filter: "blur(14px)", opacity: 0, y: 15 }}
                animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: idx * 0.14, ease: "easeOut" }}
                className="text-slate-950"
              >
                {word}
              </motion.span>
            ))}
            <span className="inline-flex flex-wrap gap-x-2.5">
              {"Before You Sign.".split(" ").map((word, idx) => (
                <motion.span
                  key={idx}
                  initial={{ filter: "blur(14px)", opacity: 0, y: 15 }}
                  animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: (idx + 3) * 0.14, ease: "easeOut" }}
                  className="bg-gradient-to-r from-indigo-650 via-violet-600 to-indigo-800 bg-clip-text text-transparent"
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h1>

          <p className="text-sm text-slate-700 leading-relaxed max-w-lg font-sans font-semibold">
            Upload any legal agreement and get plain-language risk indicators instantly. Securely cross-reference clauses, audit liabilities, and chat with contextual vector database search.
          </p>

          {/* Action container with files input and drag drop */}
          <div className="flex flex-col gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* The Glowing Dropzone (Light refactored: Paper-like card canvas) */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-lg p-7 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-center cursor-pointer select-none relative group overflow-hidden transition-all duration-300 hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/10 to-cyan-50/10 opacity-30 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                <Upload className="text-indigo-600 animate-pulse" size={18} />
              </div>
              
              <div className="space-y-1.5 z-10">
                <p className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                  Drop your NDA / Commercial Agreement here
                </p>
                <p className="text-[10px] text-slate-600 font-bold font-sans">
                  Instant AI Risk Analysis • Secure & Encrypted
                </p>
              </div>

              {/* Decorative light scanning line */}
              <div className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent top-0 animate-[scanLaser_3.5s_infinite]" />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onGetStarted}
                className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer font-display uppercase tracking-wider"
              >
                <Play size={10} className="fill-slate-500 text-slate-500" />
                See How It Works
              </button>
            </div>
          </div>

          {/* Accuracy & Compliance note */}
          <div className="flex items-center gap-2 pt-2 select-none">
            <div className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-[10px] font-bold text-slate-750 uppercase tracking-widest font-display">
              Enterprise compliant and secure
            </span>
          </div>
        </motion.div>

        {/* Right column: Interactive Dashboard Mockup & Pointing Robot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="relative flex items-center justify-center py-6"
        >
          {/* Backdrop halo */}
          <div className="absolute w-[350px] h-[350px] rounded-full bg-indigo-500/5 blur-3xl animate-pulse pointer-events-none" />
          
          {/* Dashboard Mockup wrapper */}
          <div className="relative">
            <DashboardMockup />
            
            {/* Cartoon Robot (LexBot) pointing at the dashboard mockup actions — enlarged size */}
            <div className="absolute -bottom-8 -left-12 z-20 pointer-events-auto">
              <LexBot mood={activeStep === "idle" ? "thinking" : "happy"} size={175} pointing="right" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Drag overlay indicator */}
      {dragging && (
        <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-md pointer-events-none flex flex-col items-center justify-center z-50">
          <div className="p-8 rounded-3xl border border-indigo-500/20 bg-white shadow-2xl flex flex-col items-center gap-3">
            <Upload size={32} className="text-indigo-650 animate-bounce" />
            <p className="text-sm font-bold text-slate-800 font-display">Drop PDF contract here</p>
          </div>
        </div>
      )}

      {/* Technology stack section */}
      <section id="tech-stack" className="max-w-6xl mx-auto px-8 py-24 border-t border-slate-200/50 select-none">
        <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
          <p className="text-[10px] font-bold tracking-widest text-indigo-650 uppercase font-display">
            Under The Hood
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-display">
            Technology Stack We Used
          </h2>
          <p className="text-xs text-slate-700 font-bold font-sans">
            Built using modern, enterprise packages to guarantee exceptional frontend reactivity and lightning-fast analysis processing.
          </p>
        </div>

        {/* Bento Grid layout with colored logos by default */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TypeScript — New official logo requested */}
          <div className="border-glow-card p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-[#3178c6] rounded flex items-end justify-end p-[10%] font-bold text-white text-[20px] font-sans leading-none select-none">
                TS
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-800 font-display tracking-wider uppercase">TypeScript</h3>
              <p className="text-[11px] text-slate-700 leading-relaxed font-sans font-medium">
                Provides strict static typing to ensure client-side components remain robust and clean.
              </p>
            </div>
          </div>

          {/* Qdrant - Animated Vector Cluster */}
          <div className="border-glow-card p-6 md:col-span-2 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="space-y-2.5 flex-1">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2">
                <img src="/qdrant.png" alt="Qdrant" className="w-full h-full object-contain transition-all duration-300" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-800 font-display tracking-wider uppercase">Qdrant Vector Database</h3>
                <p className="text-[11px] text-slate-700 leading-relaxed font-sans font-medium">
                  Powers context retrieval through lightning-fast semantic searches on chunked contract embeddings.
                </p>
              </div>
            </div>
            {/* Visualizing Vector Dots */}
            <div className="w-36 h-36 bg-slate-50 border border-slate-200/50 rounded-xl relative overflow-hidden flex items-center justify-center flex-shrink-0 self-center">
              <svg className="w-32 h-32" viewBox="0 0 100 100">
                {/* Connections */}
                <line x1="20" y1="30" x2="50" y2="20" stroke="rgba(79, 70, 229, 0.15)" strokeWidth="1" />
                <line x1="50" y1="20" x2="80" y2="35" stroke="rgba(79, 70, 229, 0.15)" strokeWidth="1" />
                <line x1="20" y1="30" x2="35" y2="65" stroke="rgba(79, 70, 229, 0.15)" strokeWidth="1" />
                <line x1="35" y1="65" x2="70" y2="75" stroke="rgba(79, 70, 229, 0.15)" strokeWidth="1" />
                <line x1="80" y1="35" x2="70" y2="75" stroke="rgba(79, 70, 229, 0.15)" strokeWidth="1" />
                <line x1="50" y1="20" x2="45" y2="45" stroke="rgba(79, 70, 229, 0.2)" strokeWidth="1" />
                <line x1="45" y1="45" x2="35" y2="65" stroke="rgba(79, 70, 229, 0.2)" strokeWidth="1" />
                <line x1="45" y1="45" x2="70" y2="75" stroke="rgba(79, 70, 229, 0.2)" strokeWidth="1" />

                {/* Nodes */}
                <circle cx="20" cy="30" r="3" fill="#4f46e5" className="animate-ping" style={{ animationDuration: '3s' }} />
                <circle cx="20" cy="30" r="3.5" fill="#4f46e5" />
                <circle cx="50" cy="20" r="2.5" fill="#3b82f6" className="animate-pulse" style={{ animationDuration: '2s' }} />
                <circle cx="80" cy="35" r="3" fill="#4f46e5" />
                <circle cx="35" cy="65" r="4" fill="#10b981" className="animate-ping" style={{ animationDuration: '4s' }} />
                <circle cx="35" cy="65" r="4.5" fill="#10b981" />
                <circle cx="70" cy="75" r="3" fill="#4f46e5" />
                <circle cx="45" cy="45" r="2" fill="#3b82f6" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-100/90 via-transparent to-transparent flex items-end justify-center pb-1.5 text-[8px] font-bold text-slate-650 uppercase tracking-widest">
                VECTOR CLUSTER
              </div>
            </div>
          </div>

          {/* Mastra */}
          <div className="border-glow-card p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2.5">
              <img src="/mastra.png" alt="Mastra" className="w-full h-full object-contain transition-all duration-300" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-800 font-display tracking-wider uppercase">Mastra</h3>
              <p className="text-[11px] text-slate-700 leading-relaxed font-sans font-medium">
                Orchestrates agent task transitions, tool chains, and context variables seamlessly.
              </p>
            </div>
          </div>

          {/* Node.js */}
          <div className="border-glow-card p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2.5">
              <img src="/nodejs.png" alt="Node.js" className="w-full h-full object-contain transition-all duration-300" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-800 font-display tracking-wider uppercase">Node.js Backend</h3>
              <p className="text-[11px] text-slate-700 leading-relaxed font-sans font-medium">
                Runs scalable back-end services to extract document text, tokenise clauses, and direct API logic.
              </p>
            </div>
          </div>

          {/* Enkrypt AI - Wide / Full width with animated shield */}
          <div className="border-glow-card p-6 md:col-span-3 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="space-y-2.5 flex-1">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2">
                <img src="/enkrypt.png" alt="Enkrypt AI" className="w-full h-full object-contain transition-all duration-300" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-800 font-display tracking-wider uppercase">Enkrypt AI LLM Guardrails</h3>
                <p className="text-[11px] text-slate-700 leading-relaxed font-sans font-medium">
                  Guards user prompts and retrieval contexts with enterprise grade filters, preventing prompt injections and keeping legal intellectual property secure.
                </p>
              </div>
            </div>
            {/* Animated Shield */}
            <div className="w-44 h-32 bg-slate-50 border border-slate-200/50 rounded-xl relative overflow-hidden flex items-center justify-center flex-shrink-0 self-center">
              {/* Particle beam behind shield */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent top-[30%] opacity-20 animate-[scanLaser_2.5s_infinite]" />
              <svg className="w-20 h-20 text-indigo-650 z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="stroke-indigo-650" />
                <path d="M12 6v12M8 10h8M9 13h6" className="stroke-indigo-500 animate-pulse" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-100/90 via-transparent to-transparent flex items-end justify-center pb-1.5 text-[8px] font-bold text-slate-650 uppercase tracking-widest">
                ENKRYPT GUARD
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blueprint Section: How It Works */}
      <section id="blueprint" className="max-w-6xl mx-auto px-8 py-24 border-t border-slate-200/50 select-none">
        <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
          <p className="text-[10px] font-bold tracking-widest text-indigo-650 uppercase font-display">
            Interactive Architecture
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-display">
            How It Works
          </h2>
          <p className="text-xs text-slate-700 font-bold font-sans">
            Our step-by-step pipeline parses intent, applies guardrails, queries vector indices, and checks compliance.
          </p>
        </div>

        {/* Live horizontal data pipe flow */}
        <div className="w-full bg-white border border-slate-200 shadow-xl rounded-3xl p-8 relative overflow-hidden flex flex-col gap-10">
          <div className="absolute top-0 right-0 w-[250px] h-[250px] rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full bg-cyan-500/5 blur-[80px] pointer-events-none" />

          {/* Node timeline container */}
          <div className="relative flex items-center justify-between w-full z-10 flex-col md:flex-row gap-6 md:gap-2">
            {/* Horizontal pipe track line */}
            <div className="absolute top-[32px] left-[5%] right-[5%] h-[2.5px] bg-slate-200 -z-10 hidden md:block">
              {/* Traveling light particle */}
              <motion.div
                className="absolute top-[-4.5px] w-3 h-3 rounded-full bg-indigo-600 shadow-[0_0_10px_#4f46e5,0_0_18px_#3b82f6] pulse-particle"
                animate={{
                  left: `${(currentStepIndex / 5) * 100}%`
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                style={{ transform: "translateX(-50%)" }}
              />
            </div>

            {blueprintSteps.map((step, idx) => {
              const active = currentStepIndex === idx;
              const StepIcon = step.icon;

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setActiveStep("idle");
                    setAmbientStep(idx);
                  }}
                  className="flex flex-col items-center gap-2 bg-transparent border-0 cursor-pointer focus:outline-none w-full md:w-32 group"
                >
                  <motion.div
                    animate={{
                      scale: active ? 1.08 : 1,
                      borderColor: active ? "#4f46e5" : "rgba(226, 232, 240, 0.8)",
                      backgroundColor: active ? "rgba(79,70,229,0.08)" : "#FFFFFF"
                    }}
                    className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${
                      active ? "shadow-[0_0_15px_rgba(79,70,229,0.2)]" : "group-hover:border-slate-300"
                    }`}
                  >
                    <StepIcon size={20} className={active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-700"} />
                  </motion.div>
                  <span className={`text-[10px] font-bold tracking-wider uppercase font-display text-center ${active ? "text-indigo-650" : "text-slate-500"}`}>
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Micro-UI Card detail viewer representing the active node state */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8 items-center">
            {/* Info details */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-indigo-50 border border-indigo-150 text-indigo-700 text-[9px] font-bold uppercase tracking-wider">
                {currentStep.label}
              </div>
              <h3 className="text-lg font-bold text-slate-800 font-display uppercase tracking-wide">
                {currentStep.title} processing state
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-sans font-semibold max-w-md">
                {currentStep.desc} Active nodes capture contexts, sanitise injection payloads, query vector similarities, and stream formatted structured reviews.
              </p>
            </div>

            {/* Micro-UI mockup block (crisp dark slate block for beautiful visual balance) */}
            <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-4.5 min-h-[170px] flex flex-col font-mono text-[10px] leading-relaxed text-slate-400 relative overflow-hidden select-none">
              <div className="absolute top-0 right-0 p-2 text-[8px] font-bold text-slate-650 uppercase tracking-widest">
                LIVE PIPELINE SNAPSHOT
              </div>
              
              <AnimatePresence mode="wait">
                {currentStep.id === "intent" && (
                  <motion.div
                    key="intent-ui"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1.5"
                  >
                    <p className="text-emerald-400 font-bold">&gt; INGESTION MODULE ACTIVATED</p>
                    <p className="text-slate-500">Reading binary PDF Stream...</p>
                    <p className="text-slate-300">File: commercial_lease_v2.pdf [1,248,930 bytes]</p>
                    <p className="text-slate-500">Checking document integrity...</p>
                    <p className="text-emerald-400">&gt; SUCCESS: 14 pages extracted. Ready for prompt boundaries.</p>
                  </motion.div>
                )}

                {currentStep.id === "guard" && (
                  <motion.div
                    key="guard-ui"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1.5"
                  >
                    <p className="text-indigo-400 font-bold">&gt; ENKRYPT PROMPT GUARD SHIELD ACTIVE</p>
                    <p className="text-slate-500">Scanning for prompt injections, jailbreaks, and toxicity...</p>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      <span>[SAFE] Toxicity score: 0.003 (Compliance boundary: &lt; 0.05)</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      <span>[SAFE] Prompt Injection probability: 0.0001% (Boundary: Passed)</span>
                    </div>
                    <p className="text-indigo-400">&gt; VERDICT: Prompt accepted. Scanning Retrieval Context.</p>
                  </motion.div>
                )}

                {currentStep.id === "retrieval" && (
                  <motion.div
                    key="retrieval-ui"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1.5"
                  >
                    <p className="text-cyan-400 font-bold">&gt; QDRANT RETRIEVAL MATRIX QUERYING</p>
                    <p className="text-slate-500">Converting query into vector embeddings...</p>
                    <p className="text-slate-300">Matches found in 14.8ms:</p>
                    <p className="text-slate-400">• Clause 12.1 (Indemnity): score 0.942 similarity</p>
                    <p className="text-slate-400">• Clause 14.2 (Termination Notice): score 0.887 similarity</p>
                    <p className="text-cyan-400">&gt; SUCCESS: Context injection vector payload size: 2,048 tokens.</p>
                  </motion.div>
                )}

                {currentStep.id === "agent" && (
                  <motion.div
                    key="agent-ui"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1.5"
                  >
                    <p className="text-indigo-400 font-bold">&gt; MASTRA LLM ORCHESTRATION ENGINE</p>
                    <p className="text-slate-500">Injecting contextual data and instructing system prompt...</p>
                    <p className="text-slate-300">Agent feedback stream:</p>
                    <p className="text-slate-200">"Analyzing the extracted context. The agreement contains an uncapped liability clause under section 12..."</p>
                    <p className="text-indigo-400">&gt; RUNNING: Hallucination score: 0.01 (Low). Relevancy: 0.99 (High).</p>
                  </motion.div>
                )}

                {currentStep.id === "risk" && (
                  <motion.div
                    key="risk-ui"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1.5"
                  >
                    <p className="text-rose-400 font-bold">&gt; RISK ANALYZER THREAT CLASSIFIED</p>
                    <p className="text-slate-500">Evaluating liabilities, clauses, and warranties...</p>
                    <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/20 p-1.5 rounded">
                      <span className="text-rose-400 font-bold">Uncapped Indemnity Clause</span>
                      <span className="text-[8px] bg-rose-500 text-white font-bold px-1 rounded">CRITICAL RISK</span>
                    </div>
                    <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-1.5 rounded">
                      <span className="text-amber-400 font-bold">Automatic 90-Day Renewal</span>
                      <span className="text-[8px] bg-amber-500 text-white font-bold px-1 rounded">WARNING</span>
                    </div>
                  </motion.div>
                )}

                {currentStep.id === "formatter" && (
                  <motion.div
                    key="formatter-ui"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1"
                  >
                    <p className="text-slate-550">// Structured output JSON formatted payload</p>
                    <p className="text-slate-300">{"{"}</p>
                    <p className="text-slate-300">&nbsp;&nbsp;&quot;document_name&quot;: &quot;lease_v2.pdf&quot;,</p>
                    <p className="text-slate-300">&nbsp;&nbsp;&quot;risk_score&quot;: 8.2,</p>
                    <p className="text-slate-300">&nbsp;&nbsp;&quot;critical_liabilities&quot;: true,</p>
                    <p className="text-slate-300">&nbsp;&nbsp;&quot;action_required&quot;: &quot;Audit Clause 12.1&quot;</p>
                    <p className="text-slate-300">{"}"}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 py-8 text-center text-[10px] text-slate-500 select-none uppercase tracking-widest font-semibold font-display">
        © 2026 Lexora AI • Designed For Legal Intelligence
      </footer>
    </div>
  );
}
