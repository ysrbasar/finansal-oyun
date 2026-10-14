// Eğitsel, stilize para çizimleri. Gerçek banknot tasarımlarını taklit etmez.
const NOTE_COLORS: Record<number, { bg: string; ink: string }> = {
  5: { bg: "#C9B6F2", ink: "#3d2a72" },
  10: { bg: "#FFB3AB", ink: "#7a1f18" },
  20: { bg: "#A8E6C1", ink: "#1d5c38" },
  50: { bg: "#FFD9A0", ink: "#7a4a00" },
  100: { bg: "#A9C8FF", ink: "#16336e" },
  200: { bg: "#F7B5D8", ink: "#6e1747" },
};

export function Coin({ value, size = 48 }: { value: number; size?: number }) {
  const isKurus = value < 1;
  const label = isKurus ? String(Math.round(value * 100)) : String(value);
  const gold = value >= 1 || value === 0.5;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" role="img" aria-label={isKurus ? `${label} kuruş` : `${label} lira madeni para`}>
      <circle cx="30" cy="31" r="27" fill="#192744" opacity="0.15" />
      <circle cx="30" cy="29" r="27" fill={gold ? "#F4C84A" : "#D7DCE5"} />
      <circle cx="30" cy="29" r="21" fill="none" stroke={gold ? "#D9A21F" : "#A9B1C2"} strokeWidth="2.5" strokeDasharray="3 3" />
      <text x="30" y={isKurus ? 31 : 35} textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize={label.length > 1 ? 17 : 20} fill="#192744">
        {label}
      </text>
      <text x="30" y={isKurus ? 43 : 46} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight="800" fontSize="8" fill="#192744">
        {isKurus ? "kuruş" : "₺"}
      </text>
    </svg>
  );
}

export function Banknote({ value, width = 96 }: { value: number; width?: number }) {
  const c = NOTE_COLORS[value] ?? { bg: "#E2E8F0", ink: "#192744" };
  return (
    <svg width={width} height={width * 0.52} viewBox="0 0 120 62" role="img" aria-label={`${value} lira banknot (örnek çizim)`}>
      <rect x="1" y="3" width="118" height="58" rx="8" fill="#192744" opacity="0.12" />
      <rect x="0" y="0" width="118" height="58" rx="8" fill={c.bg} />
      <rect x="5" y="5" width="108" height="48" rx="5" fill="none" stroke={c.ink} strokeOpacity="0.35" strokeWidth="1.5" />
      <circle cx="88" cy="29" r="15" fill="#fff" opacity="0.45" />
      <path d="M80 33 q8 -14 16 0" stroke={c.ink} strokeOpacity="0.5" strokeWidth="2" fill="none" />
      <text x="12" y="26" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="20" fill={c.ink}>
        {value}
      </text>
      <text x="12" y="40" fontFamily="Nunito, sans-serif" fontWeight="800" fontSize="9" fill={c.ink}>
        TÜRK LİRASI
      </text>
      <text x="12" y="50" fontFamily="Nunito, sans-serif" fontWeight="700" fontSize="6" fill={c.ink} opacity="0.7">
        EĞİTİM PARASI
      </text>
      <text x="103" y="51" textAnchor="end" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="10" fill={c.ink}>
        ₺
      </text>
    </svg>
  );
}

export function MoneyPiece({ value, scale = 1 }: { value: number; scale?: number }) {
  return value >= 5 ? <Banknote value={value} width={84 * scale} /> : <Coin value={value} size={46 * scale} />;
}

export function MoneyRow({ values, scale = 1 }: { values: number[]; scale?: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {values.map((v, i) => (
        <MoneyPiece key={`${v}-${i}`} value={v} scale={scale} />
      ))}
    </div>
  );
}

export const NOTE_VALUES = [200, 100, 50, 20, 10, 5];
export const COIN_VALUES = [1, 0.5, 0.25, 0.1, 0.05];

/** Bir tutarı en az parça ile banknot/madeni paraya böler (görsel para üstü için) */
export function breakdown(amount: number): number[] {
  const parts: number[] = [];
  let rest = Math.round(amount * 100);
  for (const v of [...NOTE_VALUES, ...COIN_VALUES]) {
    const cents = Math.round(v * 100);
    while (rest >= cents) {
      parts.push(v);
      rest -= cents;
    }
  }
  return parts;
}
