export function Logo({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Minik Finans Kaşifleri logosu">
      <rect width="64" height="64" rx="18" fill="#192744" />
      <circle cx="32" cy="34" r="17" fill="#FFD166" stroke="#E8A92A" strokeWidth="3" />
      <text x="32" y="41" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="20" fill="#192744">
        ₺
      </text>
      <path d="M32 6 L36 14 L32 12 L28 14 Z" fill="#35C9B1" />
      <circle cx="32" cy="34" r="22" fill="none" stroke="#35C9B1" strokeWidth="2.5" strokeDasharray="4 5" />
    </svg>
  );
}
