import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { SORT_CARDS, type SortCard } from "../data/gameContent";
import { shuffle } from "../lib/util";
import { play } from "../lib/sound";
import type { GameProps } from "../screens/GameScreen";
import { dropTargetAt } from "./dnd";

type Bin = "ihtiyac" | "istek";

export function NeedsWantsGame({ onFinish }: GameProps) {
  const cards = useMemo(() => {
    const ctx = shuffle(SORT_CARDS.filter((c) => c.answer === "duruma-gore")).slice(0, 2);
    const rest = shuffle(SORT_CARDS.filter((c) => c.answer !== "duruma-gore")).slice(0, 8);
    return shuffle([...ctx, ...rest]);
  }, []);
  const [placed, setPlaced] = useState<Record<string, Bin>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string; card: SortCard } | null>(null);
  const [score, setScore] = useState(0);
  const remaining = cards.filter((c) => !placed[c.id]);

  const place = (cardId: string, bin: Bin) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card || placed[cardId]) return;
    const ok = card.answer === "duruma-gore" || card.answer === bin;
    play(ok ? "dogru" : "ipucu");
    const nextPlaced = { ...placed, [cardId]: bin };
    setPlaced(nextPlaced);
    setSelected(null);
    const nextScore = score + (ok ? 1 : 0);
    setScore(nextScore);
    setFeedback({
      ok,
      card,
      text: ok ? card.note : `Birlikte düşünelim: ${card.note}`,
    });
    if (Object.keys(nextPlaced).length === cards.length) {
      setTimeout(
        () =>
          onFinish(
            { score: nextScore, max: cards.length },
            "İhtiyaçlar yaşamak ve iyi olmak için gereklidir; istekler bekleyebilir. Ayakkabı ve kalem gibi bazı şeyler ise duruma göre değişir!",
          ),
        1400,
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center font-semibold text-navy-soft">
        {remaining.length} kart kaldı · Doğru: {score}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {(["ihtiyac", "istek"] as Bin[]).map((bin) => {
          const items = cards.filter((c) => placed[c.id] === bin);
          return (
            <button
              key={bin}
              data-drop={bin}
              onClick={() => selected && place(selected, bin)}
              className={`min-h-36 rounded-3xl border-4 border-dashed p-3 text-left transition-colors ${
                bin === "ihtiyac" ? "border-success/60 bg-success/10" : "border-coral/60 bg-coral/10"
              } ${selected ? "ring-4 ring-turq/40" : ""}`}
              aria-label={bin === "ihtiyac" ? "İhtiyaçlarım alanı" : "İsteklerim alanı"}
            >
              <span className="font-display text-lg font-bold">{bin === "ihtiyac" ? "🧰 İhtiyaçlarım" : "💭 İsteklerim"}</span>
              <span className="mt-2 flex flex-wrap gap-1 text-2xl" aria-hidden>
                {items.map((c) => (
                  <span key={c.id}>{c.emoji}</span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        {feedback && (
          <motion.div
            key={feedback.card.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-2xl p-3 text-[15px] font-semibold ${feedback.ok ? "bg-success/20" : "bg-sun/40"}`}
            role="status"
          >
            {feedback.card.emoji} <b>{feedback.card.name}:</b> {feedback.text}
          </motion.div>
        )}
      </AnimatePresence>
      <p className="text-center text-sm font-semibold text-ink-muted">Bir karta dokun, sonra alana dokun. Ya da kartı alana sürükle.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {remaining.map((c) => (
          <motion.button
            key={c.id}
            layout
            drag
            dragSnapToOrigin
            whileDrag={{ scale: 1.08, zIndex: 30, rotate: 3 }}
            onDragEnd={(_, info) => {
              const t = dropTargetAt(info.point);
              if (t === "ihtiyac" || t === "istek") place(c.id, t);
            }}
            onClick={() => setSelected(selected === c.id ? null : c.id)}
            className={`flex touch-none flex-col items-center gap-1 rounded-3xl bg-white p-3 shadow-[var(--shadow-soft)] ${selected === c.id ? "ring-4 ring-turq" : ""}`}
            aria-pressed={selected === c.id}
          >
            <span className="text-4xl" aria-hidden>
              {c.emoji}
            </span>
            <span className="text-center text-sm font-bold leading-tight">{c.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
