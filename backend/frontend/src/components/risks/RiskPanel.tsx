import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, RefreshCw } from "lucide-react";
import api from "../../services/api";
import type { Risk } from "../../types/risk";
import RiskCard from "./RiskCard";
import RiskSummary from "./RiskSummary";

import Magnetic from "../common/Magnetic";

interface RiskPanelProps {
  uploaded: boolean;
  hideTitle?: boolean;
  onScanningState?: (scanning: boolean) => void;
  risks: Risk[];
  setRisks: React.Dispatch<React.SetStateAction<Risk[]>>;
  isLegalDocument?: boolean;
  setIsLegalDocument?: (val: boolean) => void;
  documentType?: string;
  setDocumentType?: (val: string) => void;
}

export default function RiskPanel({
  uploaded,
  hideTitle,
  onScanningState,
  risks,
  setRisks,
  isLegalDocument = true,
  setIsLegalDocument,
  documentType = "Contract",
  setDocumentType
}: RiskPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizeLevel = (level: unknown) => {
    const text = String(level ?? "").trim().toLowerCase();
    if (text === "high") return "High" as const;
    if (text === "medium") return "Medium" as const;
    if (text === "low") return "Low" as const;
    return "Low" as const;
  };

  const normalizeRisk = (risk: any) => ({
    ...risk,
    level: normalizeLevel(risk.level),
  });

  const analyze = async () => {
    if (!uploaded) {
      setError("Upload a contract first, then analyze.");
      return;
    }

    setLoading(true);
    setError("");
    onScanningState?.(true);

    try {
      const res = await api.post("/analyze");
      const risks = res.data?.risks;
      const isLegal = res.data?.isLegalDocument !== false;
      const type = res.data?.documentType || "Contract";

      setIsLegalDocument?.(isLegal);
      setDocumentType?.(type);

      if (!Array.isArray(risks)) {
        throw new Error(
          "Unexpected analysis response format. Please try again or check the backend output."
        );
      }

      setRisks(risks.map(normalizeRisk));
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Analysis failed. Please try again after uploading a document.";
      setError(message);
      setRisks([]);
    } finally {
      setLoading(false);
      onScanningState?.(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {!hideTitle ? (
          <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold font-display">
            Risk Analysis
          </p>
        ) : <div />}
        <div className="w-auto">
          <Magnetic pullRange={0.25}>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={analyze}
              disabled={!uploaded || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 w-full justify-center cursor-pointer"
              style={{
                background: "rgba(244,63,94,0.08)",
                border: "1px solid rgba(244,63,94,0.25)",
                color: "#e11d48",
              }}
            >
              {loading
                ? <><RefreshCw size={11} className="animate-spin" /> Scanning…</>
                : <><ShieldAlert size={11} /> Analyze</>
              }
            </motion.button>
          </Magnetic>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {!loading && isLegalDocument === false && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 mb-4 flex gap-3 text-amber-800 text-xs shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
              <span className="text-base select-none">⚠️</span>
              <div className="space-y-1">
                <p className="font-bold font-display">Non-Legal Document Warning</p>
                <p className="text-amber-600 font-sans leading-relaxed">
                  This document does not resemble a legal contract (detected type: <strong>{documentType}</strong>). 
                  Compliance checks and risk summaries might be limited or inapplicable.
                </p>
              </div>
            </motion.div>
          )}

          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 gap-4"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-rose-500/25 animate-spin border-t-rose-500" />
                <ShieldAlert size={16} className="text-rose-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-xs text-slate-500 font-medium">AI scanning contract…</p>
            </motion.div>
          )}

          {!loading && error && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-8 text-xs text-rose-600 font-medium">
              {error}
            </motion.div>
          )}

          {!loading && !error && risks.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center">
                <ShieldAlert size={20} className="text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 font-medium max-w-[160px]">
                {uploaded
                  ? "Click Analyze to scan for risks"
                  : "Upload and index a PDF contract first."
                }
              </p>
            </motion.div>
          )}

          {!loading && !error && risks.length > 0 && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="space-y-1">
              <RiskSummary risks={risks} />
              {risks.map((r, i) => <RiskCard key={i} risk={r} index={i} />)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
