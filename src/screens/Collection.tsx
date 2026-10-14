import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BADGES } from "../data/badges";
import { LEVELS, MAP_PIECES } from "../data/levels";
import { FLASHCARDS } from "../data/flashcards";
import { TOPICS, TOPIC_IDS } from "../data/topics";
import { MODULES } from "../data/modules";
import { GAMES } from "../data/games";
import type { TopicId } from "../types";
import { update, useAppState } from "../lib/store";
import { isModuleComplete, levelForXp, markBadgesSeen, markFlashcardSeen, moduleDoneCount } from "../lib/engine";
import { formatDate } from "../lib/util";
import { BadgeMedal } from "../components/ui";

type Tab = "rozet" | "seviye" | "kart" | "kesif";

export function Collection() {
  const s = useAppState();
  const [tab, setTab] = useState<Tab>("rozet");
  const [fresh] = useState(() => new Set(Object.entries(s.badges).filter(([, v]) => !v.seen).map(([k]) => k)));
  useEffect(() => {
    if (fresh.size) update(markBadgesSeen);
  }, [fresh]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "rozet", label: `Rozetler ${Object.keys(s.badges).length}/${BADGES.length}` },
    { id: "seviye", label: "Seviyeler" },
    { id: "kart", label: "Eğitim kartları" },
    { id: "kesif", label: "Keşifler" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold">Koleksiyon ve Başarılar</h1>
      <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full px-4 py-2 font-display font-semibold ${tab === t.id ? "bg-navy text-white" : "bg-white shadow-sm"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tab === "rozet" && <Badges fresh={fresh} />}
        {tab === "seviye" && <Levels />}
        {tab === "kart" && <Cards />}
        {tab === "kesif" && <Discoveries />}
      </div>
    </div>
  );
}

function Badges({ fresh }: { fresh: Set<string> }) {
  const s = useAppState();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {BADGES.map((b, i) => {
        const earned = s.badges[b.id];
        return (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
            className={`relative flex flex-col items-center rounded-3xl p-3 text-center ${earned ? "bg-white shadow-[var(--shadow-soft)]" : "bg-navy/5"}`}
          >
            {fresh.has(b.id) && <span className="chip absolute right-2 top-2 bg-coral py-0.5 text-[11px] text-white">Yeni</span>}
            <BadgeMedal icon={b.icon} color={b.color} earned={!!earned} size={76} />
            <p className="mt-1 font-display font-bold leading-tight">{b.title}</p>
            <p className="mt-1 text-xs font-semibold text-ink-muted">{earned ? b.description : b.condition}</p>
            {earned ? (
              <p className="mt-1 text-[11px] font-bold text-success-dark">{formatDate(earned.earnedAt)}</p>
            ) : (
              <p className="mt-1 text-[11px] font-bold text-ink-muted">🔒 Henüz kazanılmadı</p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function Levels() {
  const s = useAppState();
  const cur = levelForXp(s.xp).level;
  return (
    <div className="flex flex-col gap-4">
      <div className="card p-4">
        <h2 className="font-display text-lg font-bold">Hazine haritası parçaları</h2>
        <p className="text-sm font-semibold text-ink-muted">Her seviye bir parça açar. Hepsini topla!</p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {MAP_PIECES.map((p, i) => (
            <div key={i} className={`grid aspect-square place-items-center rounded-2xl text-3xl ${i < cur ? "bg-sun/60" : "bg-navy/5"}`} aria-label={i < cur ? `Parça ${i + 1} açık` : `Parça ${i + 1} kilitli`}>
              <span className={i < cur ? "" : "opacity-30 grayscale"} aria-hidden>
                {i < cur ? p : "❔"}
              </span>
            </div>
          ))}
        </div>
      </div>
      <ol className="flex flex-col gap-2">
        {LEVELS.map((l) => {
          const open = l.level <= cur;
          return (
            <li key={l.level} className={`flex items-center gap-3 rounded-2xl p-3 ${open ? "bg-white shadow-sm" : "bg-navy/5"} ${l.level === cur ? "ring-4 ring-turq" : ""}`}>
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-display text-xl font-bold ${open ? "bg-sun" : "bg-white text-ink-muted"}`}>{l.level}</span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold">{l.title}</p>
                <p className="text-xs font-semibold text-ink-muted">{open ? l.unlock : `${l.minXp} XP'de açılır`}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Cards() {
  const s = useAppState();
  const [topic, setTopic] = useState<TopicId | "hepsi">("hepsi");
  const [flipped, setFlipped] = useState<string[]>([]);
  const list = FLASHCARDS.filter((f) => topic === "hepsi" || f.topic === topic);
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-ink-muted">
        Karta dokun, arka yüzünü gör. Çevrilen kart: {s.flashcardsSeen.length}/{FLASHCARDS.length}
      </p>
      <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1">
        {(["hepsi", ...TOPIC_IDS] as const).map((t) => (
          <button key={t} onClick={() => setTopic(t)} className={`chip shrink-0 ${topic === t ? "bg-turq" : "bg-white shadow-sm"}`}>
            {t === "hepsi" ? "Hepsi" : `${TOPICS[t].emoji} ${TOPICS[t].title}`}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {list.map((f) => {
          const on = flipped.includes(f.id);
          return (
            <button
              key={f.id}
              className="aspect-[4/5] [perspective:800px]"
              onClick={() => {
                setFlipped((x) => (on ? x.filter((y) => y !== f.id) : [...x, f.id]));
                if (!on) update((st) => markFlashcardSeen(st, f.id));
              }}
              aria-label={on ? `${f.front}: ${f.back}` : `${f.front} kartını çevir`}
            >
              <motion.div className="relative h-full w-full [transform-style:preserve-3d]" animate={{ rotateY: on ? 180 : 0 }} transition={{ duration: 0.4 }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-3xl bg-white p-3 shadow-[var(--shadow-soft)] [backface-visibility:hidden]">
                  <span className="text-4xl" aria-hidden>
                    {f.emoji}
                  </span>
                  <span className="font-display text-lg font-bold leading-tight">{f.front}</span>
                  {s.flashcardsSeen.includes(f.id) && <span className="text-[10px] font-bold text-success-dark">✓ incelendi</span>}
                </div>
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-navy p-3 text-[14px] font-semibold leading-snug text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  {f.back}
                </div>
              </motion.div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Discoveries() {
  const s = useAppState();
  return (
    <div className="flex flex-col gap-4">
      <div className="card p-4">
        <h2 className="font-display text-lg font-bold">Keşfedilen alanlar</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {MODULES.map((m) => {
            const done = moduleDoneCount(s, m);
            const full = isModuleComplete(s, m);
            return (
              <div key={m.id} className={`flex flex-col items-center rounded-2xl p-2 text-center ${full ? "" : "opacity-70"}`} style={{ background: full ? `${m.color}55` : "rgb(25 39 68 / 0.05)" }}>
                <span className={`text-3xl ${done ? "" : "grayscale"}`} aria-hidden>
                  {m.icon}
                </span>
                <span className="text-xs font-bold leading-tight">{m.place}</span>
                <span className="text-[11px] font-bold text-ink-muted">{full ? "Tamamlandı" : `${done}/3`}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="card p-4">
        <h2 className="font-display text-lg font-bold">Tamamlanan görevler</h2>
        <ul className="mt-2 flex flex-col gap-1 text-sm font-semibold">
          {Object.keys(s.completedLessons).length === 0 && <li className="text-ink-muted">Henüz ders tamamlanmadı.</li>}
          {MODULES.flatMap((m) => m.lessons)
            .filter((l) => s.completedLessons[l.id])
            .map((l) => (
              <li key={l.id}>✅ {l.title}</li>
            ))}
          {GAMES.filter((g) => s.games[g.id]?.completed).map((g) => (
            <li key={g.id}>
              🎮 {g.title} (en iyi {s.games[g.id]!.best}/{s.games[g.id]!.max})
            </li>
          ))}
          {s.goals
            .filter((g) => g.completedAt)
            .map((g) => (
              <li key={g.id}>
                🫙 Birikim hedefi: {g.emoji} {g.name} ({g.target} TL)
              </li>
            ))}
          {s.final?.passed && <li>🏆 Büyük Finans Üstadı Finali</li>}
        </ul>
      </div>
    </div>
  );
}
