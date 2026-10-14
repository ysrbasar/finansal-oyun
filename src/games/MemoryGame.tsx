import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { MEMORY_SETS, type MemoryFace, type MemorySet } from "../data/gameContent";
import { shuffle } from "../lib/util";
import { play } from "../lib/sound";
import { Mascot } from "../components/Mascot";
import { MoneyPiece } from "../components/Money";
import type { GameProps } from "../screens/GameScreen";

interface Card {
  key: string;
  pair: number;
  face: MemoryFace;
}

export function MemoryGame({ onFinish }: GameProps) {
  const [set, setSet] = useState<MemorySet | null>(null);
  if (!set) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {MEMORY_SETS.map((s) => (
          <button key={s.id} className="card flex flex-col items-center gap-2 p-4 text-center" onClick={() => setSet(s)}>
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-sky text-4xl" aria-hidden>
              {s.emoji}
            </span>
            <span className="font-display font-bold leading-tight">{s.title}</span>
          </button>
        ))}
      </div>
    );
  }
  return <Board set={set} onFinish={onFinish} />;
}

/** Kartın ön yüzü: Simge ya da para görseli */
function Face({ face }: { face: MemoryFace }) {
  if (face.money) {
    const many = face.money.length > 2;
    return (
      <div className="flex flex-col items-center justify-center gap-1">
        {face.money.map((v, i) => (
          <MoneyPiece key={i} value={v} scale={many ? 0.62 : 0.76} />
        ))}
      </div>
    );
  }
  return <span className="text-5xl leading-none sm:text-6xl">{face.emoji}</span>;
}

function Board({ set, onFinish }: { set: MemorySet } & GameProps) {
  const cards = useMemo<Card[]>(
    () =>
      shuffle(
        set.pairs.flatMap((p, i) => [
          { key: `${i}a`, pair: i, face: p.a },
          { key: `${i}b`, pair: i, face: p.b },
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
    setMoves((m) => m + 1);
    const t = setTimeout(
      () => {
        if (match) {
          play("dogru");
          setFound((f) => [...f, x.pair]);
        }
        setOpen([]);
      },
      match ? 350 : 900,
    );
    return () => clearTimeout(t);
  }, [open, cards]);

  useEffect(() => {
    if (found.length !== set.pairs.length) return;
    const t = setTimeout(() => onFinish({ score: found.length, max: set.pairs.length }, `${moves} hamlede bütün eşleri buldun!`), 600);
    return () => clearTimeout(t);
  }, [found, set, moves, onFinish]);

  return (
    <div>
      <p className="mb-1 text-center font-semibold text-navy-soft">{set.hint}</p>
      <div className="mb-3 flex justify-center gap-2 font-bold" aria-live="polite">
        <span className="chip bg-success/20">✅ {found.length}/{set.pairs.length}</span>
        <span className="chip bg-sky">👆 {moves}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {cards.map((c) => {
          const isFound = found.includes(c.pair);
          const isOpen = open.includes(c.key) || isFound;
          return (
            <button
              key={c.key}
              className="aspect-[3/4] [perspective:600px]"
              onClick={() => {
                if (isOpen || open.length === 2) return;
                play("tik");
                setOpen((o) => [...o, c.key]);
              }}
              aria-label={isOpen ? c.face.alt : "Kapalı kart"}
              disabled={isFound}
            >
              <motion.div className="relative h-full w-full [transform-style:preserve-3d]" animate={{ rotateY: isOpen ? 180 : 0 }} transition={{ duration: 0.35 }}>
                {/* Arka yüz: Aslan Kumbi */}
                <div className="absolute inset-0 grid place-items-center overflow-hidden rounded-2xl bg-navy shadow-[var(--shadow-soft)] [backface-visibility:hidden]" aria-hidden>
                  <div className="absolute inset-2 rounded-xl border-2 border-dashed border-white/20" />
                  <Mascot mood="mutlu" size={64} animate={false} />
                </div>
                {/* Ön yüz: Simge ya da para */}
                <div
                  className={`absolute inset-0 grid place-items-center rounded-2xl p-1.5 shadow-[var(--shadow-soft)] [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                    isFound ? "bg-success/30 ring-4 ring-success" : "bg-white"
                  }`}
                  aria-hidden
                >
                  <Face face={c.face} />
                </div>
              </motion.div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
