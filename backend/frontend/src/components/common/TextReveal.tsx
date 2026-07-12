import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  text: string;
  delay?: number;
}

export default function TextReveal({ text, delay = 0 }: Props) {
  const words = text.split(" ");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    // Hide cursor shortly after all words are animated in
    const duration = (delay + words.length * 0.035 + 0.4) * 1000;
    const t = setTimeout(() => setShowCursor(false), duration);
    return () => clearTimeout(t);
  }, [words.length, delay]);

  return (
    <span className="inline">
      {words.map((word, idx) => (
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.22,
            delay: delay + idx * 0.035,
            ease: "easeOut",
          }}
          className="inline-block mr-1"
        >
          {word}
        </motion.span>
      ))}
      {showCursor && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block w-1 h-3 bg-violet-500 ml-0.5 align-middle shadow-[0_0_8px_#8b5cf6]"
        />
      )}
    </span>
  );
}
