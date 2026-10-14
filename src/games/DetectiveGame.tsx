import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { DETECTIVE_CASES } from "../data/gameContent";
import { shuffle } from "../lib/util";
import { play } from "../lib/sound";
import type { GameProps } from "../screens/GameScreen";

export function DetectiveGame({ onFinish }: GameProps) {
  const cases = useMemo(() => shuffle(DETECTIVE_CASES), []);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const c = cases[i];
  const choices = useMemo(() => shuffle(c.choices), [c]);
  const total = c.entries.filter((e) => !e.label.startsWith("Plan:")).reduce((a, e) => a + e.amount, 0);
  const correct = picked === c.answer;

  return (
    <motion.div key={c.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
      <p className="text-center font-bold text-navy-soft">
        Vaka {i + 1}/{cases.length} · Çözülen: {score}
      </p>
      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 bg-navy p-4 text-white">
          <span className="text-4xl" aria-hidden>
            {c.emoji}
          </span>
          <div>
            <p className="font-display text-xl font-bold">{c.character}'in harcama defteri</p>
            <p className="font-semibold text-sun">Bütçe: {c.budget} TL</p>
          </div>
          <span className="ml-auto text-3xl" aria-hidden>
            🕵️
          </span>
        </div>
        <table className="w-full text-left">
          <caption className="sr-only">Harcama kayıtları</caption>
          <tbody>
            {c.entries.map((e, k) => (
              <tr key={k} className="border-b border-navy/5 last:border-0">
                <td className="px-4 py-2.5 font-semibold">{e.label}</td>
                <td className="px-4 py-2.5 text-right font-display text-lg font-bold">{e.amount} TL</td>
              </tr>
            ))}
            {picked && (
              <tr className="bg-sun/30">
                <td className="px-4 py-2.5 font-bold">Gerçek toplam harcama</td>
                <td className="px-4 py-2.5 text-right font-display text-lg font-bold">{total} TL</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <h2 className="text-xl font-bold">{c.question}</h2>
      <div className="grid gap-2">
        {choices.map((ch) => (
          <button
            key={ch.id}
            disabled={!!picked}
            onClick={() => {
              setPicked(ch.id);
              const ok = ch.id === c.answer;
              play(ok ? "dogru" : "ipucu");
              if (ok) setScore((s) => s + 1);
            }}
            className={`min-h-14 rounded-2xl border-[3px] px-4 py-3 text-left font-bold ${
              picked && ch.id === c.answer ? "border-success bg-success/15" : picked === ch.id ? "border-coral bg-coral/10" : "border-navy/10 bg-white"
            }`}
          >
            {ch.text}
          </button>
        ))}
      </div>
      {picked && (
        <div className={`rounded-3xl p-4 ${correct ? "bg-success/20" : "bg-sky"}`} role="status">
          <p className="font-display text-lg font-bold">{correct ? "Vaka çözüldü! 🔍" : "Birlikte bakalım:"}</p>
          <p className="font-semibold">{c.explanation}</p>
          <button
            className="btn-dark mt-3 w-full"
            autoFocus
            onClick={() => {
              if (i + 1 >= cases.length) {
                onFinish({ score, max: cases.length }, "Bütçe dedektifi önce toplamı hesaplar, sonra bütçe ve planla karşılaştırır.");
              } else {
                setI(i + 1);
                setPicked(null);
              }
            }}
          >
            {i + 1 >= cases.length ? "Sonucu gör" : "Sonraki vaka"}
          </button>
        </div>
      )}
    </motion.div>
  );
}
