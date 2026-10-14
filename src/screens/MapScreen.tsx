import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { MODULES } from "../data/modules";
import { useAppState } from "../lib/store";
import { FINAL_REQUIRED_MODULES, completedModuleCount, isFinalUnlocked, moduleDoneCount, moduleStatus, type ModuleStatus } from "../lib/engine";
import { navigate } from "../lib/router";
import { AvatarBadge } from "../components/ui";
import { MascotSays } from "../components/Mascot";

const ROW = 138;
const XS = [26, 70, 34, 74, 28, 66, 32, 72, 30, 68, 50];

const STATUS_LABEL: Record<ModuleStatus, string> = {
  kilitli: "Keşfedilmedi",
  acik: "Açık",
  devam: "Devam ediyor",
  tamam: "Tamamlandı",
};

function Island({ color, status, icon }: { color: string; status: ModuleStatus | "final"; icon: string }) {
  const locked = status === "kilitli";
  return (
    <div className="relative grid h-[92px] w-[112px] place-items-center">
      <svg viewBox="0 0 120 96" className="absolute inset-0 h-full w-full" aria-hidden>
        <ellipse cx="60" cy="80" rx="52" ry="12" fill="#192744" opacity="0.12" />
        <path d="M10 62 Q8 36 34 30 Q46 12 70 18 Q98 18 108 44 Q116 66 94 74 Q60 84 26 76 Q10 72 10 62 Z" fill={locked ? "#D5DBE6" : color} />
        <path d="M18 60 Q30 50 46 56 Q62 44 80 52 Q96 46 104 58 Q100 70 80 72 Q50 78 26 72 Q16 68 18 60 Z" fill="#fff" opacity={locked ? 0.3 : 0.25} />
        {!locked && (
          <g>
            <circle cx="28" cy="38" r="6" fill="#58C78A" />
            <circle cx="96" cy="40" r="5" fill="#58C78A" />
          </g>
        )}
      </svg>
      <span className={`relative text-4xl ${locked ? "opacity-50 grayscale" : ""}`} aria-hidden>
        {icon}
      </span>
    </div>
  );
}

export function MapScreen() {
  const s = useAppState();
  const nodes = [
    ...MODULES.map((m) => ({ id: m.id, title: m.place, sub: m.title, icon: m.icon, color: m.color, status: moduleStatus(s, m) as ModuleStatus, done: moduleDoneCount(s, m), to: `/kesif/${m.id}` })),
    {
      id: "final",
      title: "Büyük Finans Üstadı Finali",
      sub: "Hepsini bir araya getir",
      icon: "🏆",
      color: "#FFD166",
      status: (isFinalUnlocked(s) ? (s.final?.passed ? "tamam" : "acik") : "kilitli") as ModuleStatus,
      done: s.final?.passed ? 1 : 0,
      to: "/final",
    },
  ];
  const height = nodes.length * ROW;
  const points = nodes.map((_, i) => [XS[i], i * ROW + 56] as const);
  const pathD = points.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `C ${points[i - 1][0]} ${y - ROW / 2}, ${x} ${points[i - 1][1] + ROW / 2}, ${x} ${y}`)).join(" ");
  const currentIdx = Math.max(0, nodes.findIndex((n) => n.status === "devam" || n.status === "acik"));

  return (
    <div>
      <header className="mb-2">
        <h1 className="text-3xl font-bold">Keşif Haritası</h1>
        <p className="font-semibold text-ink-muted">
          {completedModuleCount(s)}/10 bölüm tamamlandı · Final için {FINAL_REQUIRED_MODULES} bölüm gerekir
        </p>
      </header>
      <MascotSays mood="fikir" tone="sky" size={60}>
        İlk üç bölüm açık! Bir bölümde 2 ders bitirince sıradaki yer keşfedilir.
      </MascotSays>

      <div className="relative mx-auto mt-4 max-w-md rounded-[2rem] bg-gradient-to-b from-sky to-[#dff6ef] p-2" style={{ height: height + 30 }}>
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 100 ${height + 30}`} preserveAspectRatio="none" aria-hidden>
          <path d={pathD} fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={pathD} fill="none" stroke="#192744" strokeOpacity="0.25" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <ol>
          {nodes.map((n, i) => {
            const locked = n.status === "kilitli";
            return (
              <motion.li
                key={n.id}
                className="absolute -translate-x-1/2"
                style={{ left: `${XS[i]}%`, top: i * ROW + 6 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
              >
                <button
                  onClick={() => navigate(n.to)}
                  className="group flex flex-col items-center"
                  aria-label={`${n.title}: ${STATUS_LABEL[n.status]}${n.id !== "final" ? `, ${n.done}/3 ders` : ""}`}
                >
                  <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.95 }} className="relative">
                    <Island color={n.color} status={n.status} icon={n.icon} />
                    {i === currentIdx && !locked && (
                      <motion.div className="absolute -top-5 left-1/2 -translate-x-1/2" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
                        <AvatarBadge profile={s.profile} size={36} />
                      </motion.div>
                    )}
                    <span
                      className={`absolute -right-1 top-1 grid h-7 w-7 place-items-center rounded-full text-xs font-bold shadow ${
                        n.status === "tamam" ? "bg-success text-white" : locked ? "bg-white text-ink-muted" : "bg-white text-navy"
                      }`}
                      aria-hidden
                    >
                      {n.status === "tamam" ? <Check size={16} strokeWidth={3} /> : locked ? <Lock size={14} /> : n.id === "final" ? "★" : `${n.done}/3`}
                    </span>
                  </motion.div>
                  <span className={`-mt-1 max-w-36 rounded-xl px-2 py-0.5 text-center text-[13px] font-bold leading-tight ${locked ? "bg-white/60 text-ink-muted" : "bg-white text-navy shadow-sm"}`}>
                    {n.title}
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
