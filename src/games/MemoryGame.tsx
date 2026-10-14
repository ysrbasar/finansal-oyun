import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { MEMORY_SETS, type MemorySet } from "../data/gameContent";
import { shuffle } from "../lib/util";
import { play } from "../lib/sound";
import type { GameProps } from "../screens/GameScreen";

interface Card {
  key: string;
  pair: number;
  text: string;
  side: "a" | "b";
}

export function MemoryGame({ onFinish }: GameProps) {
  const [set, setSet] = useState<MemorySet | null>(null);
  if (!set) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">Bir kart destesi seç</h2>
        {MEMORY_SETS.map((s) => (
          <button key={s.id} className="card flex items-center gap-3 p-4 text-left" onClick={() => setSet(s)}>
            <span className="text-3xl" aria-hidden>
              {s.emoji}
            </span>
            <span className="font-display text-lg font-bold">{s.title}</span>
          </button>
        ))}
      </div>
    );
  }
  return <Board set={set} onFinish={onFinish} />;
}

function Board({ set, onFinish }: { set: MemorySet } & GameProps) {
  const cards = useMemo<Card[]>(
    () =>
      shuffle(
        set.pairs.flatMap((p, i) => [
          { key: `${i}a`, pair: i, text: p.a, side: "a" as const },
          { key: `${i}b`, pair: i, text: p.b, side: "b" as const },
        ]),
      ),
    [set],
  );
  const [open, setOpen] = useState<string[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    if (open.length !== 2) return;
    const [x, y] = open.map((k) => cards.find((c) => c.key === k)!);
    const match = x.pair === y.pair;
    const t = setTimeout(
      () => {
        if (match) {
          play("dogru");
          setFound((f) => {
            const nf = [...f, x.pair];
            if (nf.length === set.pairs.length) {
              setTimeout(() => onFinish({ score: nf.length, max: set.pairs.length }, `${moves + 1} hamlede bütün eşleri buldun!`), 600);
            }
            return nf;
          });
        }
        setOpen([]);
      },
      match ? 350 : 900,
    );
    setMoves((m) => m + 1);
    return () => clearTimeout(t);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <p className="mb-3 text-center font-bold text-navy-soft">
        {set.title} · Bulunan: {found.length}/{set.pairs.length} · Hamle: {moves}
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {cards.map((c) => {
          const isOpen = open.includes(c.key) || found.includes(c.pair);
          return (
            <button
              key={c.key}
              className="aspect-[3/4] [perspective:600px]"
              onClick={() => {
                if (isOpen || open.length === 2) return;
                play("tik");
                setOpen((o) => [...o, c.key]);
              }}
              aria-label={isOpen ? c.text : "Kapalı kart"}
              disabled={found.includes(c.pair)}
            >
              <motion.div className="relative h-full w-full [transform-style:preserve-3d]" animate={{ rotateY: isOpen ? 180 : 0 }} transition={{ duration: 0.35 }}>
                <div className="absolute inset-0 grid place-items-center rounded-2xl bg-navy text-3xl shadow-[var(--shadow-soft)] [backface-visibility:hidden]" aria-hidden>
                  <span className="rounded-full bg-sun px-2.5 py-1 font-display text-xl font-bold text-navy">₺</span>
                </div>
                <div
                  className={`absolute inset-0 grid place-items-center rounded-2xl p-1.5 text-center text-[13px] font-bold leading-tight shadow-[var(--shadow-soft)] [backface-visibility:hidden] [transform:rotateY(180deg)] sm:text-sm ${
                    found.includes(c.pair) ? "bg-success/30" : c.side === "a" ? "bg-sky" : "bg-white"
                  }`}
                >
                  {c.text}
                </div>
              </motion.div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
