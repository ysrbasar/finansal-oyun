import { motion } from "framer-motion";
import { Download, Lock, RotateCcw, ShieldAlert, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getState, replaceState, update, useAppState } from "../lib/store";
import {
  completedModuleCount,
  createInitialState,
  levelForXp,
  overallProgress,
  reviewQueue,
  topicStats,
} from "../lib/engine";
import { exportProgress, importProgress } from "../lib/storage";
import { TOPICS } from "../data/topics";
import { BADGES } from "../data/badges";
import { MODULES } from "../data/modules";
import { GAMES } from "../data/games";
import { goBack, navigate } from "../lib/router";
import { ProgressBar } from "../components/ui";
import { formatDate } from "../lib/util";

let unlockedThisSession = false;

export function ParentArea() {
  const [unlocked, setUnlocked] = useState(unlockedThisSession);
  return (
    <div className="min-h-dvh bg-[#F3F5F9] pb-12 -mx-4 px-4 sm:-mx-6 sm:px-6">
      <header className="flex flex-wrap items-center gap-3 py-4">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy text-white" aria-hidden>
          👪
        </span>
        <div className="min-w-40 flex-1">
          <h1 className="font-sans text-2xl font-extrabold">Ebeveyn Alanı</h1>
          <p className="text-sm font-semibold text-ink-muted">Minik Finans Kaşifleri · ilerleme ve ayarlar</p>
        </div>
        <button className="rounded-xl bg-white px-4 py-2 text-sm font-bold shadow-sm" onClick={() => goBack("/")}>
          Çocuk moduna dön
        </button>
      </header>
      {unlocked ? (
        <Dashboard />
      ) : (
        <Gate
          onPass={() => {
            unlockedThisSession = true;
            setUnlocked(true);
          }}
        />
      )}
    </div>
  );
}

function Gate({ onPass }: { onPass: () => void }) {
  const s = useAppState();
  const pin = s.settings.parentPin;
  const [held, setHeld] = useState(false);
  const [progress, setProgress] = useState(0);
  const timer = useRef<number | null>(null);
  const [q] = useState(() => {
    const a = 6 + Math.floor(Math.random() * 7);
    const b = 11 + Math.floor(Math.random() * 8);
    return { a, b, answer: a * b };
  });
  const [value, setValue] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const start = () => {
    const t0 = Date.now();
    timer.current = window.setInterval(() => {
      const p = Math.min(100, ((Date.now() - t0) / 2000) * 100);
      setProgress(p);
      if (p >= 100) {
        stop();
        setHeld(true);
      }
    }, 50);
  };
  const stop = () => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
    setProgress((p) => (p >= 100 ? p : 0));
  };
  useEffect(() => stop, []);

  const submit = () => {
    if (pin ? value === pin : Number(value) === q.answer) onPass();
    else {
      setErr(pin ? "PIN hatalı." : "Cevap hatalı. Tekrar deneyin.");
      setValue("");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-5 shadow-sm">
      <p className="flex items-center gap-2 font-bold">
        <Lock size={18} /> Bu alan yetişkinler içindir.
      </p>
      {!held ? (
        <>
          <p className="mt-2 text-sm text-ink-muted">Devam etmek için aşağıdaki düğmeyi 2 saniye basılı tutun.</p>
          <button
            className="relative mt-4 h-14 w-full overflow-hidden rounded-xl bg-navy font-bold text-white select-none touch-none"
            onPointerDown={start}
            onPointerUp={stop}
            onPointerLeave={stop}
            onPointerCancel={stop}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !timer.current) start();
            }}
            onKeyUp={stop}
            onContextMenu={(e) => e.preventDefault()}
          >
            <span className="absolute inset-y-0 left-0 bg-turq/60" style={{ width: `${progress}%` }} aria-hidden />
            <span className="relative">Basılı tut</span>
          </button>
        </>
      ) : (
        <form
          className="mt-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <label className="block text-sm font-bold">
            {pin ? "Ebeveyn PIN'i (4 hane)" : `${q.a} × ${q.b} kaçtır?`}
            <input
              autoFocus
              inputMode="numeric"
              type={pin ? "password" : "text"}
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, pin ? 4 : 4))}
              className="mt-1 h-12 w-full rounded-xl border-2 border-navy/15 px-3 text-lg font-bold outline-none focus:border-turq"
            />
          </label>
          {err && <p className="mt-2 text-sm font-bold text-coral-dark" role="alert">{err}</p>}
          <button className="mt-3 h-12 w-full rounded-xl bg-navy font-bold text-white">Giriş</button>
        </form>
      )}
      <p className="mt-4 rounded-xl bg-[#F3F5F9] p-3 text-xs text-ink-muted">
        Not: Bu kontrol yalnızca çocuğun yanlışlıkla bu alana girmesini zorlaştırmak içindir. Gerçek bir kimlik doğrulama ya da güvenlik mekanizması değildir; veriler bulutta korunmaz, yalnızca bu cihazda saklanır.
      </p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 font-sans text-lg font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

function Dashboard() {
  const s = useAppState();
  const stats = topicStats(s);
  const answered = stats.filter((t) => t.answered > 0);
  const strengths = answered.filter((t) => t.answered >= 2 && (t.firstTryRate ?? 0) >= 75);
  const review = new Set(reviewQueue(s).map((q) => q.topic));
  const weak = stats.filter((t) => (t.answered >= 2 && (t.firstTryRate ?? 100) < 60) || review.has(t.topic));
  const level = levelForXp(s.xp);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Toplam ilerleme", `%${overallProgress(s)}`],
          ["Toplam XP", `${s.xp} (Sv. ${level.level})`],
          ["Bölümler", `${completedModuleCount(s)}/10`],
          ["Dersler", `${Object.keys(s.completedLessons).length}/30`],
          ["Rozetler", `${Object.keys(s.badges).length}/${BADGES.length}`],
          ["Oyun oturumu", `${Object.values(s.games).reduce((a, g) => a + (g?.plays ?? 0), 0)}`],
          ["Sanal cüzdan", `${s.wallet.balance} TL`],
          ["Aktif gün", `${s.activeDays.length}`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-white p-3 shadow-sm">
            <p className="text-xs font-bold text-ink-muted">{k}</p>
            <p className="font-sans text-xl font-extrabold">{v}</p>
          </div>
        ))}
      </div>

      <Card title="Konu bazında başarı">
        <p className="mb-3 text-xs text-ink-muted">
          <b>İlk deneme başarısı</b>: Soruya ilk karşılaşmada ilk denemede doğru cevap oranı. <b>Sonradan öğrenilen</b>: İlk denemede zorlanıp ikinci denemede ya da tekrar pratiğinde doğru yapılan sorular. Bu iki ölçü ayrı tutulur.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="text-xs text-ink-muted">
                <th className="py-1 font-bold">Konu</th>
                <th className="py-1 font-bold">İlk deneme başarısı</th>
                <th className="py-1 font-bold">Cevaplanan</th>
                <th className="py-1 font-bold">Sonradan öğrenilen</th>
                <th className="py-1 font-bold">Pratik (üretilen)</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((t) => (
                <tr key={t.topic} className="border-t border-navy/5">
                  <td className="py-2 font-bold">
                    {TOPICS[t.topic].emoji} {TOPICS[t.topic].title}
                  </td>
                  <td className="w-40 py-2">
                    {t.firstTryRate === null ? (
                      <span className="text-ink-muted">Henüz yok</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ProgressBar value={t.firstTryRate} height={8} color={t.firstTryRate >= 75 ? "var(--color-success)" : t.firstTryRate >= 50 ? "var(--color-sun-dark)" : "var(--color-coral)"} label={`${TOPICS[t.topic].title} başarı`} />
                        <span className="font-bold">%{t.firstTryRate}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-2">{t.answered}</td>
                  <td className="py-2">{t.learnedLater}</td>
                  <td className="py-2">{t.practiceTotal ? `${t.practiceCorrect}/${t.practiceTotal}` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="💪 Güçlü yönler">
          {strengths.length ? (
            <ul className="space-y-1 text-sm font-semibold">
              {strengths.map((t) => (
                <li key={t.topic}>
                  {TOPICS[t.topic].emoji} {TOPICS[t.topic].title} (%{t.firstTryRate})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">Birkaç ders tamamlandıkça burada güçlü konular görünecek.</p>
          )}
        </Card>
        <Card title="🔁 Tekrar önerilen konular">
          {weak.length ? (
            <ul className="space-y-2 text-sm font-semibold">
              {weak.map((t) => (
                <li key={t.topic} className="flex items-center justify-between gap-2">
                  <span>
                    {TOPICS[t.topic].emoji} {TOPICS[t.topic].title}
                  </span>
                  <button className="rounded-lg bg-sky px-3 py-1 text-xs font-bold" onClick={() => navigate(`/tekrar/${t.topic}`)}>
                    Pratik aç
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">Şu an tekrar gerektiren bir konu görünmüyor.</p>
          )}
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Tamamlanan bölümler">
          <ul className="space-y-1 text-sm">
            {MODULES.map((m) => {
              const d = m.lessons.filter((l) => s.completedLessons[l.id]).length;
              return (
                <li key={m.id} className="flex justify-between">
                  <span>
                    {m.icon} {m.title}
                  </span>
                  <span className={`font-bold ${d === 3 ? "text-success-dark" : "text-ink-muted"}`}>{d}/3</span>
                </li>
              );
            })}
            <li className="flex justify-between border-t border-navy/5 pt-1">
              <span>🏆 Final</span>
              <span className="font-bold">{s.final ? `%${s.final.total} ${s.final.passed ? "(geçti)" : ""}` : "-"}</span>
            </li>
          </ul>
        </Card>
        <Card title="Kazanılan rozetler">
          {Object.keys(s.badges).length ? (
            <ul className="space-y-1 text-sm">
              {BADGES.filter((b) => s.badges[b.id]).map((b) => (
                <li key={b.id}>
                  {b.icon} <b>{b.title}</b> · <span className="text-ink-muted">{formatDate(s.badges[b.id].earnedAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">Henüz rozet yok.</p>
          )}
          <p className="mt-3 text-xs text-ink-muted">Oyunlar: {GAMES.filter((g) => s.games[g.id]?.completed).length}/{GAMES.length} tamamlandı.</p>
        </Card>
      </div>

      <Settings />
      <DataTools />

      <Card title="Eğitim yaklaşımı ve kullanım önerileri">
        <div className="space-y-2 text-sm leading-relaxed">
          <p>
            Uygulama, 8 yaş çocuklarının finansal okuryazarlığı ezber yerine <b>karar vererek</b> öğrenmesi için tasarlandı. Her ders kısa bir hikâye, bir öğrenme hedefi, somut bir örnek, kararlar ve kısa bir tekrardan oluşur. Yanlış cevaplarda çocuk cezalandırılmaz; ipucu, ikinci deneme ve daha kolay bir anlatım sunulur.
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>Günde 10–15 dakika (1–2 ders ya da bir oyun) bu yaş için yeterlidir. Günlük seri yoktur; ara vermek ceza getirmez.</li>
            <li>Ders sonrası kısa sohbetler öğrenmeyi güçlendirir: “Bugün ihtiyaç ile isteği nasıl ayırdın?”</li>
            <li>Markette fiyat karşılaştırması, küçük bir alışveriş listesi ya da evde bir birikim kavanozu gibi gerçek hayat etkinlikleriyle destekleyebilirsiniz.</li>
            <li>Kazanç modülündeki işletme oyunları hayalîdir; çocukların yabancılarla para alışverişi yapması önerilmez.</li>
            <li>Bağış ve paylaşım konuları zorunluluk olarak değil, seçenek olarak sunulur.</li>
          </ul>
          <p className="rounded-xl bg-[#F3F5F9] p-3 text-xs text-ink-muted">
            Gizlilik: Uygulamada reklam, uygulama içi satın alma, sohbet, sıralama tablosu ya da analitik servis yoktur. Tüm veriler yalnızca bu cihazın tarayıcı depolamasında tutulur. Sanal TL ve fiyatlar eğitim amaçlı örneklerdir; gerçek para, banka ya da ödeme sistemiyle bağlantı yoktur.
          </p>
        </div>
      </Card>
    </div>
  );
}

function Settings() {
  const s = useAppState();
  const [pinInput, setPinInput] = useState("");
  const [pinMsg, setPinMsg] = useState<string | null>(null);
  const set = (patch: Partial<typeof s.settings>) => update((st) => ({ ...st, settings: { ...st.settings, ...patch } }));
  return (
    <Card title="Ayarlar">
      <div className="space-y-4 text-sm">
        <label className="flex items-center justify-between gap-3">
          <span>
            <b>Ses efektleri</b>
          </span>
          <input type="checkbox" className="h-6 w-6 accent-[#35C9B1]" checked={s.settings.sound} onChange={(e) => set({ sound: e.target.checked })} />
        </label>
        <label className="flex items-center justify-between gap-3">
          <span>
            <b>Animasyonlar</b>
            <span className="block text-xs text-ink-muted">“Sistem” seçeneği cihazın hareket azaltma tercihine uyar.</span>
          </span>
          <select className="rounded-lg border-2 border-navy/15 px-2 py-1 font-bold" value={s.settings.motion} onChange={(e) => set({ motion: e.target.value as typeof s.settings.motion })}>
            <option value="sistem">Sistem</option>
            <option value="acik">Açık</option>
            <option value="kapali">Azaltılmış</option>
          </select>
        </label>
        <label className="flex items-center justify-between gap-3">
          <span>
            <b>Tüm bölümlerin kilidini aç</b>
            <span className="block text-xs text-ink-muted">Tanıtım ya da ileri düzey çocuklar için. Final dahil tüm alanlar açılır.</span>
          </span>
          <input type="checkbox" className="h-6 w-6 accent-[#35C9B1]" checked={s.settings.unlockAll} onChange={(e) => set({ unlockAll: e.target.checked })} />
        </label>
        <div>
          <b>Yerel ebeveyn PIN'i</b>
          <p className="text-xs text-ink-muted">{s.settings.parentPin ? "PIN tanımlı. Girişte çarpma sorusu yerine PIN istenir." : "PIN yok. Girişte basılı tutma + çarpma sorusu kullanılır."}</p>
          <div className="mt-2 flex gap-2">
            <input
              inputMode="numeric"
              placeholder="4 haneli PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="h-10 w-32 rounded-lg border-2 border-navy/15 px-2 font-bold"
              aria-label="Yeni PIN"
            />
            <button
              className="rounded-lg bg-navy px-3 font-bold text-white disabled:opacity-40"
              disabled={pinInput.length !== 4}
              onClick={() => {
                set({ parentPin: pinInput });
                setPinInput("");
                setPinMsg("PIN kaydedildi.");
              }}
            >
              Kaydet
            </button>
            {s.settings.parentPin && (
              <button
                className="rounded-lg bg-[#F3F5F9] px-3 font-bold"
                onClick={() => {
                  set({ parentPin: undefined });
                  setPinMsg("PIN kaldırıldı.");
                }}
              >
                Kaldır
              </button>
            )}
          </div>
          {pinMsg && <p className="mt-1 text-xs font-bold text-success-dark">{pinMsg}</p>}
        </div>
      </div>
    </Card>
  );
}

function DataTools() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const doExport = () => {
    const blob = new Blob([exportProgress(getState())], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `minik-finans-ilerleme-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMsg({ ok: true, text: "İlerleme dosyası indirildi. Dosyada takma ad ve PIN yer almaz." });
  };

  const doImport = async (file: File) => {
    if (file.size > 2_000_000) {
      setMsg({ ok: false, text: "Dosya çok büyük." });
      return;
    }
    const text = await file.text();
    const [next, err] = importProgress(text, getState());
    if (!next) {
      setMsg({ ok: false, text: err ?? "İçe aktarılamadı." });
      return;
    }
    if (!confirm("Bu cihazdaki mevcut ilerleme, dosyadaki ilerlemeyle değiştirilecek. Devam edilsin mi?")) return;
    replaceState(next);
    setMsg({ ok: true, text: "İlerleme içe aktarıldı." });
  };

  const doReset = () => {
    if (!confirm("Tüm ilerleme, XP, rozetler, sanal cüzdan ve hedefler silinecek. Bu işlem geri alınamaz. Emin misiniz?")) return;
    if (!confirm("Son onay: Sıfırlamadan önce isterseniz ilerlemeyi dışa aktarabilirsiniz. Şimdi sıfırlansın mı?")) return;
    replaceState(createInitialState());
    navigate("/", { replace: true });
  };

  return (
    <Card title="İlerleme verisi">
      <div className="flex flex-wrap gap-2">
        <button className="flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 font-bold text-white" onClick={doExport}>
          <Download size={18} /> Dışa aktar (.json)
        </button>
        <button className="flex items-center gap-2 rounded-xl bg-[#F3F5F9] px-4 py-2.5 font-bold" onClick={() => fileRef.current?.click()}>
          <Upload size={18} /> İçe aktar
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void doImport(f);
            e.target.value = "";
          }}
        />
        <button className="flex items-center gap-2 rounded-xl bg-coral/15 px-4 py-2.5 font-bold text-coral-dark" onClick={doReset}>
          <RotateCcw size={18} /> İlerlemeyi sıfırla
        </button>
      </div>
      {msg && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mt-3 flex items-center gap-2 text-sm font-bold ${msg.ok ? "text-success-dark" : "text-coral-dark"}`} role="status">
          {!msg.ok && <ShieldAlert size={16} />} {msg.text}
        </motion.p>
      )}
      <p className="mt-3 text-xs text-ink-muted">Dışa aktarılan dosya kişisel bilgi içermez (takma ad ve PIN çıkarılır). Veriler hiçbir sunucuya gönderilmez.</p>
    </Card>
  );
}
