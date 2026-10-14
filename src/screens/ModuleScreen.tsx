import { CheckCircle2, ChevronRight, Lock, PlayCircle, RotateCcw } from "lucide-react";
import { MODULES, getModule } from "../data/modules";
import { useAppState } from "../lib/store";
import { isLessonDone, isModuleUnlocked, moduleDoneCount } from "../lib/engine";
import { navigate } from "../lib/router";
import { PageHeader, ProgressBar } from "../components/ui";
import { MascotSays } from "../components/Mascot";
import { TOPICS } from "../data/topics";
import { NotFound } from "./NotFound";

export function ModuleScreen({ moduleId }: { moduleId: string }) {
  const s = useAppState();
  const m = getModule(moduleId);
  if (!m) return <NotFound />;
  const unlocked = isModuleUnlocked(s, m);
  const done = moduleDoneCount(s, m);
  const prev = MODULES.find((x) => x.order === m.order - 1);

  return (
    <div>
      <PageHeader title={m.place} subtitle={`Bölüm ${m.order} · ${m.title}`} back="/kesif" />
      <section className="relative overflow-hidden rounded-[2rem] p-5 shadow-[var(--shadow-soft)]" style={{ background: `${m.color}40` }}>
        <span className="absolute -right-2 -top-4 text-[110px] opacity-30" aria-hidden>
          {m.icon}
        </span>
        <p className="relative max-w-[80%] text-lg font-semibold">{m.description}</p>
        <div className="relative mt-4 flex items-center gap-3">
          <ProgressBar value={(done / m.lessons.length) * 100} color={m.color} label="Bölüm ilerlemesi" />
          <span className="shrink-0 font-bold">
            {done}/{m.lessons.length}
          </span>
        </div>
      </section>

      {!unlocked ? (
        <div className="mt-5">
          <MascotSays mood="fikir" tone="sun">
            Bu bölüm henüz keşfedilmedi. {prev ? `"${prev.place}" bölümünde 2 ders bitirince burası açılacak!` : ""} Merak etme, oraya çok yakınsın.
          </MascotSays>
          {prev && (
            <button className="btn-primary mt-4 w-full" onClick={() => navigate(`/kesif/${prev.id}`)}>
              {prev.place} bölümüne git
            </button>
          )}
        </div>
      ) : (
        <ol className="mt-5 flex flex-col gap-3">
          {m.lessons.map((l, i) => {
            const finished = isLessonDone(s, l.id);
            const inProgress = s.activeLesson?.lessonId === l.id;
            return (
              <li key={l.id}>
                <button className="card flex w-full items-center gap-4 p-4 text-left" onClick={() => navigate(`/ders/${l.id}`)}>
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-display text-xl font-bold"
                    style={{ background: finished ? "var(--color-success)" : `${m.color}55`, color: finished ? "#fff" : undefined }}
                  >
                    {finished ? <CheckCircle2 /> : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-bold leading-tight">{l.title}</span>
                    <span className="block text-sm font-semibold text-ink-muted">{l.goal}</span>
                    <span className="mt-1 block text-xs font-bold text-turq-dark">
                      {finished ? `Tamamlandı · tekrar oynayabilirsin` : inProgress ? "Yarım kaldı · devam et" : "+20 XP · +5 sanal TL"}
                    </span>
                  </span>
                  {finished ? <RotateCcw className="text-ink-muted" aria-hidden /> : inProgress ? <PlayCircle className="text-turq-dark" aria-hidden /> : <ChevronRight aria-hidden />}
                </button>
              </li>
            );
          })}
        </ol>
      )}
      {unlocked && (
        <button className="btn-ghost mt-4 w-full" onClick={() => navigate(`/tekrar/${m.topic}`)}>
          🔁 {TOPICS[m.topic].title} konusunda pratik yap
        </button>
      )}
      {!unlocked && (
        <p className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-ink-muted">
          <Lock size={16} /> {m.lessons.length} ders seni bekliyor
        </p>
      )}
    </div>
  );
}
