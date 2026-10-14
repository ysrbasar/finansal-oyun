import { AnimatePresence, animate, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Celebration } from "../types";
import { update, useAppState } from "../lib/store";
import { BADGES } from "../data/badges";
import { LEVELS, MAP_PIECES } from "../data/levels";
import { getModule } from "../data/modules";
import { Mascot, type MascotMood } from "./Mascot";
import { BadgeMedal } from "./ui";
import { Confetti } from "./Confetti";
import { play } from "../lib/sound";

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const c = animate(0, to, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = `+${Math.round(v)}`;
      },
    });
    return () => c.stop();
  }, [to]);
  return <span ref={ref}>+0</span>;
}

function describe(c: Celebration): { mood: MascotMood; kicker: string; title: string; text: string; art: React.ReactNode; xp?: number; coins?: number } {
  switch (c.kind) {
    case "badge": {
      const b = BADGES.find((x) => x.id === c.badgeId);
      return {
        mood: "kutlama",
        kicker: "Yeni rozet!",
        title: b?.title ?? "Rozet",
        text: b?.description ?? "",
        art: b ? <BadgeMedal icon={b.icon} color={b.color} earned size={130} /> : null,
        xp: c.xp,
      };
    }
    case "level": {
      const l = LEVELS.find((x) => x.level === c.level);
      return {
        mood: "kutlama",
        kicker: `Seviye ${c.level}!`,
        title: l?.title ?? "",
        text: l?.unlock ?? "",
        art: (
          <div className="grid h-32 w-32 place-items-center rounded-[2rem] bg-sun text-6xl shadow-[var(--shadow-lift)]" aria-hidden>
            {MAP_PIECES[c.level - 1]}
          </div>
        ),
      };
    }
    case "module": {
      const m = getModule(c.moduleId);
      return {
        mood: "kutlama",
        kicker: "Bölüm tamamlandı!",
        title: m?.place ?? "",
        text: `"${m?.title}" bölümündeki bütün dersleri bitirdin. Bölüm bonusu kazandın!`,
        art: (
          <div className="grid h-32 w-32 place-items-center rounded-full text-6xl shadow-[var(--shadow-lift)]" style={{ background: m?.color }} aria-hidden>
            {m?.icon}
          </div>
        ),
        xp: c.xp,
      };
    }
    case "unlock": {
      const m = getModule(c.moduleId);
      return {
        mood: "vay",
        kicker: "Yeni bölüm açıldı!",
        title: m?.place ?? "",
        text: `Keşif haritasında yeni bir yer seni bekliyor: ${m?.title}.`,
        art: (
          <div className="grid h-28 w-28 place-items-center rounded-full bg-sky text-6xl" aria-hidden>
            {m?.icon}
          </div>
        ),
      };
    }
    case "goal":
      return {
        mood: "birikim",
        kicker: "Hedefe ulaştın!",
        title: `${c.emoji} ${c.name}`,
        text: "Sabırla biriktirdin ve hedefini tamamladın. Bu gerçek bir kaşif başarısı!",
        art: <div className="text-8xl" aria-hidden>{c.emoji}</div>,
      };
    case "daily":
      return {
        mood: "yildiz",
        kicker: "Günün görevi tamam!",
        title: "Harika iş çıkardın",
        text: "Bugünün finans görevini bitirdin. Yarın yeni bir görev seni bekliyor.",
        art: <div className="text-8xl" aria-hidden>🌟</div>,
        xp: c.xp,
        coins: c.coins,
      };
  }
}

/** Kazanılan ödülleri sırayla, okunabilir biçimde gösterir */
export function CelebrationOverlay() {
  const s = useAppState();
  const current = s.celebrations[0];
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (current) play("odul");
  }, [current, key]);

  const next = () => {
    update((st) => {
      const rest = st.celebrations.slice(1);
      const c = st.celebrations[0];
      const badges = c?.kind === "badge" && st.badges[c.badgeId] ? { ...st.badges, [c.badgeId]: { ...st.badges[c.badgeId], seen: true } } : st.badges;
      return { ...st, celebrations: rest, badges };
    });
    setKey((k) => k + 1);
  };

  const d = current ? describe(current) : null;

  return (
    <AnimatePresence>
      {current && d && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-50 grid place-items-center bg-navy/55 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="celebration-title"
        >
          <motion.div
            key={key}
            className="relative w-full max-w-sm overflow-visible rounded-[2rem] bg-cream p-6 text-center shadow-[var(--shadow-lift)]"
            initial={{ scale: 0.7, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Confetti />
            <p className="font-display text-sm font-bold uppercase tracking-wider text-coral-dark">{d.kicker}</p>
            <motion.div
              className="my-4 grid place-items-center"
              initial={{ scale: 0.2, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 12, delay: 0.15 }}
            >
              {d.art}
            </motion.div>
            <h2 id="celebration-title" className="text-3xl font-bold">
              {d.title}
            </h2>
            <p className="mt-2 text-[15px] font-semibold text-navy-soft">{d.text}</p>
            {(d.xp || d.coins) && (
              <div className="mt-4 flex justify-center gap-2">
                {d.xp ? (
                  <span className="chip bg-sun text-lg">
                    ⭐ <CountUp to={d.xp} /> XP
                  </span>
                ) : null}
                {d.coins ? (
                  <span className="chip bg-turq/30 text-lg">
                    🪙 <CountUp to={d.coins} /> sanal TL
                  </span>
                ) : null}
              </div>
            )}
            <div className="mt-4 flex items-center justify-center gap-2">
              <Mascot mood={d.mood} size={56} animate={false} />
              <p className="font-display text-lg font-semibold">Harika, başardın!</p>
            </div>
            <button className="btn-primary mt-4 w-full" onClick={next} autoFocus>
              {s.celebrations.length > 1 ? `Devam et (${s.celebrations.length - 1} ödül daha)` : "Devam et"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
