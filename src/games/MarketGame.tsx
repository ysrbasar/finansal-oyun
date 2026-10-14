import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { MARKET_ITEMS, MARKET_MISSIONS, type MarketItem } from "../data/gameContent";
import { play } from "../lib/sound";
import type { GameProps } from "../screens/GameScreen";
import { ProgressBar } from "../components/ui";

const item = (id: string) => MARKET_ITEMS.find((i) => i.id === id)!;

export function MarketGame({ onFinish }: GameProps) {
  const [mi, setMi] = useState(0);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);
  const [overCount, setOverCount] = useState(0);
  const [done, setDone] = useState(0);
  const mission = MARKET_MISSIONS[mi];
  const total = Object.entries(cart).reduce((t, [id, n]) => t + item(id).price * n, 0);
  const remaining = mission.budget - total;
  const over = remaining < 0;

  const add = (it: MarketItem, d: number) => {
    play("tik");
    setMsg(null);
    setCart((c) => {
      const n = Math.max(0, (c[it.id] ?? 0) + d);
      const next = { ...c, [it.id]: n };
      if (!n) delete next[it.id];
      return next;
    });
  };

  const checkout = () => {
    const missing = mission.required.filter((g) => !g.anyOf.some((id) => cart[id]));
    if (over) {
      play("ipucu");
      setOverCount((n) => n + 1);
      // Alternatif öner: Sepetteki zorunlu olmayan ürünler veya daha ucuz eşdeğerler
      const requiredIds = new Set(mission.required.flatMap((g) => g.anyOf));
      const extras = Object.keys(cart).filter((id) => !requiredIds.has(id));
      const cheaper = mission.required
        .map((g) => {
          const inCart = g.anyOf.find((id) => cart[id]);
          const alt = g.anyOf.filter((id) => id !== inCart).map(item).sort((a, b) => a.price - b.price)[0];
          return inCart && alt && alt.price < item(inCart).price ? `${item(inCart).name} yerine ${alt.name} (${alt.price} TL)` : null;
        })
        .filter(Boolean);
      const tips = [
        ...extras.map((id) => `${item(id).name} ürününü çıkarabilirsin (${item(id).price} TL)`),
        ...cheaper,
      ];
      setMsg({
        tone: "warn",
        text: `Sepet ${total} TL, bütçen ${mission.budget} TL. ${-remaining} TL fazla! ${tips.length ? "Öneri: " + tips.slice(0, 2).join(" ya da ") + "." : "Bazı ürünlerin adedini azaltmayı dene."}`,
      });
      return;
    }
    if (missing.length) {
      play("ipucu");
      setMsg({ tone: "warn", text: `Listede eksik var: ${missing.map((m) => m.label).join(", ")}. Görevi tamamlamak için bunları da ekle.` });
      return;
    }
    play("para");
    const nextDone = done + 1;
    setDone(nextDone);
    setMsg({ tone: "ok", text: `Harika! ${total} TL harcadın, ${remaining} TL kaldı. Bütçe sınırını aşmadın.` });
    setTimeout(() => {
      if (mi + 1 < MARKET_MISSIONS.length) {
        setMi(mi + 1);
        setCart({});
        setMsg(null);
      } else {
        onFinish(
          { score: nextDone, max: MARKET_MISSIONS.length },
          overCount
            ? `Üç görevi tamamladın! ${overCount} kez bütçe aşıldı ama sepeti düzenleyerek sınırın içine döndün. Plan yapmak işte budur.`
            : "Üç görevi de bütçeyi hiç aşmadan tamamladın. Gerçek bir bütçe mimarısın!",
        );
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="card p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-coral-dark">
          Görev {mi + 1}/{MARKET_MISSIONS.length}
        </p>
        <h2 className="text-xl font-bold">{mission.title}</h2>
        <p className="font-semibold text-navy-soft">{mission.story}</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {mission.required.map((g) => {
            const ok = g.anyOf.some((id) => cart[id]);
            return (
              <li key={g.label} className={`chip ${ok ? "bg-success/25" : "bg-sky"}`}>
                {ok ? "✅" : "⬜"} {g.label}
              </li>
            );
          })}
        </ul>
      </div>

      <div className={`sticky top-2 z-10 rounded-2xl p-3 shadow-[var(--shadow-soft)] ${over ? "bg-coral/90 text-white" : "bg-navy text-white"}`} aria-live="polite">
        <div className="flex items-center justify-between font-display text-lg font-bold">
          <span>
            <ShoppingCart className="inline" size={20} /> Sepet: {total} TL
          </span>
          <span>{over ? `${-remaining} TL fazla!` : `Kalan: ${remaining} TL`}</span>
        </div>
        <ProgressBar value={Math.min(100, (total / mission.budget) * 100)} color={over ? "#fff" : "var(--color-turq)"} track="rgb(255 255 255 / 0.2)" height={10} label="Bütçe kullanımı" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {MARKET_ITEMS.map((it) => {
          const n = cart[it.id] ?? 0;
          return (
            <div key={it.id} className={`flex flex-col items-center rounded-3xl bg-white p-3 text-center shadow-[var(--shadow-soft)] ${n ? "ring-4 ring-turq" : ""}`}>
              <span className="text-4xl" aria-hidden>
                {it.emoji}
              </span>
              <span className="text-sm font-bold leading-tight">{it.name}</span>
              {it.note && <span className="text-[11px] font-semibold text-ink-muted">{it.note}</span>}
              <span className="mt-1 rounded-lg bg-sun px-2 font-display font-bold">{it.price} TL</span>
              <div className="mt-2 flex items-center gap-2">
                <button className="grid h-10 w-10 place-items-center rounded-xl bg-sky disabled:opacity-40" onClick={() => add(it, -1)} disabled={!n} aria-label={`${it.name} çıkar`}>
                  <Minus size={18} />
                </button>
                <span className="w-5 font-display text-lg font-bold" aria-label={`${n} adet`}>
                  {n}
                </span>
                <button className="grid h-10 w-10 place-items-center rounded-xl bg-turq" onClick={() => add(it, 1)} aria-label={`${it.name} ekle`}>
                  <Plus size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {msg && (
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`rounded-2xl p-3 font-semibold ${msg.tone === "ok" ? "bg-success/25" : "bg-sun/50"}`} role="status">
            {msg.text}
          </motion.p>
        )}
      </AnimatePresence>
      <button className="btn-primary w-full" onClick={checkout} disabled={!total}>
        Kasaya git (simülasyon)
      </button>
    </div>
  );
}
