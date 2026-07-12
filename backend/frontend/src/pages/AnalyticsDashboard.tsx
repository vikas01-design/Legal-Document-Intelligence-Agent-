import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  FileText,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Send,
  Check,
  RotateCw,
  TrendingUp,
  AlertTriangle,
  HelpCircle
} from "lucide-react";
import type { HistoryItem } from "./Home";
import type { ChatMessage } from "../types/chat";

interface AnalyticsDashboardProps {
  history: HistoryItem[];
  activeMessages: ChatMessage[];
  sessionTimeMs: number;
  cumulativeQueries: number;
  cumulativeContracts: number;
}

interface FeedbackState {
  rating: "up" | "down" | null;
  comment: string;
  submitted: boolean;
  isSubmitting: boolean;
}

export default function AnalyticsDashboard({
  history,
  activeMessages,
  sessionTimeMs,
  cumulativeQueries,
  cumulativeContracts
}: AnalyticsDashboardProps) {
  // --- STATE FOR MOCK DATA / TIME RANGE ---
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredSparkPoint, setHoveredSparkPoint] = useState<number | null>(null);
  const [hoveredDonutSegment, setHoveredDonutSegment] = useState<number | null>(null); // null, 0, 1, 2
  const [hoveredRiskSegment, setHoveredRiskSegment] = useState<string | null>(null); // null, "high", "medium", "low"
  
  // Feedback state
  const [feedback, setFeedback] = useState<FeedbackState>(() => {
    try {
      const saved = localStorage.getItem("lexora_analytics_feedback");
      return saved ? JSON.parse(saved) : { rating: null, comment: "", submitted: false, isSubmitting: false };
    } catch {
      return { rating: null, comment: "", submitted: false, isSubmitting: false };
    }
  });

  // --- DERIVED METRICS ---
  const liveMetrics = useMemo(() => {
    const totalIndexed = history.length;
    const totalUserQueries = history.reduce(
      (sum, item) => sum + (item.chatMessages?.filter((m) => m.role === "user").length || 0),
      0
    );
    const totalRisksFound = history.reduce((sum, item) => sum + (item.risks?.length || 0), 0);
    const highRisks = history.reduce((sum, item) => sum + (item.risks?.filter((r) => r.level === "High").length || 0), 0);
    const mediumRisks = history.reduce((sum, item) => sum + (item.risks?.filter((r) => r.level === "Medium").length || 0), 0);
    const lowRisks = history.reduce((sum, item) => sum + (item.risks?.filter((r) => r.level === "Low").length || 0), 0);

    return {
      totalIndexed,
      totalUserQueries,
      totalRisksFound,
      highRisks,
      mediumRisks,
      lowRisks
    };
  }, [history]);

  // Live trackers derived from parent states
  const seededContracts = cumulativeContracts;
  const seededQueries = cumulativeQueries;
  const seededHighRisks = 8 + liveMetrics.highRisks;
  const seededMediumRisks = 14 + liveMetrics.mediumRisks;
  const seededLowRisks = 22 + liveMetrics.lowRisks;
  const totalSeededRisks = seededHighRisks + seededMediumRisks + seededLowRisks;

  // Active Session Time formatted ticking
  const formattedSessionTime = useMemo(() => {
    const totalSecs = Math.floor(sessionTimeMs / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return {
      decimal: (sessionTimeMs / (3600 * 1000)).toFixed(3),
      ticking: `${hrs}h ${mins}m ${secs}s`
    };
  }, [sessionTimeMs]);

  // Daily activity details for 7-day sparkline (Hours spent per day, Mon-Sun)
  // Dynamically adds ticking session hours to today (Sunday)
  const dailyActivity7d = useMemo(() => {
    const currentSessionHours = (sessionTimeMs - 15120000) / (3600 * 1000);
    const todayExtra = Math.max(0, currentSessionHours);
    return [
      { day: "Monday", hours: 0.5, label: "30m" },
      { day: "Tuesday", hours: 0.8, label: "48m" },
      { day: "Wednesday", hours: 0.4, label: "24m" },
      { day: "Thursday", hours: 1.3, label: "1h 18m" },
      { day: "Friday", hours: 0.9, label: "54m" },
      { day: "Saturday", hours: 0.2, label: "12m" },
      { day: "Sunday", hours: Math.round((0.1 + todayExtra) * 100) / 100, label: `${Math.round((0.1 + todayExtra) * 60)}m` }
    ];
  }, [sessionTimeMs]);

  // 30d activity (seeded list of hours + live shift)
  const dailyActivity30d = useMemo(() => {
    const currentSessionHours = (sessionTimeMs - 15120000) / (3600 * 1000);
    const todayExtra = Math.max(0, currentSessionHours);
    return Array.from({ length: 30 }, (_, i) => {
      const seedVals = [0.3, 0.5, 0.8, 1.2, 0.4, 0.1, 0.0, 0.6, 0.9, 1.4, 0.5, 0.2, 0.3, 0.7, 1.1, 1.5, 0.8, 0.3, 0.1, 0.5, 0.9, 1.3, 0.6, 0.2, 0.0, 0.4, 0.8, 1.2, 0.7, 0.3];
      const val = seedVals[i % seedVals.length] + (i === 29 ? todayExtra : 0);
      return {
        day: `Day ${i + 1}`,
        hours: Math.round(val * 10) / 10,
        label: `${Math.round(val * 60)}m`
      };
    });
  }, [sessionTimeMs]);

  const activeActivity = timeRange === "7d" ? dailyActivity7d : dailyActivity30d;

  // Concept query distribution percentages (dynamically parsed by message and risk keywords)
  const conceptData = useMemo(() => {
    const allUserMessages = [
      ...activeMessages,
      ...history.flatMap((item) => item.chatMessages || [])
    ].filter((m) => m.role === "user");

    let termCount = 20; // baseline
    let payCount = 18;
    let indemCount = 12;

    // Helper function to scan text for explicit legal keywords
    const matchLegalConcept = (text: string): "termination" | "payment" | "indemnification" | null => {
      const cleanText = text.toLowerCase();
      if (cleanText.includes("terminate") || cleanText.includes("breach")) {
        return "termination";
      }
      if (cleanText.includes("pay") || cleanText.includes("invoice")) {
        return "payment";
      }
      if (cleanText.includes("indemnity") || cleanText.includes("indemnify") || cleanText.includes("liability") || cleanText.includes("claim")) {
        return "indemnification";
      }
      return null;
    };

    allUserMessages.forEach((msg) => {
      const concept = matchLegalConcept(msg.text);
      if (concept === "termination") {
        termCount += 1;
      } else if (concept === "payment") {
        payCount += 1;
      } else if (concept === "indemnification") {
        indemCount += 1;
      }
    });

    const allRisks = [
      ...(history.flatMap((item) => item.risks || [])),
      ...((history.find(h => h.id === history[0]?.id)?.risks) || []) // active risks
    ];
    allRisks.forEach((risk) => {
      const concept = matchLegalConcept(risk.title + " " + risk.description);
      if (concept === "termination") {
        termCount += 1;
      } else if (concept === "payment") {
        payCount += 1;
      } else if (concept === "indemnification") {
        indemCount += 1;
      }
    });

    const total = termCount + payCount + indemCount;
    const termPct = Math.round((termCount / total) * 100);
    const payPct = Math.round((payCount / total) * 100);
    const indemPct = 100 - (termPct + payPct);

    return [
      { name: "Termination Rules", percentage: termPct, queries: termCount, color: "#6366f1" },
      { name: "Payment Terms", percentage: payPct, queries: payCount, color: "#a855f7" },
      { name: "Indemnification", percentage: indemPct, queries: indemCount, color: "#ec4899" }
    ];
  }, [history, activeMessages]);

  // Refresh trigger simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  // Submit Feedback Handler
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.rating) return;

    setFeedback((prev) => ({ ...prev, isSubmitting: true }));

    setTimeout(() => {
      const updated = {
        rating: feedback.rating,
        comment: feedback.comment,
        submitted: true,
        isSubmitting: false
      };
      setFeedback(updated);
      localStorage.setItem("lexora_analytics_feedback", JSON.stringify(updated));
      console.log("Lexora AI Feedback Received:", {
        rating: updated.rating,
        comment: updated.comment,
        submittedAt: new Date().toISOString()
      });
    }, 1000);
  };

  const handleFeedbackReset = () => {
    const reset = { rating: null, comment: "", submitted: false, isSubmitting: false };
    setFeedback(reset);
    localStorage.removeItem("lexora_analytics_feedback");
  };

  // --- SVG SPARKLINE PATH CALCULATOR ---
  const sparklinePath = useMemo(() => {
    const width = 360;
    const height = 45;
    const paddingX = 10;
    const paddingY = 8;
    const pointsCount = activeActivity.length;
    const maxVal = Math.max(...activeActivity.map((d) => d.hours), 1);

    const coords = activeActivity.map((item, index) => {
      const x = paddingX + (index / (pointsCount - 1)) * (width - 2 * paddingX);
      const y = height - paddingY - (item.hours / maxVal) * (height - 2 * paddingY);
      return { x, y };
    });

    // Build SVG Path
    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      // Control points for smooth bezier curves
      const cpX1 = curr.x + (next.x - curr.x) / 2;
      const cpY1 = curr.y;
      const cpX2 = curr.x + (next.x - curr.x) / 2;
      const cpY2 = next.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }

    // Build Area Path (closing the shape to fill gradient underneath)
    const areaPath = `${path} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

    return { path, areaPath, coords };
  }, [activeActivity]);

  // --- SVG DONUT CALCULATORS ---
  const donutRadius = 50;
  const donutCircumference = 2 * Math.PI * donutRadius; // ~314.16
  const donutSegments = useMemo(() => {
    let currentOffset = 0;
    return conceptData.map((concept) => {
      const strokeDashoffset = currentOffset;
      const strokeDasharray = `${(concept.percentage / 100) * donutCircumference} ${donutCircumference}`;
      currentOffset -= (concept.percentage / 100) * donutCircumference;
      return {
        ...concept,
        strokeDasharray,
        strokeDashoffset
      };
    });
  }, [conceptData, donutCircumference]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="flex-1 h-[calc(100%-24px)] my-3 mr-3 rounded-2xl overflow-hidden glass-panel flex flex-col z-10"
    >
      <div className="flex-1 h-full overflow-y-auto px-6 py-6 flex flex-col gap-6 bg-slate-50/20">
        
        {/* --- DASHBOARD HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 pb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-display text-slate-800 flex items-center gap-2">
              Analytics & Insights
              <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                Lexora AI v1.2
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Monitor legal concepts focus, risk distribution trends, and query interaction metrics.
            </p>
          </div>
          
          <div className="flex items-center gap-2.5">
            {/* Timeframe selector */}
            <div className="flex rounded-xl bg-white border border-slate-200 p-0.5 shadow-sm">
              <button
                onClick={() => setTimeRange("7d")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  timeRange === "7d"
                    ? "bg-indigo-50 text-indigo-600 shadow-sm border-slate-100 font-display"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-display"
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setTimeRange("30d")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  timeRange === "30d"
                    ? "bg-indigo-50 text-indigo-600 shadow-sm border-slate-100 font-display"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-display"
                }`}
              >
                Last 30 Days
              </button>
            </div>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all cursor-pointer shadow-sm relative group active:scale-95"
              title="Refresh analytics data"
            >
              <RotateCw size={15} className={`${isRefreshing ? "animate-spin text-indigo-600" : "transition-transform group-hover:rotate-12"}`} />
            </button>
          </div>
        </div>

        {/* --- SECTION 1: USAGE & ENGAGEMENT METRICS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Metric 1: Time Spent in Lexora AI */}
          <motion.div
            whileHover={{ y: -2, boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.05)" }}
            className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group min-h-[148px]"
          >
            {/* Subtle decoration glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-full -mr-6 -mt-6 pointer-events-none" />
            
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-display">
                  Weekly Session Time
                </span>
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-2xl font-bold font-display text-slate-800 tracking-tight">
                    {formattedSessionTime.decimal} Hours
                  </h3>
                  <span className="text-[10px] text-indigo-500 font-mono font-bold animate-pulse">
                    ⏱️ {formattedSessionTime.ticking} active
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Clock size={16} />
              </div>
            </div>

            {/* Sparkline Interactive Container */}
            <div className="mt-4 relative">
              <svg viewBox="0 0 360 45" className="w-full h-[45px] overflow-visible">
                <defs>
                  <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.00" />
                  </linearGradient>
                </defs>
                
                {/* Shaded Area Under Line */}
                <path d={sparklinePath.areaPath} fill="url(#sparkGradient)" />
                
                {/* Actual Line */}
                <path
                  d={sparklinePath.path}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Interactive Hover Dots */}
                {sparklinePath.coords.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredSparkPoint === i ? 5 : 2.5}
                    className="transition-all duration-150 cursor-pointer fill-indigo-600 stroke-white stroke-[1.5]"
                    onMouseEnter={() => setHoveredSparkPoint(i)}
                    onMouseLeave={() => setHoveredSparkPoint(null)}
                  />
                ))}
              </svg>

              {/* Sparkline Tooltip */}
              <AnimatePresence>
                {hoveredSparkPoint !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-12 bg-slate-800 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-md pointer-events-none flex flex-col items-center z-10"
                    style={{
                      left: `${(sparklinePath.coords[hoveredSparkPoint].x / 360) * 100}%`,
                      transform: "translateX(-50%)"
                    }}
                  >
                    <span className="opacity-80">{activeActivity[hoveredSparkPoint].day}</span>
                    <span className="font-bold text-indigo-355">{activeActivity[hoveredSparkPoint].hours} hrs ({activeActivity[hoveredSparkPoint].label})</span>
                    {/* Tooltip triangle indicator */}
                    <div className="w-1.5 h-1.5 bg-slate-800 rotate-45 mt-0.5 -mb-1" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2 font-medium font-sans">
              <span className="flex items-center gap-0.5 text-emerald-600 font-bold">
                <TrendingUp size={11} />
                +12.4%
              </span>
              <span>vs previous week</span>
            </div>
          </motion.div>

          {/* Metric 2: Total Contracts Processed */}
          <motion.div
            whileHover={{ y: -2, boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.05)" }}
            className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group min-h-[148px]"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-full -mr-6 -mt-6 pointer-events-none" />
            
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-display">
                  Contracts Indexed
                </span>
                <h3 className="text-2xl font-bold font-display text-slate-800">
                  {seededContracts} Total
                </h3>
              </div>
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-650">
                <FileText size={16} />
              </div>
            </div>

            {/* Details breakdown */}
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                <span>Indexation Health</span>
                <span className="text-indigo-600">100% Synced</span>
              </div>
              {/* Custom animated progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-medium font-sans">
              <span className="flex items-center gap-0.5 text-indigo-650 font-bold">
                +{liveMetrics.totalIndexed} uploaded recently
              </span>
              <span>Local DB sync: Ok</span>
            </div>
          </motion.div>

          {/* Metric 3: AI Query Count */}
          <motion.div
            whileHover={{ y: -2, boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.05)" }}
            className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group min-h-[148px]"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-pink-500/5 to-transparent rounded-full -mr-6 -mt-6 pointer-events-none" />
            
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-display">
                  AI Agent Queries
                </span>
                <h3 className="text-2xl font-bold font-display text-slate-800">
                  {seededQueries} Actions
                </h3>
              </div>
              <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
                <MessageSquare size={16} />
              </div>
            </div>

            {/* Simple custom bar visualizer */}
            <div className="flex items-end gap-1 h-8 mt-4 pt-1.5">
              {[35, 60, 45, 90, 75, 40, 80, 55, 70, 95].map((h, i) => (
                <div key={i} className="flex-1 bg-slate-100 rounded-sm h-full overflow-hidden flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.8, delay: i * 0.04 }}
                    className="w-full rounded-sm bg-pink-400/70 group-hover:bg-pink-500 transition-colors"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2 font-medium font-sans">
              <span className="flex items-center gap-0.5 text-emerald-600 font-bold">
                <TrendingUp size={11} />
                +18.2%
              </span>
              <span>vs average queries/day</span>
            </div>
          </motion.div>
          
        </div>

        {/* --- SECTION 2: FOCUS & DISTRIBUTION ANALYSIS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* "You Mostly Focused On" Panel - SVG Donut Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider font-display text-slate-700">
                  You Mostly Focused On
                </h3>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                  Top legal concepts queried across your conversation history.
                </p>
              </div>
              <span className="cursor-help" title="Based on semantic tagging of AI chats.">
                <HelpCircle size={14} className="text-slate-300" />
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
              
              {/* SVG Donut Chart with updating center text */}
              <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                  {donutSegments.map((seg, i) => {
                    const isHovered = hoveredDonutSegment === i;
                    return (
                      <circle
                        key={seg.name}
                        cx="60"
                        cy="60"
                        r={donutRadius}
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth={isHovered ? 14 : 10}
                        strokeDasharray={seg.strokeDasharray}
                        strokeDashoffset={seg.strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-200 cursor-pointer origin-center"
                        onMouseEnter={() => setHoveredDonutSegment(i)}
                        onMouseLeave={() => setHoveredDonutSegment(null)}
                      />
                    );
                  })}
                </svg>
                
                {/* Donut Center Label */}
                <div className="absolute text-center flex flex-col items-center justify-center select-none pointer-events-none w-24">
                  {hoveredDonutSegment === null ? (
                    <>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest font-display">
                        Top Area
                      </span>
                      <span className="text-sm font-bold font-display text-slate-800 leading-tight">
                        Termination
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        40% Focus
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        className="text-[9px] font-bold uppercase tracking-widest font-display"
                        style={{ color: conceptData[hoveredDonutSegment].color }}
                      >
                        Selected
                      </span>
                      <span className="text-xs font-bold font-display text-slate-800 truncate max-w-full leading-tight">
                        {conceptData[hoveredDonutSegment].name.split(" ")[0]}
                      </span>
                      <span className="text-[10px] text-slate-650 font-bold mt-0.5 font-sans">
                        {conceptData[hoveredDonutSegment].percentage}% ({conceptData[hoveredDonutSegment].queries} Qs)
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Legend with interactive progress bars */}
              <div className="flex-1 space-y-3 w-full">
                {conceptData.map((concept, i) => {
                  const isHovered = hoveredDonutSegment === i;
                  return (
                    <div
                      key={concept.name}
                      className={`p-2 rounded-xl transition-all duration-200 border cursor-pointer ${
                        isHovered ? "bg-slate-50 border-slate-200" : "border-transparent"
                      }`}
                      onMouseEnter={() => setHoveredDonutSegment(i)}
                      onMouseLeave={() => setHoveredDonutSegment(null)}
                    >
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: concept.color }} />
                          <span className="font-bold text-slate-700 font-display">{concept.name}</span>
                        </div>
                        <span className="font-bold text-slate-550 text-[11px] font-sans">
                          {concept.percentage}%
                        </span>
                      </div>
                      {/* Mini animated horizontal bar under legend label */}
                      <div className="w-full h-1.5 rounded-full bg-slate-100 mt-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${concept.percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: concept.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* Risk Severity Breakdown Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider font-display text-slate-700">
                  Risk Severity Breakdown
                </h3>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                  Total clauses flagged categorized by legal vulnerability level.
                </p>
              </div>
              <AlertTriangle size={14} className="text-slate-350" />
            </div>

            <div className="space-y-6 py-2">
              
              {/* Interactive Stacked Horizontal Bar Chart */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>Clause Risk Severity Distribution</span>
                  <span>{totalSeededRisks} Flags Active</span>
                </div>
                
                <div className="w-full h-8 rounded-xl bg-slate-100 flex overflow-hidden shadow-inner border border-slate-200/50">
                  {/* High Risks Segment (Rose) */}
                  <motion.div
                    onMouseEnter={() => setHoveredRiskSegment("high")}
                    onMouseLeave={() => setHoveredRiskSegment(null)}
                    className={`h-full bg-rose-500 hover:bg-rose-600 transition-all duration-200 cursor-pointer flex items-center justify-center text-white text-[10px] font-bold ${
                      hoveredRiskSegment === "high" ? "shadow-lg scale-y-110" : ""
                    }`}
                    style={{ width: `${(seededHighRisks / totalSeededRisks) * 100}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(seededHighRisks / totalSeededRisks) * 100}%` }}
                    transition={{ duration: 0.8 }}
                  >
                    {((seededHighRisks / totalSeededRisks) * 100) > 12 && `${seededHighRisks}`}
                  </motion.div>

                  {/* Medium Risks Segment (Amber) */}
                  <motion.div
                    onMouseEnter={() => setHoveredRiskSegment("medium")}
                    onMouseLeave={() => setHoveredRiskSegment(null)}
                    className={`h-full bg-amber-400 hover:bg-amber-500 transition-all duration-200 cursor-pointer flex items-center justify-center text-slate-800 text-[10px] font-bold ${
                      hoveredRiskSegment === "medium" ? "shadow-lg scale-y-110" : ""
                    }`}
                    style={{ width: `${(seededMediumRisks / totalSeededRisks) * 100}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(seededMediumRisks / totalSeededRisks) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                  >
                    {((seededMediumRisks / totalSeededRisks) * 100) > 12 && `${seededMediumRisks}`}
                  </motion.div>

                  {/* Low Risks Segment (Emerald) */}
                  <motion.div
                    onMouseEnter={() => setHoveredRiskSegment("low")}
                    onMouseLeave={() => setHoveredRiskSegment(null)}
                    className={`h-full bg-emerald-500 hover:bg-emerald-600 transition-all duration-200 cursor-pointer flex items-center justify-center text-white text-[10px] font-bold ${
                      hoveredRiskSegment === "low" ? "shadow-lg scale-y-110" : ""
                    }`}
                    style={{ width: `${(seededLowRisks / totalSeededRisks) * 100}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(seededLowRisks / totalSeededRisks) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    {((seededLowRisks / totalSeededRisks) * 100) > 12 && `${seededLowRisks}`}
                  </motion.div>
                </div>
              </div>

              {/* Risk details block */}
              <div className="grid grid-cols-3 gap-3">
                {/* High risk Card */}
                <div
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    hoveredRiskSegment === "high" ? "bg-rose-50 border-rose-200" : "bg-slate-50/50 border-slate-100"
                  }`}
                  onMouseEnter={() => setHoveredRiskSegment("high")}
                  onMouseLeave={() => setHoveredRiskSegment(null)}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider font-display">High Risk</span>
                  </div>
                  <h4 className="text-lg font-bold font-display text-slate-800 leading-none">{seededHighRisks}</h4>
                  <p className="text-[9px] text-slate-400 mt-1 leading-normal font-sans">Immediate revisions</p>
                </div>

                {/* Medium risk Card */}
                <div
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    hoveredRiskSegment === "medium" ? "bg-amber-50 border-amber-200" : "bg-slate-50/50 border-slate-100"
                  }`}
                  onMouseEnter={() => setHoveredRiskSegment("medium")}
                  onMouseLeave={() => setHoveredRiskSegment(null)}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider font-display">Medium Risk</span>
                  </div>
                  <h4 className="text-lg font-bold font-display text-slate-800 leading-none">{seededMediumRisks}</h4>
                  <p className="text-[9px] text-slate-400 mt-1 leading-normal font-sans">Review required</p>
                </div>

                {/* Low risk Card */}
                <div
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    hoveredRiskSegment === "low" ? "bg-emerald-50 border-emerald-200" : "bg-slate-50/50 border-slate-100"
                  }`}
                  onMouseEnter={() => setHoveredRiskSegment("low")}
                  onMouseLeave={() => setHoveredRiskSegment(null)}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider font-display">Low Risk</span>
                  </div>
                  <h4 className="text-lg font-bold font-display text-slate-800 leading-none">{seededLowRisks}</h4>
                  <p className="text-[9px] text-slate-400 mt-1 leading-normal font-sans">Standard warnings</p>
                </div>
              </div>

              {/* Micro details tooltip text */}
              <div className="text-[10px] text-slate-400 font-sans italic text-center h-4 flex items-center justify-center">
                {hoveredRiskSegment === "high" && "💡 High: Auto-renewal clauses without opt-out, high indemnification caps."}
                {hoveredRiskSegment === "medium" && "💡 Medium: Ambiguous payment schedules, non-standard dispute venues."}
                {hoveredRiskSegment === "low" && "💡 Low: Missing references to standard corporate entities, slight typo flags."}
                {hoveredRiskSegment === null && "Hover over segments to see insights on clause classifications."}
              </div>

            </div>
          </div>

        </div>

        {/* --- SECTION 3: FEEDBACK & OPTIMIZATION CARD --- */}
        <div className="mt-2 lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider font-display">
                  Insights Feedback
                </span>
              </div>
              <h3 className="text-sm font-bold font-display text-slate-800">
                Are these analytics helpful for your legal workflow?
              </h3>
              <p className="text-xs text-slate-500 font-sans leading-relaxed">
                We are constantly refining our Lexora intelligence engine. Tell us if these charts aid your contract checks, or request a custom metric you want our AI to track.
              </p>
            </div>

            {/* Feedback Form Card Container */}
            <div className="flex-shrink-0 w-full md:w-80 relative min-h-[120px] border border-slate-100 p-4 rounded-xl bg-slate-50/50">
              <AnimatePresence mode="wait">
                {!feedback.submitted ? (
                  <motion.form
                    key="feedback-form"
                    initial={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onSubmit={handleFeedbackSubmit}
                    className="space-y-3 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {/* Thumbs Up Button */}
                      <button
                        type="button"
                        onClick={() => setFeedback((prev) => ({ ...prev, rating: "up" }))}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          feedback.rating === "up"
                            ? "bg-indigo-50 border-indigo-200 text-indigo-650 shadow-sm"
                            : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-white"
                        }`}
                      >
                        <ThumbsUp size={13} className={`${feedback.rating === "up" ? "scale-110" : ""}`} />
                        Helpful
                      </button>
                      
                      {/* Thumbs Down Button */}
                      <button
                        type="button"
                        onClick={() => setFeedback((prev) => ({ ...prev, rating: "down" }))}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          feedback.rating === "down"
                            ? "bg-rose-50 border-rose-200 text-rose-650 shadow-sm"
                            : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-white"
                        }`}
                      >
                        <ThumbsDown size={13} className={`${feedback.rating === "down" ? "scale-110" : ""}`} />
                        Unhelpful
                      </button>
                    </div>

                    {/* Micro-text input for requests */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Request custom metrics or details..."
                        value={feedback.comment}
                        onChange={(e) => setFeedback((prev) => ({ ...prev, comment: e.target.value }))}
                        className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50 transition-all text-slate-800"
                      />
                    </div>

                    {/* Submit Action */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!feedback.rating || feedback.isSubmitting}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-display transition-all flex items-center gap-1.5 cursor-pointer ${
                          feedback.rating && !feedback.isSubmitting
                            ? "bg-indigo-600 hover:bg-indigo-750 text-white shadow-sm active:scale-95"
                            : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {feedback.isSubmitting ? (
                          <>
                            <RotateCw size={12} className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send size={12} />
                            Submit
                          </>
                        )}
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="feedback-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-2 space-y-2 h-full absolute inset-0 px-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
                      <Check size={16} className="stroke-[3]" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-850 font-display">Feedback Received!</h4>
                    <p className="text-[10px] text-slate-550 font-sans leading-normal">
                      Thank you! Our AI operations team has logged your feedback.
                    </p>
                    <button
                      onClick={handleFeedbackReset}
                      className="text-[9px] font-bold text-indigo-650 hover:underline cursor-pointer pt-1"
                    >
                      Reset and resubmit
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
      </div>
    </motion.div>
  );
}
