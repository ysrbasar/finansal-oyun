import { motion } from "framer-motion";

const SKINS: Record<string, { glass: string; stripe?: string }> = {
  default: { glass: "#EAF2FF" },
  "yildiz-kavanoz": { glass: "#FFF4D6", stripe: "#FFD166" },
  "gokkusagi-kavanoz": { glass: "#F3EDFF", stripe: "url(#rainbow)" },
};

/** Animasyonlu birikim kavanozu */
export function Jar({ saved, target, size = 160, skin }: { saved: number; target: number; size?: number; skin?: string }) {
  const ratio = target > 0 ? Math.min(1, saved / target) : 0;
  const s = SKINS[skin ?? "default"] ?? SKINS.default;
  const fillTop = 168 - ratio * 118;
  const coins = Math.min(12, Math.round(ratio * 12));
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 160 176" role="img" aria-label={`Birikim kavanozu: ${target} TL hedefin yüzde ${Math.round(ratio * 100)}'i dolu`}>
      <defs>
        <linearGradient id="rainbow" x1="0" x2="1">
          <stop offset="0" stopColor="#FF7A70" />
          <stop offset="0.33" stopColor="#FFD166" />
          <stop offset="0.66" stopColor="#58C78A" />
          <stop offset="1" stopColor="#7AA7FF" />
        </linearGradient>
        <clipPath id="jarClip">
          <path d="M34 46 Q26 52 26 70 V150 Q26 170 46 170 H114 Q134 170 134 150 V70 Q134 52 126 46 Z" />
        </clipPath>
        <linearGradient id="coinFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE08A" />
          <stop offset="1" stopColor="#F4B92F" />
        </linearGradient>
      </defs>
      <path d="M34 46 Q26 52 26 70 V150 Q26 170 46 170 H114 Q134 170 134 150 V70 Q134 52 126 46 Z" fill={s.glass} stroke="#192744" strokeWidth="4" />
      <g clipPath="url(#jarClip)">
        <motion.rect
          x="20"
          width="120"
          height="140"
          fill="url(#coinFill)"
          initial={false}
          animate={{ y: fillTop }}
          transition={{ type: "spring", stiffness: 60, damping: 14 }}
        />
        {Array.from({ length: coins }).map((_, i) => (
          <motion.ellipse
            key={i}
            cx={44 + ((i * 23) % 76)}
            rx="11"
            ry="4"
            fill="#E8A92A"
            initial={false}
            animate={{ cy: 164 - Math.floor(i / 3) * 10 }}
          />
        ))}
      </g>
      {s.stripe && <rect x="30" y="92" width="100" height="8" fill={s.stripe} opacity="0.8" />}
      <path d="M40 62 V140" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
      <rect x="30" y="24" width="100" height="24" rx="8" fill="#FF7A70" stroke="#192744" strokeWidth="4" />
      <rect x="66" y="31" width="28" height="6" rx="3" fill="#192744" />
    </svg>
  );
}
