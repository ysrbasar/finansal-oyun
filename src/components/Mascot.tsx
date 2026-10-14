import { motion } from "framer-motion";

export type MascotMood =
  | "merhaba" // ilk karşılama
  | "fikir" // yeni ders önerme
  | "mutlu" // doğru cevap
  | "cesaret" // hatalı cevap sonrası
  | "birikim" // birikim ilerlemesi
  | "kutlama" // rozet kazanımı
  | "vay" // yeni bölüm kilidi açıldı
  | "yildiz"; // günün görevi tamamlandı

interface Props {
  mood?: MascotMood;
  size?: number;
  className?: string;
  /** Hafif nefes/zıplama animasyonu */
  animate?: boolean;
}

/**
 * Kumbi: kaşif şapkalı turkuaz kumbara. Tamamen SVG, harici görsel yok.
 */
export function Mascot({ mood = "merhaba", size = 120, className, animate = true }: Props) {
  const happyEyes = mood === "mutlu" || mood === "kutlama" || mood === "yildiz";
  const wideEyes = mood === "vay";
  const armsUp = mood === "kutlama" || mood === "vay";
  const wave = mood === "merhaba";

  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Kumbi (${moodLabel[mood]})`}
      animate={animate ? { y: [0, -4, 0] } : undefined}
      transition={animate ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      {/* gölge */}
      <ellipse cx="100" cy="186" rx="52" ry="8" fill="#192744" opacity="0.12" />

      {/* bacaklar */}
      <rect x="62" y="152" width="20" height="26" rx="9" fill="#1f9e8a" />
      <rect x="118" y="152" width="20" height="26" rx="9" fill="#1f9e8a" />

      {/* sol kol */}
      <motion.g
        style={{ originX: 1, originY: 0.5 }}
        animate={armsUp ? { rotate: 140 } : { rotate: 0 }}
      >
        <rect x="30" y="112" width="26" height="14" rx="7" fill="#2bb7a1" />
      </motion.g>
      {/* sağ kol: el sallama */}
      <motion.g
        style={{ originX: 0, originY: 0.5 }}
        animate={
          wave
            ? { rotate: [0, -130, -100, -130, 0] }
            : armsUp
              ? { rotate: -140 }
              : mood === "fikir"
                ? { rotate: -120 }
                : { rotate: 0 }
        }
        transition={wave ? { duration: 1.6, repeat: Infinity, repeatDelay: 1.2 } : { type: "spring", stiffness: 200 }}
      >
        <rect x="144" y="112" width="26" height="14" rx="7" fill="#2bb7a1" />
      </motion.g>

      {/* kulaklar */}
      <path d="M58 70 L66 38 L88 60 Z" fill="#2bb7a1" />
      <path d="M142 70 L134 38 L112 60 Z" fill="#2bb7a1" />
      <path d="M64 62 L68 48 L80 60 Z" fill="#ff9aa2" />
      <path d="M136 62 L132 48 L120 60 Z" fill="#ff9aa2" />

      {/* gövde */}
      <ellipse cx="100" cy="112" rx="62" ry="54" fill="#35c9b1" />
      <ellipse cx="84" cy="88" rx="30" ry="16" fill="#ffffff" opacity="0.18" />
      {/* göbek madalyonu */}
      <circle cx="100" cy="140" r="12" fill="#ffd166" stroke="#e8a92a" strokeWidth="3" />
      <text x="100" y="145" textAnchor="middle" fontSize="14" fontWeight="800" fill="#192744" fontFamily="Fredoka, sans-serif">
        ₺
      </text>

      {/* kaşif şapkası + para yuvası */}
      <ellipse cx="100" cy="62" rx="44" ry="9" fill="#e8a92a" />
      <path d="M70 62 Q72 32 100 30 Q128 32 130 62 Z" fill="#ffd166" />
      <rect x="72" y="52" width="56" height="8" rx="3" fill="#ff7a70" />
      <rect x="92" y="38" width="16" height="5" rx="2.5" fill="#192744" opacity="0.7" />

      {/* yanaklar */}
      <ellipse cx="66" cy="120" rx="9" ry="6" fill="#ff7a70" opacity="0.45" />
      <ellipse cx="134" cy="120" rx="9" ry="6" fill="#ff7a70" opacity="0.45" />

      {/* gözler */}
      {happyEyes ? (
        <g stroke="#192744" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M70 100 Q78 90 86 100" />
          <path d="M114 100 Q122 90 130 100" />
        </g>
      ) : (
        <g>
          <ellipse cx="78" cy="98" rx={wideEyes ? 9 : 7} ry={wideEyes ? 11 : 9} fill="#192744" />
          <ellipse cx="122" cy="98" rx={wideEyes ? 9 : 7} ry={wideEyes ? 11 : 9} fill="#192744" />
          <circle cx="80" cy="94" r="2.6" fill="#fff" />
          <circle cx="124" cy="94" r="2.6" fill="#fff" />
        </g>
      )}
      {mood === "cesaret" && (
        <g stroke="#192744" strokeWidth="3.5" strokeLinecap="round">
          <path d="M68 84 L86 88" />
          <path d="M132 84 L114 88" />
        </g>
      )}

      {/* burun (kumbara burnu) */}
      <ellipse cx="100" cy="116" rx="16" ry="11" fill="#7fe0cf" />
      <ellipse cx="94" cy="116" rx="3" ry="4" fill="#1f9e8a" />
      <ellipse cx="106" cy="116" rx="3" ry="4" fill="#1f9e8a" />

      {/* ağız */}
      {mood === "vay" ? (
        <ellipse cx="100" cy="134" rx="6" ry="7" fill="#192744" />
      ) : mood === "cesaret" ? (
        <path d="M90 132 Q100 138 110 132" stroke="#192744" strokeWidth="4" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M86 130 Q100 144 114 130" stroke="#192744" strokeWidth="4" strokeLinecap="round" fill={happyEyes ? "#192744" : "none"} />
      )}

      {/* duruma özel aksesuarlar */}
      {mood === "fikir" && (
        <motion.g animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.4, repeat: Infinity }}>
          <circle cx="168" cy="40" r="15" fill="#ffd166" />
          <rect x="162" y="54" width="12" height="8" rx="2" fill="#5b6785" />
          <path d="M168 18 V10 M186 26 L192 20 M150 26 L144 20" stroke="#e8a92a" strokeWidth="4" strokeLinecap="round" />
        </motion.g>
      )}
      {mood === "birikim" && (
        <motion.g animate={{ y: [-6, 6] }} transition={{ duration: 0.9, repeat: Infinity, repeatType: "reverse" }}>
          <circle cx="100" cy="14" r="11" fill="#ffd166" stroke="#e8a92a" strokeWidth="3" />
          <text x="100" y="19" textAnchor="middle" fontSize="12" fontWeight="800" fill="#192744">₺</text>
        </motion.g>
      )}
      {(mood === "kutlama" || mood === "yildiz") && (
        <g>
          <path d="M28 40 l5 10 11 2 -8 8 2 11 -10 -5 -10 5 2 -11 -8 -8 11 -2z" fill="#ffd166" />
          <path d="M172 36 l4 8 9 1.5 -6.5 6.5 1.5 9 -8 -4 -8 4 1.5 -9 -6.5 -6.5 9 -1.5z" fill="#ff7a70" />
        </g>
      )}
      {mood === "cesaret" && (
        <g>
          <path d="M160 70 c0 -8 12 -8 12 0 c0 8 -12 14 -12 14 c0 0 -12 -6 -12 -14 c0 -8 12 -8 12 0" fill="#ff7a70" transform="translate(6 -20)" />
        </g>
      )}
    </motion.svg>
  );
}

const moodLabel: Record<MascotMood, string> = {
  merhaba: "el sallıyor",
  fikir: "bir fikri var",
  mutlu: "mutlu",
  cesaret: "seni cesaretlendiriyor",
  birikim: "birikim yapıyor",
  kutlama: "kutluyor",
  vay: "şaşırdı",
  yildiz: "yıldız gibi parlıyor",
};

export function MascotSays({
  mood = "merhaba",
  children,
  size = 84,
  tone = "light",
}: {
  mood?: MascotMood;
  children: React.ReactNode;
  size?: number;
  tone?: "light" | "sky" | "sun";
}) {
  const bg = tone === "sky" ? "bg-sky" : tone === "sun" ? "bg-sun/40" : "bg-white";
  return (
    <div className="flex items-end gap-2">
      <Mascot mood={mood} size={size} className="shrink-0" />
      <div className={`relative mb-4 rounded-2xl ${bg} px-4 py-3 text-[15px] font-semibold leading-snug shadow-[var(--shadow-soft)]`}>
        <span className={`absolute -left-1.5 bottom-3 h-3 w-3 rotate-45 ${bg}`} aria-hidden />
        <span className="relative">{children}</span>
      </div>
    </div>
  );
}
