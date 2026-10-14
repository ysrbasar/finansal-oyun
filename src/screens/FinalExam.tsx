import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { getState, update, useAppState } from "../lib/store";
import { FINAL_PASS_PERCENT, FINAL_REQUIRED_MODULES, completedModuleCount, isFinalUnlocked, recordFinal } from "../lib/engine";
import { SECURITY_SCENARIOS } from "../data/gameContent";
import { navigate } from "../lib/router";
import { shuffle } from "../lib/util";
import { Mascot, MascotSays } from "../components/Mascot";
import { NumPad } from "../components/NumPad";
import { PageHeader, ProgressBar, SimNote } from "../components/ui";
import { play } from "../lib/sound";

/** Final: Bütçe yönetimi, öncelik, hesaplama, birikim planı, güvenlik ve gerekçe */
const BUDGET = 150;
const ITEMS = [
  { id: "canta", emoji: "🎒", name: "Okul çantası (eskisi yırtık)", price: 65, need: true },
  { id: "defter", emoji: "📒", name: "3 defter", price: 25, need: true },
  { id: "mont", emoji: "🧥", name: "Yağmurluk (kış geliyor)", price: 50, need: true },
  { id: "oyun", emoji: "🎮", name: "Yeni oyun", price: 55, need: false },
  { id: "sticker", emoji: "✨", name: "Çıkartma seti", price: 15, need: false },
  { id: "kulaklik", emoji: "🎧", name: "Renkli kulaklık", price: 45, need: false },
];

const REASONS = [
  { id: "ihtiyac", text: "Önce ihtiyaçları seçtim.", good: true },
  { id: "butce", text: "Bütçe sınırını aşmamaya dikkat ettim.", good: true },
  { id: "birikim", text: "Kalan paranın bir kısmını biriktirmek istedim.", good: true },
  { id: "karsilastir", text: "Fiyatları ve faydayı karşılaştırdım.", good: true },
  { id: "rastgele", text: "Gözüme ilk çarpanı seçtim.", good: false },
  { id: "hepsi", text: "Ne olursa olsun hepsini istedim.", good: false },
];

type Step = "giris" | "secim" | "kalan" | "birikim" | "guvenlik" | "neden" | "sonuc";
const ORDER: Step[] = ["giris", "secim", "kalan", "birikim", "guvenlik", "neden", "sonuc"];

export function FinalExam() {
  const s = useAppState();
  const [step, setStep] = useState<Step>("giris");
  const [cart, setCart] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [calcTries, setCalcTries] = useState(0);
  const [calcScore, setCalcScore] = useState(0);
  const [calcNote, setCalcNote] = useState<string | null>(null);
  const [saveAmt, setSaveAmt] = useState(0);
  const [weekly, setWeekly] = useState(10);
  const scenario = useMemo(() => shuffle(SECURITY_SCENARIOS.filter((x) => !x.safe))[0], []);
  const actions = useMemo(() => shuffle(scenario.actions), [scenario]);
  const [secPick, setSecPick] = useState<string | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  const [result, setResult] = useState<{ planlama: number; degerlendirme: number; hesaplama: number; guvenlik: number } | null>(null);

  if (!isFinalUnlocked(s)) {
    return (
      <div className="pb-10">
        <PageHeader title="Büyük Finans Üstadı Finali" close="/kesif" />
        <MascotSays mood="fikir" tone="sun">
          Final kulesi {FINAL_REQUIRED_MODULES} bölüm tamamlanınca açılır. Şu an {completedModuleCount(s)} bölümü bitirdin. Haritada ilerlemeye devam!
        </MascotSays>
        <button className="btn-primary mt-6 w-full" onClick={() => navigate("/kesif", { replace: true })}>
          Haritaya dön
        </button>
      </div>
    );
  }

  const total = cart.reduce((a, id) => a + ITEMS.find((i) => i.id === id)!.price, 0);
  const left = BUDGET - total;
  const needs = ITEMS.filter((i) => i.need);
  const pickedNeeds = needs.filter((n) => cart.includes(n.id)).length;
  const goalRemaining = 80 - saveAmt; // örnek hedef: 80 TL
  const correctWeeks = Math.ceil(Math.max(0, goalRemaining) / weekly);
  const stepIdx = ORDER.indexOf(step);

  const toggle = (id: string) => {
    play("tik");
    setCart((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  };

  const checkCalc = (expected: number, onDone: () => void, hint: string) => {
    if (Number(answer) === expected) {
      play("dogru");
      setCalcScore((x) => x + (calcTries === 0 ? 2 : 1));
      setCalcNote(null);
      setAnswer("");
      setCalcTries(0);
      onDone();
    } else if (calcTries === 0) {
      play("ipucu");
      setCalcTries(1);
      setAnswer("");
      setCalcNote(`Birlikte düşünelim: ${hint}`);
    } else {
      play("ipucu");
      setCalcNote(null);
      setAnswer("");
      setCalcTries(0);
      onDone();
    }
  };

  const finish = () => {
    // Planlama: bütçe aşılmadı + ihtiyaçlar önce
    const planlama = Math.round(((left >= 0 ? 50 : 0) + (pickedNeeds / needs.length) * 50));
    // Değerlendirme: gerekçeler ve birikim kararı
    const good = reasons.filter((r) => REASONS.find((x) => x.id === r)?.good).length;
    const bad = reasons.length - good;
    const degerlendirme = Math.max(0, Math.min(100, good * 30 + (saveAmt > 0 ? 25 : 0) - bad * 30));
    // Hesaplama: iki işlem, her biri ilk denemede 2, ikinci denemede 1 puan
    const hesaplama = Math.round((calcScore / 4) * 100);
    const guvenlik = secPick === scenario.best ? 100 : 0;
    const scores = { planlama, degerlendirme, hesaplama, guvenlik };
    update((st) => recordFinal(st, scores));
    setResult(scores);
    setStep("sonuc");
  };

  const avg = result ? Math.round((result.planlama + result.degerlendirme + result.hesaplama + result.guvenlik) / 4) : 0;

  return (
    <div className="pb-10">
      <PageHeader title="Büyük Final" subtitle="Finans Üstadı Kulesi" close="/kesif" />
      {step !== "giris" && step !== "sonuc" && (
        <div className="mb-4">
          <ProgressBar value={(stepIdx / (ORDER.length - 1)) * 100} color="var(--color-sun-dark)" label="Final ilerlemesi" />
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex flex-col gap-4">
          {step === "giris" && (
            <>
              <div className="flex justify-center">
                <Mascot mood="vay" size={150} />
              </div>
              <h2 className="text-center text-3xl font-bold">Finans Üstadı sınavına hoş geldin!</h2>
              <div className="card p-4 font-semibold">
                <p>Bu görevde öğrendiklerinin hepsini kullanacaksın:</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>{BUDGET} sanal TL'lik bütçeyi yönet ve öncelik belirle</li>
                  <li>Kalan parayı hesapla</li>
                  <li>Bir birikim planı kur</li>
                  <li>Bir güvenlik durumunu çöz</li>
                  <li>Seçimlerinin nedenlerini açıkla</li>
                </ul>
                <p className="mt-2 text-sm text-ink-muted">Başarı sadece doğru cevap sayısı değil: planlama, değerlendirme, hesaplama ve güvenli karar birlikte puanlanır.</p>
              </div>
              <SimNote />
              <button className="btn-primary w-full text-xl" onClick={() => setStep("secim")}>
                Başla!
              </button>
            </>
          )}

          {step === "secim" && (
            <>
              <h2 className="text-2xl font-bold">1. Okul dönemi alışverişi</h2>
              <p className="font-semibold text-navy-soft">Bütçen {BUDGET} TL. Okulun yakında başlıyor, çantan yırtık ve kış geliyor. Neleri alırsın?</p>
              <div className={`sticky top-2 z-10 rounded-2xl p-3 font-display text-lg font-bold text-white ${left < 0 ? "bg-coral" : "bg-navy"}`} aria-live="polite">
                Seçilen: {total} TL · {left < 0 ? `${-left} TL fazla!` : `Kalan: ${left} TL`}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {ITEMS.map((it) => {
                  const on = cart.includes(it.id);
                  return (
                    <button key={it.id} onClick={() => toggle(it.id)} aria-pressed={on} className={`flex flex-col items-center rounded-3xl bg-white p-3 text-center shadow-[var(--shadow-soft)] ${on ? "ring-4 ring-turq" : ""}`}>
                      <span className="text-4xl" aria-hidden>
                        {it.emoji}
                      </span>
                      <span className="text-sm font-bold leading-tight">{it.name}</span>
                      <span className="mt-1 rounded-lg bg-sun px-2 font-display font-bold">{it.price} TL</span>
                      <span className="mt-1 text-xs font-bold text-turq-dark">{on ? "✓ Seçildi" : "Seç"}</span>
                    </button>
                  );
                })}
              </div>
              {left < 0 && <p className="rounded-2xl bg-sun/40 p-3 font-semibold">Bütçeyi aştın. Hangi ürün bekleyebilir? Birini çıkararak sınırın içine dön.</p>}
              <button className="btn-primary w-full" disabled={cart.length === 0 || left < 0} onClick={() => setStep("kalan")}>
                Alışverişi tamamla
              </button>
            </>
          )}

          {step === "kalan" && (
            <>
              <h2 className="text-2xl font-bold">2. Kalan parayı hesapla</h2>
              <p className="font-semibold">
                Bütçen {BUDGET} TL, harcaman {total} TL. Elinde kaç TL kaldı?
              </p>
              {calcNote && <p className="rounded-2xl bg-sun/40 p-3 font-semibold">{calcNote}</p>}
              <NumPad value={answer} onChange={setAnswer} unit="TL" onSubmit={() => checkCalc(left, () => setStep("birikim"), `${BUDGET} - ${total} işlemini yap.`)} />
            </>
          )}

          {step === "birikim" && (
            <>
              <h2 className="text-2xl font-bold">3. Birikim planı</h2>
              <p className="font-semibold">Elinde {left} TL var. 80 TL'lik bir bisiklet kaskı için birikim hedefi koymak istiyorsun. Bu paranın ne kadarını kavanoza koyarsın?</p>
              <div className="card flex items-center justify-center gap-4 p-4">
                <button className="grid h-14 w-14 place-items-center rounded-2xl bg-sky" onClick={() => setSaveAmt((v) => Math.max(0, v - 5))} aria-label="Azalt">
                  <Minus />
                </button>
                <span className="font-display text-4xl font-bold">{saveAmt} TL</span>
                <button className="grid h-14 w-14 place-items-center rounded-2xl bg-turq" onClick={() => setSaveAmt((v) => Math.min(Math.min(left, 80), v + 5))} aria-label="Artır">
                  <Plus />
                </button>
              </div>
              <p className="text-sm font-semibold text-ink-muted">Kaska kalan: {goalRemaining} TL</p>
              <label className="block font-bold">
                Her hafta {weekly} TL biriktirirsem:
                <input type="range" min={5} max={20} step={5} value={weekly} onChange={(e) => setWeekly(Number(e.target.value))} className="mt-1 w-full accent-[#35C9B1]" />
              </label>
              <p className="font-semibold">Kalan {goalRemaining} TL'yi haftada {weekly} TL ile kaç haftada tamamlarsın?</p>
              {calcNote && <p className="rounded-2xl bg-sun/40 p-3 font-semibold">{calcNote}</p>}
              <NumPad
                value={answer}
                onChange={setAnswer}
                unit="hafta"
                onSubmit={() =>
                  checkCalc(
                    correctWeeks,
                    () => setStep("guvenlik"),
                    `${weekly}'er ${weekly}'er ${goalRemaining}'e kadar say. Son hafta tam dolmasa da o haftayı da say.`,
                  )
                }
              />
            </>
          )}

          {step === "guvenlik" && (
            <>
              <h2 className="text-2xl font-bold">4. Güvenlik durumu</h2>
              <div className="rounded-[1.75rem] bg-navy p-4 text-white">
                <p className="text-sm font-bold text-sun">{scenario.sender}</p>
                <p className="mt-1 text-lg font-semibold">{scenario.message}</p>
              </div>
              <div className="grid gap-2">
                {actions.map((a) => (
                  <button
                    key={a.id}
                    disabled={!!secPick}
                    onClick={() => {
                      setSecPick(a.id);
                      play(a.id === scenario.best ? "dogru" : "ipucu");
                    }}
                    className={`min-h-14 rounded-2xl border-[3px] px-4 py-3 text-left font-bold ${
                      secPick && a.id === scenario.best ? "border-success bg-success/15" : secPick === a.id ? "border-coral bg-coral/10" : "border-navy/10 bg-white"
                    }`}
                  >
                    {a.text}
                  </button>
                ))}
              </div>
              {secPick && (
                <>
                  <p className="rounded-2xl bg-sky p-3 font-semibold">{scenario.explanation}</p>
                  <button className="btn-primary w-full" onClick={() => setStep("neden")}>
                    Devam
                  </button>
                </>
              )}
            </>
          )}

          {step === "neden" && (
            <>
              <h2 className="text-2xl font-bold">5. Neden böyle seçtin?</h2>
              <p className="font-semibold text-navy-soft">Alışveriş ve birikim kararlarını en iyi anlatan cümleleri seç (birden fazla seçebilirsin).</p>
              <div className="grid gap-2">
                {REASONS.map((r) => {
                  const on = reasons.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      aria-pressed={on}
                      onClick={() => setReasons((x) => (on ? x.filter((y) => y !== r.id) : [...x, r.id]))}
                      className={`min-h-14 rounded-2xl border-[3px] px-4 py-3 text-left font-bold ${on ? "border-turq bg-turq/15" : "border-navy/10 bg-white"}`}
                    >
                      {on ? "☑️" : "⬜"} {r.text}
                    </button>
                  );
                })}
              </div>
              <button className="btn-primary w-full" disabled={reasons.length === 0} onClick={finish}>
                Sınavı bitir
              </button>
            </>
          )}

          {step === "sonuc" && result && (
            <>
              <div className="flex justify-center">
                <Mascot mood={avg >= FINAL_PASS_PERCENT ? "kutlama" : "cesaret"} size={150} />
              </div>
              <h2 className="text-center text-3xl font-bold">{avg >= FINAL_PASS_PERCENT ? "Tebrikler, Finans Ustası!" : "Çok yaklaştın!"}</h2>
              <p className="text-center font-display text-2xl font-bold">Genel puan: %{avg}</p>
              <div className="card grid gap-3 p-4">
                {(
                  [
                    ["planlama", "📋 Planlama", "Bütçeyi aşmamak ve ihtiyaçları önce seçmek"],
                    ["degerlendirme", "⚖️ Değerlendirme", "Gerekçeler ve birikim kararı"],
                    ["hesaplama", "🧮 Hesaplama", "Kalan para ve hafta hesabı"],
                    ["guvenlik", "🛡️ Güvenli karar", "Şüpheli mesaja doğru tepki"],
                  ] as const
                ).map(([k, label, desc]) => (
                  <div key={k}>
                    <div className="flex justify-between font-bold">
                      <span>{label}</span>
                      <span>%{result[k]}</span>
                    </div>
                    <ProgressBar value={result[k]} color={result[k] >= 60 ? "var(--color-success)" : "var(--color-sun-dark)"} label={label} height={10} />
                    <p className="text-xs font-semibold text-ink-muted">{desc}</p>
                  </div>
                ))}
              </div>
              {avg < FINAL_PASS_PERCENT && <p className="text-center font-semibold">Geçmek için %{FINAL_PASS_PERCENT} gerekiyor. İstediğin zaman tekrar deneyebilirsin; en iyi sonucun saklanır.</p>}
              <button className="btn-primary w-full" onClick={() => navigate(getState().final?.passed ? "/koleksiyon" : "/kesif", { replace: true })}>
                {avg >= FINAL_PASS_PERCENT ? "Rozetlerime bak" : "Haritaya dön"}
              </button>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
