import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { AVATARS } from "../data/avatars";
import { update } from "../lib/store";
import { Mascot } from "../components/Mascot";
import { Logo } from "../components/Logo";
import { AvatarBadge } from "../components/ui";
import { Banknote } from "../components/Money";
import { navigate } from "../lib/router";
import { play } from "../lib/sound";

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const avatar = AVATARS.find((a) => a.id === avatarId);

  const finish = () => {
    update((s) => ({
      ...s,
      profile: { nickname: nickname.trim().slice(0, 20), avatarId: avatarId ?? AVATARS[0].id, createdAt: Date.now() },
    }));
    navigate("/", { replace: true });
  };

  return (
    <div
      className="bg-dots pt-safe flex min-h-dvh flex-col items-center justify-center px-4 py-8"
      style={{ background: avatar ? `linear-gradient(180deg, ${avatar.color}33, #FFF9F0 60%)` : undefined }}
    >
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.section key="s0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
              <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 12 }} className="mx-auto mb-2 w-fit">
                <Logo size={64} />
              </motion.div>
              <p className="font-display text-lg font-semibold text-turq-dark">Minik Finans Kaşifleri</p>
              <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25, type: "spring" }} className="mx-auto w-fit">
                <Mascot mood="merhaba" size={200} />
              </motion.div>
              <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-4xl font-bold">
                Finans Kaşifliği Başlıyor!
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mx-auto mt-3 max-w-sm text-lg font-semibold text-navy-soft">
                Ben Kumbi! Birlikte parayı tanıyacak, akıllı kararlar verecek ve hedeflerimize doğru biriktireceğiz.
              </motion.p>
              <p className="mt-1 font-display text-base font-semibold text-coral-dark">Paranı tanı, geleceğini keşfet!</p>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="btn-primary mt-8 w-full text-xl"
                onClick={() => {
                  play("tik");
                  setStep(1);
                }}
              >
                Maceraya Başla
              </motion.button>
            </motion.section>
          )}

          {step === 1 && (
            <motion.section key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <h1 className="text-center text-3xl font-bold">Kaşifini seç</h1>
              <p className="mt-1 text-center font-semibold text-navy-soft">Haritada seni bu kaşif temsil edecek.</p>
              <div className="mt-5 grid grid-cols-4 gap-3" role="radiogroup" aria-label="Avatar seçimi">
                {AVATARS.map((a) => {
                  const on = a.id === avatarId;
                  return (
                    <motion.button
                      key={a.id}
                      role="radio"
                      aria-checked={on}
                      aria-label={a.name}
                      whileTap={{ scale: 0.9 }}
                      animate={on ? { scale: 1.08, y: -4 } : { scale: 1, y: 0 }}
                      onClick={() => {
                        play("tik");
                        setAvatarId(a.id);
                      }}
                      className={`grid aspect-square place-items-center rounded-3xl text-4xl shadow-[var(--shadow-soft)] ${on ? "ring-4 ring-navy" : "ring-2 ring-white"}`}
                      style={{ background: a.color }}
                    >
                      <span aria-hidden>{a.emoji}</span>
                    </motion.button>
                  );
                })}
              </div>
              <div className="mt-5 min-h-28">
                <AnimatePresence mode="wait">
                  {avatar ? (
                    <motion.div key={avatar.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-end gap-2">
                      <Mascot mood="mutlu" size={90} />
                      <div className="mb-3 rounded-2xl bg-white px-4 py-3 font-semibold shadow-[var(--shadow-soft)]">
                        <span className="font-display text-lg">{avatar.name}! </span>
                        {avatar.reaction}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="none" className="flex items-end gap-2">
                      <Mascot mood="fikir" size={90} />
                      <div className="mb-3 rounded-2xl bg-white px-4 py-3 font-semibold shadow-[var(--shadow-soft)]">Hangisi sana benziyor? Birine dokun!</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <label className="mt-4 block">
                <span className="font-display text-lg font-semibold">Takma adın (isteğe bağlı)</span>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.slice(0, 20))}
                  placeholder="Örneğin: Kaşif Yıldız"
                  className="mt-1 h-14 w-full rounded-2xl border-[3px] border-navy/10 bg-white px-4 text-lg font-bold outline-none focus:border-turq"
                  autoComplete="off"
                  maxLength={20}
                />
                <span className="mt-1 block text-xs font-semibold text-ink-muted">Gerçek adını, soyadını ya da başka bilgilerini yazmana gerek yok. Takma ad yalnızca bu cihazda saklanır.</span>
              </label>
              <button className="btn-primary mt-6 w-full" disabled={!avatarId} onClick={() => setStep(2)}>
                Devam et
              </button>
            </motion.section>
          )}

          {step === 2 && (
            <motion.section key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-center">
              <div className="mx-auto w-fit">
                <AvatarBadge profile={{ avatarId: avatarId ?? "tilki", nickname, createdAt: 0 }} size={88} />
              </div>
              <h1 className="mt-3 text-3xl font-bold">Kaşif çantan hazır{nickname.trim() ? `, ${nickname.trim()}` : ""}!</h1>
              <div className="card mt-5 p-4 text-left">
                <div className="flex items-center gap-3">
                  <Banknote value={100} width={110} />
                  <div>
                    <p className="font-display text-xl font-bold">100 sanal TL</p>
                    <p className="text-sm font-semibold text-navy-soft">Oyun içi cüzdanına eklendi.</p>
                  </div>
                </div>
                <p className="mt-3 rounded-xl bg-sky p-3 text-sm font-semibold">
                  Bu bir <b>simülasyondur</b>. Sanal TL gerçek para değildir; sadece bütçe ve birikim alıştırmaları için kullanılır.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm font-semibold">
                  <div className="rounded-xl bg-sun/40 p-3">
                    <p className="font-display text-lg">⭐ XP</p>
                    Öğrendikçe kazandığın puan. Seviye atlamanı sağlar. Harcanmaz.
                  </div>
                  <div className="rounded-xl bg-turq/20 p-3">
                    <p className="font-display text-lg">🪙 Sanal TL</p>
                    Biriktirip harcayabildiğin oyun parası. Alıştırma için.
                  </div>
                </div>
              </div>
              <button className="btn-primary mt-6 w-full text-xl" onClick={finish}>
                Haritaya çık!
              </button>
              <button className="mt-3 text-sm font-bold text-ink-muted underline" onClick={() => setStep(1)}>
                Geri dön
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
