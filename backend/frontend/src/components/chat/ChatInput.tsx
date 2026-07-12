import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, AlignLeft, MoreHorizontal } from "lucide-react";
import Magnetic from "../common/Magnetic";

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [volumeLevels, setVolumeLevels] = useState<number[]>([1, 1, 1, 1, 1]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 32;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsRecording(true);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Map frequency data to 5 volume bars
        const newLevels = Array.from({ length: 5 }).map((_, idx) => {
          const val = dataArray[Math.floor(idx * (bufferLength / 5))] || 0;
          return 0.3 + (val / 255) * 2.2; // scale factor between 0.3 and 2.5
        });
        setVolumeLevels(newLevels);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.warn("Mic access denied, falling back to simulated soundwave", err);
      setIsRecording(true);
      let step = 0;
      const simulatedLoop = () => {
        step += 0.15;
        setVolumeLevels([
          0.3 + Math.abs(Math.sin(step)) * 1.5,
          0.2 + Math.abs(Math.cos(step * 1.4)) * 1.8,
          0.5 + Math.abs(Math.sin(step * 2.1)) * 2.2,
          0.2 + Math.abs(Math.cos(step * 1.1)) * 1.6,
          0.4 + Math.abs(Math.sin(step * 1.7)) * 1.9,
        ]);
        animationFrameRef.current = requestAnimationFrame(simulatedLoop);
      };
      simulatedLoop();
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setVolumeLevels([1, 1, 1, 1, 1]);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const submit = () => {
    const t = value.trim();
    if (!t || disabled) return;
    onSend(t);
    setValue("");
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="space-y-3">
      {/* Main input bar */}
      <motion.div
        animate={{
          borderColor: focused ? "rgba(79,70,229,0.5)" : "rgba(0, 0, 0, 0.08)",
          boxShadow: focused ? "0 0 16px rgba(79,70,229,0.1)" : "0 0 0px rgba(79,70,229,0)",
        }}
        className="flex items-end gap-3 px-4 py-3 rounded-2xl transition-all duration-300"
        style={{
          background: "#FFFFFF",
          border: "1px solid",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Custom animated placeholder */}
        <div className="relative flex-1">
          <textarea
            ref={ref}
            value={value}
            rows={1}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            className="w-full bg-transparent text-sm text-slate-800 resize-none outline-none leading-relaxed pt-0.5"
            style={{ maxHeight: 100 }}
          />
          <AnimatePresence>
            {!value && !focused && (
              <motion.span
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -22 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute left-0 top-0.5 text-sm text-slate-400 pointer-events-none select-none font-sans"
              >
                Ask anything about your contract…
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.08 }}
          onClick={submit}
          disabled={!value.trim() || disabled}
          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center disabled:opacity-30 transition-all cursor-pointer"
          style={{
            background: value.trim() ? "rgba(79,70,229,0.12)" : "rgba(0,0,0,0.02)",
            border: `1px solid ${value.trim() ? "rgba(79,70,229,0.25)" : "rgba(0,0,0,0.05)"}`,
          }}
        >
          <Send size={13} className={value.trim() ? "text-indigo-600" : "text-slate-400"} />
        </motion.button>
      </motion.div>

      {/* Bottom dock */}
      <div className="flex items-center justify-between px-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
          style={{ background: "rgba(0,0,0,0.015)", border: "1px solid rgba(0,0,0,0.04)" }}
        >
          <AlignLeft size={16} className="text-slate-500" />
        </motion.button>

        <div className="flex-shrink-0">
          <Magnetic pullRange={0.25}>
            <motion.button
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.05 }}
              onClick={toggleRecording}
              className="h-14 flex items-center justify-center shadow-md cursor-pointer"
              animate={{
                width: isRecording ? 96 : 56,
                borderRadius: isRecording ? "24px" : "9999px",
                background: isRecording
                  ? "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(244,63,94,0.15))"
                  : "linear-gradient(135deg, rgba(79,70,229,0.12), rgba(99,102,241,0.12))",
                borderColor: isRecording ? "rgba(239,68,68,0.3)" : "rgba(79,70,229,0.25)",
                boxShadow: isRecording ? "0 4px 15px rgba(239,68,68,0.15)" : "0 4px 15px rgba(79,70,229,0.08)",
              }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
              {isRecording ? (
                <div className="flex items-center justify-center gap-1 h-6 px-3">
                  {volumeLevels.map((lvl, idx) => (
                    <motion.div
                      key={idx}
                      className="w-0.5 rounded-full bg-rose-500"
                      animate={{ height: lvl * 8 }}
                      transition={{ type: "spring", stiffness: 350, damping: 12 }}
                      style={{ width: "3px", minHeight: "4px" }}
                    />
                  ))}
                </div>
              ) : (
                <Mic size={20} className="text-indigo-650" />
              )}
            </motion.button>
          </Magnetic>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
          style={{ background: "rgba(0,0,0,0.015)", border: "1px solid rgba(0,0,0,0.04)" }}
        >
          <MoreHorizontal size={16} className="text-slate-500" />
        </motion.button>
      </div>
    </div>
  );
}
