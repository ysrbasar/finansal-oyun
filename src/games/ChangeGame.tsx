import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { breakdown, MoneyRow } from "../components/Money";
import { NumPad } from "../components/NumPad";
import { play } from "../lib/sound";
import type { GameProps } from "../screens/GameScreen";

const PRODUCTS = ["🧃", "📒", "🍎", "✏️", "🧩", "📗", "🪁", "⚽", "🖍️", "🧸"];

function makeRounds() {
  const rounds: { emoji: string; price: number; paid: number[] }[] = [];
  for (let i = 0; i < 10; i++) {
    const level = i < 3 ? 1 : i < 7 ? 2 : 3;
    let price: number;
    let paid: number[];
    if (level === 1) {
      price = [5, 10, 15][Math.floor(Math.random() * 3)];
      paid = [20];
    } else if (level === 2) {
      price = 11 + Math.floor(Math.random() * 38);
      paid = [50];
    } else {
      price = 41 + Math.floor(Math.random() * 115);
      paid = price > 100 ? [100, 50, 20] : [100];
      if (price > 170) paid = [200];
    }
    rounds.push({ emoji: PRODUCTS[i], price, paid });
  }
  return rounds;
}

export function ChangeGame({ onFinish }: GameProps) {
  const rounds = useMemo(makeRounds, []);
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [tries, setTries] = useState(0);
  const [state, setState] = useState<"soru" | "dogru" | "goster">("soru");
  const [score, setScore] = useState(0);
  const r = rounds[i];
  const paidTotal = r.paid.reduce((a, b) => a + b, 0);
  const change = paidTotal - r.price;

  const submit = () => {
    if (Number(value) === change) {
      play("dogru");
      setScore((s) => s + 1);
      setState("dogru");
    } else if (tries === 0) {
      play("ipucu");
      setTries(1);
      setValue("");
    } else {
      play("ipucu");
      setState("goster");
    }
  };

  const next = () => {
    if (i + 1 >= rounds.length) {
      onFinish({ score, max: rounds.length }, score >= 8 ? "Para üstünü şimşek gibi hesapladın!" : "Para üstü = verilen para - fiyat. Pratik yaptıkça hızlanacaksın!");
      return;
    }
    setI(i + 1);
    setValue("");
    setTries(0);
    setState("soru");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between font-bold text-navy-soft">
        <span>Tur {i + 1}/10</span>
        <span>Doğru: {score}</span>
      </div>
      <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card flex flex-col items-center gap-3 p-4 text-center">
        <div className="flex items-center gap-3">
          <span className="text-5xl" aria-hidden>
            {r.emoji}
          </span>
          <span className="rounded-xl bg-sun px-3 py-1 font-display text-2xl font-bold">{r.price} TL</span>
        </div>
        <p className="font-semibold">Kasaya verdiğin para:</p>
        <MoneyRow values={r.paid} />
        <p className="font-display text-lg font-bold">
          {paidTotal} TL - {r.price} TL = ?
        </p>
      </motion.div>

      {tries === 1 && state === "soru" && (
        <p className="rounded-2xl bg-sun/40 p-3 font-semibold" role="status">
          Birlikte düşünelim: {r.price}'ten {paidTotal}'e kadar ileri say. Önce en yakın onluğa, sonra {paidTotal}'e.
        </p>
      )}

      {state === "soru" ? (
        <NumPad value={value} onChange={setValue} onSubmit={submit} unit="TL" />
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-3xl p-4 text-center ${state === "dogru" ? "bg-success/20" : "bg-sky"}`} role="status">
          <p className="font-display text-xl font-bold">{state === "dogru" ? "Doğru! Para üstün:" : `Para üstü ${change} TL olmalıydı:`}</p>
          <div className="my-3">{change > 0 ? <MoneyRow values={breakdown(change)} scale={0.8} /> : <p>Para üstü yok!</p>}</div>
          <p className="font-semibold">
            {paidTotal} - {r.price} = {change} TL
          </p>
          <button className="btn-dark mt-3 w-full" onClick={next} autoFocus>
            {i + 1 >= rounds.length ? "Sonucu gör" : "Sonraki tur"}
          </button>
        </motion.div>
      )}
    </div>
  );
}
