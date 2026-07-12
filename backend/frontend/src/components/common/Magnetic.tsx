import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  children: React.ReactElement;
  pullRange?: number; // 0 to 1 value representing pull strength
}

export default function Magnetic({ children, pullRange = 0.3 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const x = clientX - centerX;
    const y = clientY - centerY;

    // Pull slightly towards cursor
    setPosition({ x: x * pullRange, y: y * pullRange });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 180, damping: 15, mass: 0.1 }}
      className="inline-block w-full"
    >
      {children}
    </motion.div>
  );
}
