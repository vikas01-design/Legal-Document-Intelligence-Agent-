import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle2, X, AlertCircle } from "lucide-react";
import api from "../../services/api";

import Magnetic from "../common/Magnetic";

interface Props {
  onUploaded?: (url: string, file: File) => void;
  onScanningState?: (scanning: boolean) => void;
}

export default function UploadCard({ onUploaded, onScanningState }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (f: File | null) => {
    if (!f) return;
    if (f.type !== "application/pdf") { setStatus("error"); setMsg("PDF files only."); return; }
    setFile(f); setStatus("idle"); setMsg("");
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    pick(e.dataTransfer.files[0] ?? null);
  }, []);

  const upload = async () => {
    if (!file) return;
    setLoading(true); setStatus("idle");
    onScanningState?.(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post("/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
      setStatus("success"); setMsg(`${res.data.chunks} chunks indexed`);
      
      const localUrl = URL.createObjectURL(file);
      onUploaded?.(localUrl, file);
    } catch {
      setStatus("error"); setMsg("Upload failed");
    } finally {
      setLoading(false);
      onScanningState?.(false);
    }
  };

  const clear = () => { setFile(null); setStatus("idle"); setMsg(""); if (inputRef.current) inputRef.current.value = ""; };

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold px-1 font-display">
        Document
      </p>

      {/* Drop zone */}
      <motion.div
        animate={{
          borderColor: dragging
            ? "rgba(79,70,229,0.6)"
            : file
            ? "rgba(79,70,229,0.25)"
            : "rgba(226,232,240,0.9)",
          background: dragging
            ? "rgba(79,70,229,0.05)"
            : "#FFFFFF",
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="relative rounded-2xl border p-5 cursor-pointer transition-all border-slate-200 shadow-sm hover:border-indigo-400"
      >
        <input ref={inputRef} type="file" accept=".pdf" className="hidden"
          onChange={(e) => pick(e.target.files?.[0] ?? null)} />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 font-semibold truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); clear(); }}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={13} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 py-4"
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200">
                <Upload size={18} className="text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 text-center font-sans">
                Drop PDF here or <span className="text-indigo-600 font-semibold">browse</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Status */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl ${
              status === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-55 text-rose-700 border border-rose-200"
            }`}
          >
            {status === "success" ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
            {msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload button */}
      <Magnetic>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={upload}
          disabled={!file || loading}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 cursor-pointer shadow-sm"
          style={{
            background: "linear-gradient(135deg, rgba(79,70,229,0.1), rgba(99,102,241,0.1))",
            border: "1px solid rgba(79,70,229,0.25)",
            color: "#4f46e5",
          }}
        >
          {loading ? "Uploading…" : "Upload & Index"}
        </motion.button>
      </Magnetic>
    </div>
  );
}
