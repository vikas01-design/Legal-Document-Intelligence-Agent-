import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

type Mood = "idle" | "thinking" | "talking" | "happy";

interface Props {
  mood?: Mood;
  size?: number;
  pointing?: "left" | "right" | "none";
}

export default function LexBot({ mood = "idle", size = 220, pointing = "none" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const eyeX = useSpring(mouseX, { stiffness: 80, damping: 18 });
  const eyeY = useSpring(mouseY, { stiffness: 80, damping: 18 });
  const bodyRotateY = useSpring(0, { stiffness: 40, damping: 12 });
  const bodyRotateX = useSpring(0, { stiffness: 40, damping: 12 });

  const [blinking, setBlinking] = useState(false);

  // Random blink
  useEffect(() => {
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 180);
      setTimeout(blink, 2500 + Math.random() * 3000);
    };
    const t = setTimeout(blink, 1800);
    return () => clearTimeout(t);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (window.innerWidth / 2);
      const dy = (e.clientY - cy) / (window.innerHeight / 2);
      mouseX.set(dx * 4);
      mouseY.set(dy * 4);
      bodyRotateY.set(dx * 6);
      bodyRotateX.set(-dy * 4);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY, bodyRotateY, bodyRotateX]);

  const scale = size / 220;

  // Eye color based on mood
  const eyeColor =
    mood === "thinking" ? "#4f46e5"
    : mood === "happy"  ? "#10b981"
    : "#6366f1";

  const eyeGlow =
    mood === "thinking" ? "rgba(79,70,229,0.4)"
    : mood === "happy"  ? "rgba(16,185,129,0.4)"
    : "rgba(99,102,241,0.4)";

  // Arm angles based on pointing direction
  const leftArmRotate = pointing === "left" ? -85 : -12;
  const rightArmRotate = pointing === "right" ? 85 : 12;

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size }}
      className="relative select-none"
    >
      {/* 3D Tilted Orbital Rings when thinking */}
      {mood === "thinking" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          {/* Ring 1: Outer tilted indigo dash */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
            className="absolute border-2 border-dashed border-indigo-500/20 rounded-full"
            style={{
              width: size * 1.15,
              height: size * 0.45,
              transform: "rotateX(72deg) rotateY(15deg)",
            }}
          />
          {/* Ring 2: Inner counter-rotating ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
            className="absolute border border-indigo-400/15 rounded-full"
            style={{
              width: size * 1.3,
              height: size * 0.5,
              transform: "rotateX(66deg) rotateY(-20deg)",
            }}
          />
        </div>
      )}

      <motion.div
        className="w-full h-full"
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          rotateY: bodyRotateY,
          rotateX: bodyRotateX,
          transformStyle: "preserve-3d",
          perspective: 800,
        }}
      >
        {/* ── Torso shadow ─────────────────────────── */}
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-5 rounded-full"
        >
          <div className="w-full h-full rounded-full bg-indigo-500/10 blur-lg" />
        </div>

        {/* ── Ripple rings (idle) ─────────────── */}
        {mood === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[0, 0.8, 1.6].map((delay) => (
              <div
                key={delay}
                className="absolute rounded-full border border-indigo-500/10"
                style={{
                  width: 120 * scale,
                  height: 120 * scale,
                  animation: `ripple 3.2s ease-out ${delay}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        {/* ── Main SVG robot ─────────────────── */}
        <svg
          viewBox="0 0 220 220"
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Body gradient (editorial white/silver chrome) */}
            <radialGradient id="bodyGrad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f3f4f6" />
              <stop offset="100%" stopColor="#e5e7eb" />
            </radialGradient>
            {/* Torso top/belt gradient */}
            <linearGradient id="beltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            {/* Eye glow filter */}
            <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Body drop shadow */}
            <filter id="bodyShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#4f46e5" floodOpacity="0.08" />
            </filter>
            {/* Ear gradient */}
            <radialGradient id="earGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#a5b4fc" />
              <stop offset="100%" stopColor="#4f46e5" />
            </radialGradient>
            {/* Face panel gradient */}
            <linearGradient id="faceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <clipPath id="faceClip">
              <rect x="68" y="38" width="84" height="68" rx="16" />
            </clipPath>
          </defs>

          {/* ── Antenna ─────────────────────── */}
          <line x1="110" y1="38" x2="110" y2="22" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
          <circle
            cx="110" cy="17" r="6"
            fill={eyeColor}
            style={{ filter: `drop-shadow(0 0 6px ${eyeGlow})` }}
            className="antenna-pulse"
          />

          {/* ── Left ear ────────────────────── */}
          <ellipse cx="64" cy="78" rx="12" ry="16" fill="url(#earGrad)" filter="url(#bodyShadow)" />
          <ellipse cx="64" cy="78" rx="6" ry="9" fill="#4f46e5" opacity="0.5" />

          {/* ── Right ear ───────────────────── */}
          <ellipse cx="156" cy="78" rx="12" ry="16" fill="url(#earGrad)" filter="url(#bodyShadow)" />
          <ellipse cx="156" cy="78" rx="6" ry="9" fill="#4f46e5" opacity="0.5" />

          {/* ── Head body ───────────────────── */}
          <rect
            x="60" y="34" width="100" height="82" rx="28"
            fill="url(#bodyGrad)"
            filter="url(#bodyShadow)"
            className="body-glow"
          />

          {/* ── Face panel ──────────────────── */}
          <rect x="68" y="42" width="84" height="64" rx="14" fill="url(#faceGrad)" />

          {/* Scan line on face */}
          {mood === "thinking" && (
            <rect
              x="70" y="0" width="80" height="2"
              fill={eyeColor}
              opacity="0.6"
              clipPath="url(#faceClip)"
              style={{ animation: "scanLine 1.4s linear infinite" }}
            />
          )}

          {/* Corner brackets on face */}
          {["M72,46 L72,52 M72,46 L78,46", "M148,46 L148,52 M148,46 L142,46",
            "M72,102 L72,96 M72,102 L78,102", "M148,102 L148,96 M148,102 L142,102"].map((d, i) => (
            <path key={i} d={d} stroke={eyeColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          ))}

          {/* ── Left eye ────────────────────── */}
          <motion.g style={{ x: eyeX, y: eyeY }}>
            <ellipse
              cx="93" cy="72"
              rx={12}
              ry={mood === "thinking" ? 1.5 : blinking ? 1.5 : 14}
              fill={eyeColor}
              filter="url(#eyeGlow)"
              style={{
                filter: `drop-shadow(0 0 6px ${eyeGlow})`,
                transition: "ry 0.08s",
              }}
            />
            {!blinking && mood !== "thinking" && (
              <ellipse cx="96" cy="67" rx="3" ry="3" fill="white" opacity="0.6" />
            )}
          </motion.g>

          {/* ── Right eye ───────────────────── */}
          <motion.g style={{ x: eyeX, y: eyeY }}>
            <ellipse
              cx="127" cy="72"
              rx={12}
              ry={mood === "thinking" ? 1.5 : blinking ? 1.5 : 14}
              fill={eyeColor}
              style={{
                filter: `drop-shadow(0 0 6px ${eyeGlow})`,
                transition: "ry 0.08s",
              }}
            />
            {!blinking && mood !== "thinking" && (
              <ellipse cx="130" cy="67" rx="3" ry="3" fill="white" opacity="0.6" />
            )}
          </motion.g>

          {/* Mouth — shows mood */}
          {mood === "happy" ? (
            <path
              d="M97 98 Q110 108 123 98"
              stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 4px rgba(16,185,129,0.5))" }}
            />
          ) : (
            <rect x="97" y="99" width="26" height="3" rx="1.5" fill={eyeColor} opacity="0.4" />
          )}

          {/* ── Indigo belt / torso top ────────── */}
          <rect x="72" y="116" width="76" height="22" rx="11" fill="url(#beltGrad)" filter="url(#bodyShadow)" />
          {/* belt detail */}
          <rect x="98" y="121" width="24" height="12" rx="6" fill="rgba(0,0,0,0.15)" />
          <rect x="101" y="124" width="18" height="6" rx="3" fill={eyeColor} opacity="0.8" />

          {/* ── Torso body ──────────────────── */}
          <rect
            x="78" y="134" width="64" height="46" rx="22"
            fill="url(#bodyGrad)"
            filter="url(#bodyShadow)"
          />

          {/* ── Left arm (pointing left dynamic) ────────────────────── */}
          <rect
            x="50" y="122" width="22" height="38" rx="11"
            fill="url(#bodyGrad)"
            filter="url(#bodyShadow)"
            transform={`rotate(${leftArmRotate} 61 141)`}
            style={{ transition: "transform 0.5s ease" }}
          />
          {/* left arm blue accent */}
          <rect x="51" y="134" width="20" height="10" rx="5" fill="#4f46e5" opacity="0.8" transform={`rotate(${leftArmRotate} 61 139)`} style={{ transition: "transform 0.5s ease" }} />

          {/* ── Right arm (pointing right dynamic) ───────────────────── */}
          <rect
            x="148" y="122" width="22" height="38" rx="11"
            fill="url(#bodyGrad)"
            filter="url(#bodyShadow)"
            transform={`rotate(${rightArmRotate} 159 141)`}
            style={{ transition: "transform 0.5s ease" }}
          />
          {/* right arm blue accent */}
          <rect x="149" y="134" width="20" height="10" rx="5" fill="#4f46e5" opacity="0.8" transform={`rotate(${rightArmRotate} 159 139)`} style={{ transition: "transform 0.5s ease" }} />

          {/* ── Left leg stub ───────────────── */}
          <rect x="87" y="178" width="18" height="26" rx="9" fill="url(#bodyGrad)" filter="url(#bodyShadow)" />
          <rect x="87" y="188" width="18" height="10" rx="5" fill="#4f46e5" opacity="0.7" />

          {/* ── Right leg stub ──────────────── */}
          <rect x="115" y="178" width="18" height="26" rx="9" fill="url(#bodyGrad)" filter="url(#bodyShadow)" />
          <rect x="115" y="188" width="18" height="10" rx="5" fill="#4f46e5" opacity="0.7" />
        </svg>

        {/* Thinking dots above head */}
        {mood === "thinking" && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`typing-dot w-2 h-2 rounded-full`}
                style={{ background: eyeColor, boxShadow: `0 0 6px ${eyeGlow}` }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
