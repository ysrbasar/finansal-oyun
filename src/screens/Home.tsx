import { motion } from "framer-motion";
import { ChevronRight, Settings, Sparkles } from "lucide-react";
import { useAppState, update } from "../lib/store";
import {
  claimDaily,
  isFinalUnlocked,
  lastBadge,
  nextLesson,
  nextLevelInfo,
  overallProgress,
  reviewQueue,
  unseenBadgeCount,
} from "../lib/engine";
import { DAILY_QUESTS, DAILY_REWARD } from "../data/dailyQuests";
import { getLesson, getModule, MODULES } from "../data/modules";
import { getAvatar } from "../data/avatars";
import { navigate } from "../lib/router";
import { Mascot, MascotSays } from "../components/Mascot";
import { AvatarBadge, BadgeMedal, ProgressBar, ProgressRing, StatChip } from "../components/ui";
import { Jar } from "../components/Jar";
import { InstallCard } from "../components/InstallCard";

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Günaydın";
  if (h < 18) return "Merhaba";
  return "İyi akşamlar";
}

export function Home() {
  const s = useAppState();
  const lvl = nextLevelInfo(s.xp);
  const avatar = getAvatar(s.profile?.avatarId);
  const active = s.activeLesson ? getLesson(s.activeLesson.lessonId) : undefined;
  const upcoming = active ?? nextLesson(s);
  const upcomingModule = upcoming ? getModule(upcoming.moduleId) : undefined;
  const quest = DAILY_QUESTS.find((q) => q.id === s.daily?.questId);
  const questDone = quest && s.daily ? s.daily.progress >= quest.target : false;
  const goal = s.goals.find((g) => !g.completedAt);
  const badge = lastBadge(s);
  const unseen = unseenBadgeCount(s);
  const review = reviewQueue(s).length;
  const progress = overallProgress(s);
  const allDone = !upcoming;

  return (
    <div className="flex flex-col gap-4">
      {/* Selamlama */}
      <header className="flex items-center gap-3">
        <AvatarBadge profile={s.profile} size={58} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink-muted">{greeting()},</p>
          <h1 className="truncate text-2xl font-bold">{s.profile?.nickname || `${avatar.name} Kaşif`}!</h1>
        </div>
        <button className="grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-[var(--shadow-soft)] md:hidden" onClick={() => navigate("/ayarlar")} aria-label="Ayarlar">
          <Settings size={22} />
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        <StatChip tone="sun" icon="⭐" value={`${s.xp} XP`} label="Toplam XP" />
        <StatChip tone="turq" icon="🏅" value={`Seviye ${lvl.cur.level}`} label="Seviye" />
        <button onClick={() => navigate("/cuzdan")}>
          <StatChip tone="sky" icon="🪙" value={`${s.wallet.balance} sanal TL`} label="Sanal cüzdan" />
        </button>
      </div>

      {/* Ana odak: devam et */}
      <motion.section
        className="relative overflow-hidden rounded-[2rem] p-5 text-navy shadow-[var(--shadow-lift)]"
        style={{ background: `linear-gradient(135deg, ${upcomingModule?.color ?? "#35C9B1"}, #FFD166)` }}
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/20" aria-hidden />
        <div className="relative flex items-center gap-3">
          <div className="min-w-0 flex-1">
            {allDone ? (
              <>
                <p className="font-display text-sm font-bold uppercase tracking-wide opacity-80">Tüm dersler tamam!</p>
                <h2 className="mt-1 text-2xl font-bold leading-tight">{s.final?.passed ? "Sen bir Finans Ustasısın!" : "Büyük final seni bekliyor"}</h2>
                <button className="btn-dark mt-4" onClick={() => navigate(isFinalUnlocked(s) ? "/final" : "/kesif")}>
                  {s.final?.passed ? "Finali tekrar oyna" : "Finale git"} <ChevronRight size={20} />
                </button>
              </>
            ) : (
              <>
                <p className="font-display text-sm font-bold uppercase tracking-wide opacity-80">
                  {active ? "Kaldığın yerden devam et" : "Sıradaki keşif"} · {upcomingModule?.place}
                </p>
                <h2 className="mt-1 text-2xl font-bold leading-tight">{upcoming?.title}</h2>
                <button className="btn-dark mt-4" onClick={() => upcoming && navigate(`/ders/${upcoming.id}`)}>
                  {active ? "Devam et" : "Derse başla"} <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
          <Mascot mood={allDone ? "kutlama" : "fikir"} size={110} className="shrink-0" />
        </div>
      </motion.section>

      {/* Günün görevi */}
      {quest && s.daily && (
        <section className="card p-4" aria-labelledby="daily-title">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sun/50 text-2xl" aria-hidden>
              {quest.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-coral-dark">Bugünün finans görevi</p>
              <h2 id="daily-title" className="text-lg font-bold">
                {quest.title}
              </h2>
              <p className="text-sm font-semibold text-ink-muted">{quest.description}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <ProgressBar value={(s.daily.progress / quest.target) * 100} color="var(--color-sun-dark)" label="Günlük görev ilerlemesi" />
            <span className="shrink-0 text-sm font-bold">
              {s.daily.progress}/{quest.target}
            </span>
          </div>
          {s.daily.claimed ? (
            <p className="mt-3 flex items-center gap-2 font-bold text-success-dark">
              <Sparkles size={18} /> Ödülünü aldın. Yarın yeni görev!
            </p>
          ) : questDone ? (
            <motion.button className="btn-sun mt-3 w-full" animate={{ scale: [1, 1.03, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} onClick={() => update(claimDaily)}>
              🎁 Ödülünü al: +{DAILY_REWARD.xp} XP, +{DAILY_REWARD.coins} sanal TL
            </motion.button>
          ) : (
            <p className="mt-2 text-xs font-semibold text-ink-muted">
              Ödül: +{DAILY_REWARD.xp} XP ve +{DAILY_REWARD.coins} sanal TL. Kaçırırsan sorun değil, her gün yeni bir görev gelir.
            </p>
          )}
        </section>
      )}

      {/* İlerleme özeti */}
      <section className="grid grid-cols-2 gap-3">
        <div className="card flex flex-col items-center p-4 text-center">
          <ProgressRing value={lvl.progress} size={76} color="var(--color-sun-dark)">
            <span className="font-display text-2xl font-bold">{lvl.cur.level}</span>
          </ProgressRing>
          <p className="mt-2 font-display font-bold leading-tight">{lvl.cur.title}</p>
          <p className="text-xs font-semibold text-ink-muted">{lvl.next ? `Sonraki seviyeye ${lvl.remaining} XP` : "En yüksek seviye!"}</p>
        </div>
        <div className="card flex flex-col items-center p-4 text-center">
          <ProgressRing value={progress} size={76}>
            <span className="font-display text-xl font-bold">%{progress}</span>
          </ProgressRing>
          <p className="mt-2 font-display font-bold leading-tight">Öğrenme yolculuğu</p>
          <p className="text-xs font-semibold text-ink-muted">{Object.keys(s.completedLessons).length}/30 ders</p>
        </div>
      </section>

      {/* Tekrar önerisi */}
      {review > 0 && (
        <button className="card flex items-center gap-3 p-4 text-left" onClick={() => navigate("/tekrar")}>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-coral/20 text-2xl" aria-hidden>
            🔁
          </div>
          <div className="flex-1">
            <h2 className="font-display text-lg font-bold">Tekrar Köşesi</h2>
            <p className="text-sm font-semibold text-ink-muted">Zorlandığın {review} soruya benzer sorularla yeniden bakalım. Ek XP kazanabilirsin!</p>
          </div>
          <ChevronRight />
        </button>
      )}

      {/* Birikim ve cüzdan */}
      <section className="grid gap-3 sm:grid-cols-2">
        <button className="card flex items-center gap-3 p-4 text-left" onClick={() => navigate("/birikim")}>
          <Jar saved={goal?.saved ?? 0} target={goal?.target ?? 1} size={64} skin={s.profile?.jarSkin} />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-bold">Birikim hedefin</h2>
            {goal ? (
              <>
                <p className="truncate text-sm font-bold">
                  {goal.emoji} {goal.name}
                </p>
                <ProgressBar value={(goal.saved / goal.target) * 100} label="Birikim ilerlemesi" height={10} />
                <p className="mt-1 text-xs font-semibold text-ink-muted">
                  {goal.saved} / {goal.target} TL · kalan {goal.target - goal.saved} TL
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold text-ink-muted">Henüz bir hedefin yok. Bir tane oluşturalım mı?</p>
            )}
          </div>
        </button>
        <button className="card flex items-center gap-3 p-4 text-left" onClick={() => navigate("/koleksiyon")}>
          {badge ? <BadgeMedal icon={badge.icon} color={badge.color} earned size={64} /> : <BadgeMedal icon="" color="#ccc" earned={false} size={64} />}
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-bold">
              Rozetler {unseen > 0 && <span className="chip ml-1 bg-coral py-0.5 text-xs text-white">{unseen} yeni!</span>}
            </h2>
            <p className="text-sm font-semibold text-ink-muted">{badge ? `Son rozet: ${badge.title}` : "İlk dersi bitir, ilk rozetini kazan!"}</p>
            <p className="text-xs font-bold">{Object.keys(s.badges).length} rozet kazanıldı</p>
          </div>
        </button>
      </section>

      {/* Sıradaki bölüm şeridi */}
      <section className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Keşif haritan</h2>
          <button className="text-sm font-bold text-turq-dark" onClick={() => navigate("/kesif")}>
            Haritayı aç →
          </button>
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {MODULES.map((m) => {
            const done = m.lessons.filter((l) => s.completedLessons[l.id]).length;
            return (
              <button key={m.id} onClick={() => navigate(`/kesif/${m.id}`)} className="flex w-20 shrink-0 flex-col items-center gap-1" aria-label={`${m.place}: ${done}/3 ders`}>
                <span className="grid h-14 w-14 place-items-center rounded-2xl text-3xl" style={{ background: `${m.color}${done === 3 ? "" : "55"}` }} aria-hidden>
                  {m.icon}
                </span>
                <span className="text-[11px] font-bold leading-tight">{m.place}</span>
                <span className="text-[10px] font-bold text-ink-muted">{done}/3</span>
              </button>
            );
          })}
        </div>
      </section>

      <InstallCard compact />

      <MascotSays mood="fikir" tone="sky" size={64}>
        İpucu: XP öğrenme puanındır, harcanmaz. Sanal TL ise biriktirip harcayabildiğin alıştırma parasıdır.
      </MascotSays>
    </div>
  );
}
