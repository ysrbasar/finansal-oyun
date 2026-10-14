import { AnimatePresence, motion } from "framer-motion";
import { Trash2, Wallet } from "lucide-react";
import { useState } from "react";
import type { SavingsGoal } from "../types";
import { update, useAppState } from "../lib/store";
import { MAX_ACTIVE_GOALS, createGoal, deleteGoal, depositToGoal, withdrawFromGoal } from "../lib/engine";
import { navigate } from "../lib/router";
import { Jar } from "../components/Jar";
import { MascotSays } from "../components/Mascot";
import { ProgressBar, SimNote } from "../components/ui";
import { play } from "../lib/sound";

const EMOJIS = ["🎯", "📚", "⚽", "🎨", "🧩", "🚲", "🎧", "🪁", "🧸", "🔭", "🎁", "🌱"];

export function SavingsLab() {
  const s = useAppState();
  const active = s.goals.filter((g) => !g.completedAt);
  const done = s.goals.filter((g) => g.completedAt);
  const [creating, setCreating] = useState(active.length === 0);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Birikim Laboratuvarı</h1>
          <p className="font-semibold text-ink-muted">Hedef koy, kavanozu doldur, kararlarının etkisini gör.</p>
        </div>
        <button className="chip shrink-0 bg-white py-2 shadow-sm" onClick={() => navigate("/cuzdan")} aria-label={`Cüzdan: ${s.wallet.balance} sanal TL`}>
          <Wallet size={18} /> {s.wallet.balance} TL
        </button>
      </header>
      <SimNote />

      {active.map((g) => (
        <GoalCard key={g.id} goal={g} />
      ))}

      <AnimatePresence>
        {creating ? (
          <NewGoal onDone={() => setCreating(false)} canCancel={active.length > 0} />
        ) : (
          active.length < MAX_ACTIVE_GOALS && (
            <button className="btn-ghost w-full" onClick={() => setCreating(true)}>
              ＋ Yeni birikim hedefi
            </button>
          )
        )}
      </AnimatePresence>

      <Calculators goal={active[0]} />

      {done.length > 0 && (
        <section className="card p-4">
          <h2 className="font-display text-lg font-bold">🏆 Hedef rafı</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {done.map((g) => (
              <div key={g.id} className="flex items-center gap-2 rounded-2xl bg-success/20 px-3 py-2 font-bold">
                <span className="text-2xl" aria-hidden>
                  {g.emoji}
                </span>
                {g.name} · {g.target} TL
                <button className="ml-1 text-ink-muted" onClick={() => update((st) => deleteGoal(st, g.id))} aria-label={`${g.name} hedefini raftan kaldır`}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function GoalCard({ goal }: { goal: SavingsGoal }) {
  const s = useAppState();
  const [amount, setAmount] = useState(10);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const remaining = goal.target - goal.saved;
  const pct = Math.round((goal.saved / goal.target) * 100);
  const add = Math.min(amount, remaining, s.wallet.balance);
  const after = goal.saved + add;

  const run = (fn: (st: typeof s) => [typeof s, string | null], okText: string) => {
    let err: string | null = null;
    update((st) => {
      const [n, e] = fn(st);
      err = e;
      return n;
    });
    if (err) {
      play("ipucu");
      setMsg({ ok: false, text: err });
    } else {
      play("para");
      setMsg({ ok: true, text: okText });
    }
  };

  return (
    <motion.section layout className="card overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <Jar saved={goal.saved} target={goal.target} size={110} skin={s.profile?.jarSkin} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl font-bold">
            {goal.emoji} {goal.name}
          </p>
          <dl className="mt-1 grid grid-cols-3 gap-1 text-center text-xs font-bold">
            <div className="rounded-xl bg-sky p-1.5">
              <dt className="text-ink-muted">Hedef</dt>
              <dd className="font-display text-base">{goal.target} TL</dd>
            </div>
            <div className="rounded-xl bg-turq/20 p-1.5">
              <dt className="text-ink-muted">Birikim</dt>
              <dd className="font-display text-base">{goal.saved} TL</dd>
            </div>
            <div className="rounded-xl bg-coral/15 p-1.5">
              <dt className="text-ink-muted">Kalan</dt>
              <dd className="font-display text-base">{remaining} TL</dd>
            </div>
          </dl>
          <div className="mt-2 flex items-center gap-2">
            <ProgressBar value={pct} label="Hedef ilerlemesi" />
            <span className="font-display font-bold">%{pct}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-navy/5 bg-cream/60 p-4">
        <p className="text-sm font-bold">Ne kadar eklemek istersin?</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[5, 10, 20, 50].map((v) => (
            <button key={v} onClick={() => setAmount(v)} className={`chip ${amount === v ? "bg-turq" : "bg-white shadow-sm"}`} aria-pressed={amount === v}>
              {v} TL
            </button>
          ))}
        </div>
        <p className="mt-2 rounded-xl bg-white p-2 text-sm font-semibold" aria-live="polite">
          {s.wallet.balance === 0
            ? "Cüzdanında sanal para yok. Ders ve oyunlarla kazanabilirsin!"
            : `${add} TL eklersen kavanozda ${after} TL olur, hedefe ${goal.target - after} TL kalır. Cüzdanda ${s.wallet.balance - add} TL kalır.`}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="btn-primary" disabled={add <= 0} onClick={() => run((st) => depositToGoal(st, goal.id, add), `${add} TL kavanoza eklendi!`)}>
            Kavanoza ekle
          </button>
          <button
            className="btn-ghost"
            disabled={goal.saved <= 0}
            onClick={() => {
              const back = Math.min(amount, goal.saved);
              run((st) => withdrawFromGoal(st, goal.id, back), `${back} TL cüzdana geri döndü. Hedefe kalan tutar ${remaining + back} TL oldu.`);
            }}
          >
            Geri al
          </button>
        </div>
        {msg && (
          <p className={`mt-2 rounded-xl p-2 text-sm font-semibold ${msg.ok ? "bg-success/20" : "bg-sun/40"}`} role="status">
            {msg.text}
          </p>
        )}
        <button
          className="mt-3 flex items-center gap-1 text-xs font-bold text-ink-muted underline"
          onClick={() => {
            if (confirm(`"${goal.name}" hedefi silinsin mi? Kavanozdaki ${goal.saved} TL cüzdana geri döner.`)) update((st) => deleteGoal(st, goal.id));
          }}
        >
          <Trash2 size={14} /> Hedefi sil
        </button>
      </div>
    </motion.section>
  );
}

function NewGoal({ onDone, canCancel }: { onDone: () => void; canCancel: boolean }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [target, setTarget] = useState(100);
  const [err, setErr] = useState<string | null>(null);
  const submit = () => {
    let e: string | null = null;
    update((st) => {
      const [n, er] = createGoal(st, name, emoji, target);
      e = er;
      return n;
    });
    if (e) setErr(e);
    else onDone();
  };
  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card p-4">
      <h2 className="font-display text-xl font-bold">Yeni hedef oluştur</h2>
      <label className="mt-3 block">
        <span className="text-sm font-bold">Hedefin adı</span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder="Örneğin: Macera kitabı" className="mt-1 h-12 w-full rounded-2xl border-[3px] border-navy/10 px-3 font-bold outline-none focus:border-turq" />
      </label>
      <p className="mt-3 text-sm font-bold">Simgesi</p>
      <div className="mt-1 flex flex-wrap gap-2" role="radiogroup" aria-label="Hedef simgesi">
        {EMOJIS.map((e) => (
          <button key={e} role="radio" aria-checked={emoji === e} onClick={() => setEmoji(e)} className={`grid h-11 w-11 place-items-center rounded-xl text-2xl ${emoji === e ? "bg-turq" : "bg-sky"}`}>
            {e}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm font-bold">Hedef tutarı: {target} TL</p>
      <input type="range" min={10} max={500} step={5} value={target} onChange={(e) => setTarget(Number(e.target.value))} className="mt-1 w-full accent-[#35C9B1]" aria-label="Hedef tutarı" />
      <div className="mt-1 flex flex-wrap gap-2">
        {[50, 100, 150, 250].map((v) => (
          <button key={v} className="chip bg-white shadow-sm" onClick={() => setTarget(v)}>
            {v} TL
          </button>
        ))}
      </div>
      {err && (
        <p className="mt-2 rounded-xl bg-sun/40 p-2 text-sm font-semibold" role="alert">
          {err}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        {canCancel && (
          <button className="btn-ghost" onClick={onDone}>
            Vazgeç
          </button>
        )}
        <button className="btn-primary flex-1" onClick={submit}>
          Hedefi kaydet
        </button>
      </div>
    </motion.section>
  );
}

function Calculators({ goal }: { goal?: SavingsGoal }) {
  const s = useAppState();
  const remaining = goal ? goal.target - goal.saved : 60;
  const [weekly, setWeekly] = useState(10);
  const [spend, setSpend] = useState(0);
  const weeks = Math.ceil(remaining / weekly);
  const weeksAfter = Math.ceil((remaining + spend) / weekly);
  return (
    <section className="card p-4">
      <h2 className="font-display text-xl font-bold">🧮 Hesaplama araçları</h2>
      <div className="mt-3 rounded-2xl bg-sky p-3">
        <p className="font-bold">Kaç haftada ulaşırım?</p>
        <p className="text-sm font-semibold text-ink-muted">{goal ? `"${goal.name}" için kalan: ${remaining} TL` : "Örnek: 60 TL'lik bir hedef"}</p>
        <label className="mt-2 block text-sm font-bold">
          Haftada {weekly} TL biriktirirsem
          <input type="range" min={5} max={50} step={5} value={weekly} onChange={(e) => setWeekly(Number(e.target.value))} className="mt-1 w-full accent-[#35C9B1]" />
        </label>
        <p className="font-display text-lg font-bold" aria-live="polite">
          {remaining <= 0 ? "Hedefe ulaştın!" : `${remaining} ÷ ${weekly} → yaklaşık ${weeks} hafta`}
        </p>
      </div>
      <div className="mt-3 rounded-2xl bg-coral/10 p-3">
        <p className="font-bold">Bugün harcarsam ne olur?</p>
        <label className="mt-1 block text-sm font-bold">
          {spend} TL harcarsam
          <input type="range" min={0} max={Math.max(0, Math.min(100, s.wallet.balance))} step={5} value={spend} onChange={(e) => setSpend(Number(e.target.value))} className="mt-1 w-full accent-[#FF7A70]" />
        </label>
        <p className="text-sm font-semibold" aria-live="polite">
          {spend === 0
            ? "Kaydırıcıyı oynat ve harcamanın hedefini nasıl etkilediğini gör."
            : `Bu ${spend} TL'yi biriktirmek yerine harcarsan hedefine ${weeksAfter - weeks} hafta daha geç ulaşırsın (${weeks} yerine ${weeksAfter} hafta). İşte fırsat maliyeti!`}
        </p>
      </div>
      <div className="mt-3">
        <MascotSays mood="birikim" size={58}>
          Küçük adımlar da büyük hedeflere götürür!
        </MascotSays>
      </div>
    </section>
  );
}
