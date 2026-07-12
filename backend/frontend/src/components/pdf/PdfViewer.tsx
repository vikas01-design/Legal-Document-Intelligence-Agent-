import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, X } from "lucide-react";

interface Props {
  url?: string;
  isScanning?: boolean;
  onClose?: () => void;
}

export default function PdfViewer({ url, isScanning, onClose }: Props) {
  const [zoom, setZoom] = useState(100);

  const zoomIn  = () => setZoom((z) => Math.min(z + 25, 200));
  const zoomOut = () => setZoom((z) => Math.max(z - 25, 50));

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-12 text-center glass-panel relative overflow-hidden">
        {isScanning ? (
          <>
            {/* Tech grid background */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: "linear-gradient(rgba(79, 70, 229, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(79, 70, 229, 0.15) 1px, transparent 1px)",
                backgroundSize: "20px 20px"
              }}
            />
            
            {/* Laser line */}
            <div
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_#4f46e5] pointer-events-none"
              style={{
                animation: "scanLaser 3s ease-in-out infinite"
              }}
            />

             {/* Icon */}
            <motion.div
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 z-10"
            >
              <FileText size={24} className="text-indigo-650" />
            </motion.div>
            
            <p className="text-sm text-slate-500 font-sans z-10 animate-pulse font-medium">
              Analyzing and indexing your document…
            </p>
          </>
        ) : (
          <>
            <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200">
              <FileText size={24} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 font-sans font-medium">
              Upload a PDF contract to preview it here
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col h-full glass-panel overflow-hidden"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-slate-500">
            <FileText size={14} className="text-slate-400" />
            <span className="text-xs font-semibold truncate max-w-[200px] font-sans">
              {url.split("/").pop() ?? "Document"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={zoomOut}
              disabled={zoom <= 50}
              aria-label="Zoom out"
              className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200/50 disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ZoomOut size={13} />
            </button>
            <span className="text-xs text-slate-500 w-10 text-center font-mono font-medium">
              {zoom}%
            </span>
            <button
              onClick={zoomIn}
              disabled={zoom >= 200}
              aria-label="Zoom in"
              className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200/50 disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ZoomIn size={13} />
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open in new tab"
              className="ml-1 h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <Maximize2 size={13} />
            </a>
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close document"
                className="ml-1.5 h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* PDF iframe */}
        <div className="flex-1 overflow-auto bg-slate-100 relative">
          <div
            style={{ width: `${zoom}%`, minWidth: "100%" }}
            className="h-full transition-all duration-200 origin-top"
          >
            <iframe
              src={url}
              title="PDF Viewer"
              className="w-full h-full border-none bg-white"
              style={{ minHeight: 500 }}
            />
          </div>

          {/* Scanning HUD Overlay */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-indigo-500/5 backdrop-blur-[1px] pointer-events-none flex flex-col items-center justify-center overflow-hidden z-20"
              >
                {/* Tech grid background */}
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: "linear-gradient(rgba(79, 70, 229, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(79, 70, 229, 0.15) 1px, transparent 1px)",
                    backgroundSize: "20px 20px"
                  }}
                />

                {/* Scanning sweep laser line */}
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_#4f46e5]"
                  style={{
                    animation: "scanLaser 3s ease-in-out infinite"
                  }}
                />

                 {/* Futuristic HUD label */}
                <div className="px-5 py-2.5 rounded-xl border border-indigo-100 bg-white shadow-xl flex items-center gap-2.5 z-30">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-650"></span>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest font-display">
                    Scanning Document…
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer nav (placeholder for multi-page) */}
        <div className="flex items-center justify-center gap-3 px-4 py-2.5 border-t border-slate-200 bg-slate-50">
          <button aria-label="Previous page" className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200/50 transition-colors cursor-pointer">
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-slate-500 font-sans font-medium">Page 1</span>
          <button aria-label="Next page" className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200/50 transition-colors cursor-pointer">
            <ChevronRight size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
