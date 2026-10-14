import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { JOURNEY_GOALS, JOURNEY_WEEKS, type JourneyGoal } from "../data/gameContent";
import { Jar } from "../components/Jar";
import { ProgressBar } from "../components/ui";
import { Mascot } from "../components/Mascot";
import { play } from "../lib/sound";
import type { GameProps } from "../screens/GameScreen";

export function SavingsJourneyGame({ onFinish }: GameProps) {
  const [goal, setGoal] = useState<JourneyGoal | null>(null);
  const [week, setWeek] = useState(0);
  const [saved, setSaved] = useState(0);
  const [spent, setSpent] = useState<string[]>([]);
  const [log, setLog] = useState<string | null>(null);
  const [reached, setReached] = useState(false);

  if (!goal) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">Hedefini seç</h2>
        <p className="font-semibold text-navy-soft">8 hafta boyunca her hafta biraz sanal para gelecek. Bazı haftalar cazip harcamalar çıkacak. Karar senin!</p>
        {JOURNEY_GOALS.map((g) => (
          <button key={g.id} className="card flex items-center gap-4 p-4 text-left" onClick={() => setGoal(g)}>
            <span className="text-4xl" aria-hidden>
              {g.emoji}
            </span>
            <span className="flex-1 font-display text-lg font-bold">{g.name}</span>
            <span className="rounded-lg bg-sun px-2 font-display font-bold">{g.target} TL</span>
          </button>
        ))}
      </div>
    );
  }

  const w = JOURNEY_WEEKS[week];
  const remaining = Math.max(0, goal.target - saved);

  const choose = (spend: boolean) => {
    const add = spend ? w.income - w.temptation.cost : w.income;
    const newSaved = saved + add;
    play(spend ? "tik" : "para");
    if (spend) setSpent((s) => [...s, `${w.temptation.emoji} ${w.temptation.text}`]);
    setSaved(newSaved);
    setLog(
      spend
        ? `${w.temptation.cost} TL harcadın, ${add} TL kavanoza gitti. Fırsat maliyeti: Hedefin ${w.temptation.cost} TL uzaklaştı.`
        : `${add} TL'nin hepsini biriktirdin. Hedefe ${Math.max(0, goal.target - newSaved)} TL kaldı.`,
    );
    if (newSaved >= goal.target) {
      setReached(true);
      play("odul");
      return;
    }
    if (week + 1 >= JOURNEY_WEEKS.length) {
      setTimeout(
        () =>
          onFinish(
            { score: 0, max: 1 },
            `8 hafta bitti, kavanozda ${newSaved} TL var. Hedefe ${goal.target - newSaved} TL kaldı. Bir dahakine bazı harcamaları erteleyip hedefe ulaşabilirsin!`,
          ),
        1200,
      );
      return;
    }
    setWeek(week + 1);
  };

  if (reached) {
    return (
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-3 text-center">
        <Mascot mood="birikim" size={120} />
        <h2 className="text-3xl font-bold">
          {goal.emoji} Hedefe ulaştın!
        </h2>
        <Jar saved={goal.target} target={goal.target} size={130} />
        <p className="font-semibold">
          {week + 1}. haftada {goal.name} için {goal.target} TL biriktirdin.
          {spent.length ? ` Yol boyunca ${spent.length} kez küçük bir keyif yaptın ve yine de başardın.` : " Hiç harcama yapmadan sabırla biriktirdin!"}
        </p>
        <button
          className="btn-primary w-full"
          onClick={() => onFinish({ score: 1, max: 1 }, `Hedef: ${goal.name} (${goal.target} TL). ${week + 1} haftada tamamlandı. Ertelenmiş mutluluk süper gücünü kullandın!`)}
        >
          Ödülümü al
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="card flex items-center gap-4 p-4">
        <Jar saved={saved} target={goal.target} size={96} />
        <div className="flex-1">
          <p className="font-display text-lg font-bold">
            {goal.emoji} {goal.name}
          </p>
          <ProgressBar value={(saved / goal.target) * 100} label="Hedef ilerlemesi" />
          <p className="mt-1 text-sm font-bold">
            {saved}/{goal.target} TL · kalan {remaining} TL
          </p>
          <p className="text-xs font-bold text-ink-muted">Hafta {week + 1}/8</p>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={week} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card p-4">
          <p className="font-display text-lg font-bold">🪙 Bu hafta {w.income} sanal TL geldi!</p>
          <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
            <span className="text-3xl" aria-hidden>
              {w.temptation.emoji}
            </span>
            {w.temptation.text}: {w.temptation.cost} TL
          </p>
          <div className="mt-4 grid gap-2">
            <button className="btn-primary" onClick={() => choose(false)}>
              Hepsini biriktir (+{w.income} TL)
            </button>
            <button className="btn-ghost" onClick={() => choose(true)}>
              {w.temptation.cost} TL harca, kalanı biriktir (+{w.income - w.temptation.cost} TL)
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
      {log && (
        <p className="rounded-2xl bg-sky p-3 text-sm font-semibold" role="status">
          {log}
        </p>
      )}
    </div>
  );
}
