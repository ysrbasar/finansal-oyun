import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { NumPad } from "../components/NumPad";
import { play } from "../lib/sound";
import type { GameProps } from "../screens/GameScreen";

const PACKS = [
  { id: "kucuk", name: "Küçük malzeme paketi", count: 6, cost: 18, emoji: "📦" },
  { id: "buyuk", name: "Büyük malzeme paketi", count: 12, cost: 30, emoji: "🗃️" },
];

/** Hayali müşterilerin bir ayraç için ödemeye razı olduğu en yüksek fiyat (örnek senaryo) */
const CUSTOMERS = [
  { e: "👩", max: 6 },
  { e: "👨", max: 4 },
  { e: "👵", max: 5 },
  { e: "🧑", max: 3 },
  { e: "👧", max: 5 },
  { e: "👴", max: 7 },
  { e: "👩‍🦱", max: 4 },
  { e: "🧔", max: 6 },
  { e: "👱", max: 5 },
  { e: "👩‍🦰", max: 3 },
  { e: "🧑‍🦳", max: 8 },
  { e: "👦", max: 4 },
];

type Step = "paket" | "fiyat" | "satis" | "gelir" | "kar" | "ozet";

export function WorkshopGame({ onFinish }: GameProps) {
  const [step, setStep] = useState<Step>("paket");
  const [pack, setPack] = useState(PACKS[0]);
  const [price, setPrice] = useState(4);
  const [sold, setSold] = useState(0);
  const [answer, setAnswer] = useState("");
  const [tries, setTries] = useState(0);
  const [score, setScore] = useState(0);
  const [note, setNote] = useState<string | null>(null);

  const buyers = CUSTOMERS.filter((c) => c.max >= price).length;
  const income = sold * price;
  const profit = income - pack.cost;

  const startSale = () => {
    const n = Math.min(pack.count, buyers);
    setSold(n);
    setStep("satis");
    play("para");
  };

  const checkNumber = (expected: number, onOk: () => void, hint: string) => {
    if (Number(answer) === expected) {
      play("dogru");
      setScore((s) => s + 1);
      setNote(null);
      setAnswer("");
      setTries(0);
      onOk();
    } else if (tries === 0) {
      play("ipucu");
      setTries(1);
      setAnswer("");
      setNote(`Birlikte düşünelim: ${hint}`);
    } else {
      play("ipucu");
      setNote(`Doğru cevap ${expected} TL. ${hint}`);
      setAnswer("");
      setTries(0);
      onOk();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="card flex items-center gap-3 p-4">
        <span className="text-4xl" aria-hidden>
          🔖
        </span>
        <p className="font-semibold">Zehra'nın hayali ayraç atölyesini sen yönetiyorsun! Bu bir simülasyondur, gerçek alışveriş yapılmaz.</p>
      </div>

      {step === "paket" && (
        <>
          <h2 className="text-xl font-bold">1. Malzeme paketini seç</h2>
          {PACKS.map((p) => (
            <button key={p.id} onClick={() => setPack(p)} className={`card flex items-center gap-3 p-4 text-left ${pack.id === p.id ? "ring-4 ring-turq" : ""}`} aria-pressed={pack.id === p.id}>
              <span className="text-4xl" aria-hidden>
                {p.emoji}
              </span>
              <span className="flex-1">
                <span className="block font-display text-lg font-bold">{p.name}</span>
                <span className="block text-sm font-semibold text-ink-muted">{p.count} ayraç yapılır</span>
              </span>
              <span className="rounded-lg bg-sun px-2 font-display font-bold">Gider: {p.cost} TL</span>
            </button>
          ))}
          <button className="btn-primary" onClick={() => setStep("fiyat")}>
            Ayraçları üret
          </button>
        </>
      )}

      {step === "fiyat" && (
        <>
          <h2 className="text-xl font-bold">2. Bir ayracın satış fiyatını belirle</h2>
          <div className="flex flex-wrap justify-center gap-1 text-3xl" aria-label={`${pack.count} ayraç üretildi`}>
            {Array.from({ length: pack.count }).map((_, k) => (
              <motion.span key={k} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: k * 0.05 }} aria-hidden>
                🔖
              </motion.span>
            ))}
          </div>
          <div className="card flex items-center justify-center gap-4 p-4">
            <button className="grid h-14 w-14 place-items-center rounded-2xl bg-sky" onClick={() => setPrice((p) => Math.max(1, p - 1))} aria-label="Fiyatı azalt">
              <Minus />
            </button>
            <span className="font-display text-4xl font-bold" aria-live="polite">
              {price} TL
            </span>
            <button className="grid h-14 w-14 place-items-center rounded-2xl bg-turq" onClick={() => setPrice((p) => Math.min(10, p + 1))} aria-label="Fiyatı artır">
              <Plus />
            </button>
          </div>
          <p className="rounded-2xl bg-sky p-3 text-sm font-semibold">İpucu: Fiyat çok yüksekse daha az müşteri alır; çok düşükse giderini karşılayamayabilirsin. Gider: {pack.cost} TL.</p>
          <button className="btn-primary" onClick={startSale}>
            Satışa başla
          </button>
        </>
      )}

      {step === "satis" && (
        <>
          <h2 className="text-xl font-bold">3. Satış günü</h2>
          <div className="grid grid-cols-6 gap-2">
            {CUSTOMERS.map((c, k) => {
              const buys = c.max >= price && CUSTOMERS.slice(0, k).filter((x) => x.max >= price).length < pack.count;
              return (
                <motion.div key={k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.08 }} className={`grid place-items-center rounded-2xl p-1 ${buys ? "bg-success/20" : "bg-navy/5"}`}>
                  <span className="text-2xl" aria-hidden>
                    {c.e}
                  </span>
                  <span className="text-xs" aria-hidden>
                    {buys ? "🔖✅" : "🙅"}
                  </span>
                </motion.div>
              );
            })}
          </div>
          <p className="card p-4 font-semibold">
            {sold} ayraç sattın, tanesi {price} TL. {pack.count - sold > 0 ? `${pack.count - sold} ayraç elinde kaldı.` : "Hepsi satıldı!"}
            {buyers > pack.count ? ` ${buyers - pack.count} müşteri daha almak istedi ama ayraç kalmadı.` : ""}
          </p>
          <button className="btn-primary" onClick={() => setStep("gelir")}>
            Hesaplamaya geç
          </button>
        </>
      )}

      {step === "gelir" && (
        <>
          <h2 className="text-xl font-bold">4. Gelirin kaç TL?</h2>
          <p className="font-semibold">
            {sold} ayraç × {price} TL = ?
          </p>
          {note && <p className="rounded-2xl bg-sun/40 p-3 font-semibold">{note}</p>}
          <NumPad value={answer} onChange={setAnswer} unit="TL" onSubmit={() => checkNumber(income, () => setStep("kar"), `Gelir = satılan adet × fiyat = ${sold} × ${price}.`)} />
        </>
      )}

      {step === "kar" && (
        <>
          <h2 className="text-xl font-bold">5. Kârın kaç TL?</h2>
          <p className="font-semibold">
            Gelir {income} TL, gider {pack.cost} TL. Kâr = gelir - gider = ?
          </p>
          {note && <p className="rounded-2xl bg-sun/40 p-3 font-semibold">{note}</p>}
          {profit < 0 ? (
            <div className="card p-4">
              <p className="font-semibold">
                Gelirin giderden az: {income} - {pack.cost} = {profit} TL. Buna <b>zarar</b> denir. Fiyatı ya da paketi değiştirerek tekrar deneyebilirsin!
              </p>
              <button className="btn-dark mt-3 w-full" onClick={() => setStep("ozet")}>
                Özeti gör
              </button>
            </div>
          ) : (
            <NumPad value={answer} onChange={setAnswer} unit="TL" onSubmit={() => checkNumber(profit, () => setStep("ozet"), `Kâr = ${income} - ${pack.cost}.`)} />
          )}
        </>
      )}

      {step === "ozet" && (
        <div className="card p-4">
          <h2 className="text-xl font-bold">Atölye raporu</h2>
          <ul className="mt-2 space-y-1 font-semibold">
            <li>🧾 Gider (malzeme): {pack.cost} TL</li>
            <li>💰 Gelir: {income} TL</li>
            <li>{profit > 0 ? "⭐ Kâr" : profit === 0 ? "➖ Başa baş" : "📉 Zarar"}: {Math.abs(profit)} TL</li>
          </ul>
          {note && <p className="mt-2 text-sm font-semibold text-navy-soft">{note}</p>}
          <button
            className="btn-primary mt-4 w-full"
            onClick={() =>
              onFinish(
                { score: score + (profit > 0 ? 1 : 0), max: 3, extra: { profit } },
                profit > 0
                  ? `Kâr ettin! Gelir ${income} TL, gider ${pack.cost} TL, kâr ${profit} TL. Gelir ile kâr aynı şey değildir.`
                  : `Bu sefer kâr olmadı. Fiyat ve paket seçimini değiştirip tekrar dene: Kâr için gelir giderden büyük olmalı.`,
              )
            }
          >
            Atölyeyi kapat
          </button>
        </div>
      )}
    </div>
  );
}
