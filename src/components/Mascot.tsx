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
 * Kumbi: kaşif şapkalı, ₺ madalyonlu aslan kaşif. Tamamen SVG, harici görsel yok.
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
      <ellipse cx="100" cy="190" rx="50" ry="7" fill="#192744" opacity="0.12" />

      {/* kuyruk */}
      <path d="M140 160 Q172 158 170 128" stroke="#E8A92A" strokeWidth="7" strokeLinecap="round" fill="none" />
      <circle cx="170" cy="124" r="9" fill="#C8651B" />

      {/* bacaklar */}
      <rect x="70" y="164" width="20" height="22" rx="9" fill="#E8A92A" />
      <rect x="110" y="164" width="20" height="22" rx="9" fill="#E8A92A" />

      {/* gövde */}
      <ellipse cx="100" cy="152" rx="42" ry="30" fill="#FFC94D" />
      <ellipse cx="100" cy="158" rx="24" ry="18" fill="#FFF1C9" />
      {/* göbek madalyonu */}
      <circle cx="100" cy="160" r="11" fill="#35C9B1" stroke="#1f9e8a" strokeWidth="3" />
      <text x="100" y="165" textAnchor="middle" fontSize="13" fontWeight="800" fill="#192744" fontFamily="Fredoka, sans-serif">
        ₺
      </text>

      {/* sol kol */}
      <motion.g style={{ originX: 1, originY: 0.5 }} animate={armsUp ? { rotate: 140 } : { rotate: 0 }}>
        <rect x="36" y="136" width="26" height="14" rx="7" fill="#F4B942" />
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
        <rect x="138" y="136" width="26" height="14" rx="7" fill="#F4B942" />
      </motion.g>

      {/* yele */}
      <g fill="#E07A2E">
        {Array.from({ length: 14 }).map((_, i) => {
          const a = (i / 14) * Math.PI * 2;
          return <circle key={i} cx={100 + Math.cos(a) * 50} cy={88 + Math.sin(a) * 48} r="17" />;
        })}
        <circle cx="100" cy="88" r="54" />
      </g>
      <g fill="#C8651B" opacity="0.55">
        {Array.from({ length: 14 }).map((_, i) => {
          const a = ((i + 0.5) / 14) * Math.PI * 2;
          return <circle key={i} cx={100 + Math.cos(a) * 56} cy={88 + Math.sin(a) * 54} r="7" />;
        })}
      </g>

      {/* kulaklar */}
      <circle cx="64" cy="58" r="13" fill="#FFC94D" />
      <circle cx="136" cy="58" r="13" fill="#FFC94D" />
      <circle cx="64" cy="58" r="7" fill="#F4A261" />
      <circle cx="136" cy="58" r="7" fill="#F4A261" />

      {/* yüz */}
      <circle cx="100" cy="92" r="42" fill="#FFD166" />
      <ellipse cx="86" cy="72" rx="20" ry="10" fill="#ffffff" opacity="0.22" />

      {/* kaşif şapkası */}
      <ellipse cx="100" cy="52" rx="38" ry="8" fill="#1f9e8a" />
      <path d="M74 52 Q76 24 100 22 Q124 24 126 52 Z" fill="#35C9B1" />
      <rect x="76" y="43" width="48" height="7" rx="3" fill="#FF7A70" />

      {/* yanaklar */}
      <ellipse cx="72" cy="106" rx="8" ry="5" fill="#FF7A70" opacity="0.45" />
      <ellipse cx="128" cy="106" rx="8" ry="5" fill="#FF7A70" opacity="0.45" />

      {/* gözler */}
      {happyEyes ? (
        <g stroke="#192744" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M74 90 Q82 80 90 90" />
          <path d="M110 90 Q118 80 126 90" />
        </g>
      ) : (
        <g>
          <ellipse cx="82" cy="88" rx={wideEyes ? 8.5 : 6.5} ry={wideEyes ? 10.5 : 8.5} fill="#192744" />
          <ellipse cx="118" cy="88" rx={wideEyes ? 8.5 : 6.5} ry={wideEyes ? 10.5 : 8.5} fill="#192744" />
          <circle cx="84" cy="84" r="2.5" fill="#fff" />
          <circle cx="120" cy="84" r="2.5" fill="#fff" />
        </g>
      )}
      {mood === "cesaret" && (
        <g stroke="#192744" strokeWidth="3.5" strokeLinecap="round">
          <path d="M72 74 L90 78" />
          <path d="M128 74 L110 78" />
        </g>
      )}

      {/* ağız çevresi ve burun */}
      <ellipse cx="91" cy="112" rx="12" ry="9" fill="#FFF4D6" />
      <ellipse cx="109" cy="112" rx="12" ry="9" fill="#FFF4D6" />
      <path d="M92 101 Q100 97 108 101 Q104 110 100 110 Q96 110 92 101 Z" fill="#7a3b12" />
      <g fill="#C8651B" opacity="0.6">
        <circle cx="86" cy="112" r="1.4" />
        <circle cx="90" cy="116" r="1.4" />
        <circle cx="114" cy="112" r="1.4" />
        <circle cx="110" cy="116" r="1.4" />
      </g>

      {/* ağız */}
      {mood === "vay" ? (
        <ellipse cx="100" cy="124" rx="5" ry="6" fill="#192744" />
      ) : mood === "cesaret" ? (
        <path d="M92 123 Q100 128 108 123" stroke="#192744" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M90 120 Q100 132 110 120" stroke="#192744" strokeWidth="3.5" strokeLinecap="round" fill={happyEyes ? "#192744" : "none"} />
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
