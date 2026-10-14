import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#35C9B1", "#FFD166", "#FF7A70", "#7AA7FF", "#58C78A"];

/** Kontrollü, kısa süreli konfeti (hareket azaltma tercihinde gösterilmez) */
export function Confetti({ count = 26 }: { count?: number }) {
  const reduce = useReducedMotion();
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 320,
        y: -120 - Math.random() * 160,
        r: Math.random() * 360,
        c: COLORS[i % COLORS.length],
        w: 6 + Math.random() * 6,
        d: Math.random() * 0.2,
      })),
    [count],
  );
  if (reduce || document.documentElement.dataset.motion === "kapali") return null;
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center overflow-visible" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-sm"
          style={{ width: p.w, height: p.w * 0.5, background: p.c }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 260], opacity: [1, 1, 0], rotate: p.r * 2 }}
          transition={{ duration: 1.6, delay: p.d, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
