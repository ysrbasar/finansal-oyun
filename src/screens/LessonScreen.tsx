import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, HelpCircle, Target, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Lesson, Question } from "../types";
import { getLesson, getModule } from "../data/modules";
import { getState, update, useAppState } from "../lib/store";
import {
  completeLesson,
  isModuleUnlocked,
  isStruggling,
  lessonRewardPreview,
  nextLesson,
  recordOutcome,
  setLessonStep,
  startLesson,
} from "../lib/engine";
import { goBack, navigate } from "../lib/router";
import { Mascot, MascotSays } from "../components/Mascot";
import { QuestionView, type QuestionOutcome } from "../components/QuestionView";
import { ProgressBar, VisualView } from "../components/ui";
import { NotFound } from "./NotFound";
import { BADGES } from "../data/badges";

type Step =
  | { kind: "story"; index: number }
  | { kind: "goal" }
  | { kind: "example" }
  | { kind: "question"; question: Question; index: number }
  | { kind: "review" };

function buildSteps(l: Lesson): Step[] {
  return [
    ...l.story.map((_, i) => ({ kind: "story" as const, index: i })),
    { kind: "goal" },
    { kind: "example" },
    ...l.activities.map((q, i) => ({ kind: "question" as const, question: q, index: i })),
    { kind: "review" },
  ];
}

export function LessonScreen({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId);
  const s = useAppState();
  const module = lesson ? getModule(lesson.moduleId) : undefined;
  const steps = useMemo(() => (lesson ? buildSteps(lesson) : []), [lesson]);
  const [result, setResult] = useState<{ xp: number; coins: number; firstTry: number; total: number; replay: boolean } | null>(null);
  const [missStreak, setMissStreak] = useState(0);
  const [showEasier, setShowEasier] = useState(false);

  // Kaldığı yerden devam: Aynı ders yarım kaldıysa adımı koru, değilse baştan başla
  useEffect(() => {
    if (!lesson) return;
    const cur = getState().activeLesson;
    if (!cur || cur.lessonId !== lesson.id) update((st) => startLesson(st, lesson.id));
  }, [lesson]);

  if (!lesson || !module) return <NotFound />;
  if (!isModuleUnlocked(s, module)) {
    return (
      <div className="py-8">
        <MascotSays mood="fikir">Bu ders henüz keşfedilmedi. Önce önceki bölümlerde biraz ilerleyelim!</MascotSays>
        <button className="btn-primary mt-6 w-full" onClick={() => navigate("/kesif", { replace: true })}>
          Haritaya dön
        </button>
      </div>
    );
  }

  const active = s.activeLesson?.lessonId === lesson.id ? s.activeLesson : null;
  const stepIndex = Math.min(active?.step ?? 0, steps.length - 1);
  const step = steps[stepIndex];
  const struggling = isStruggling(s, module.topic);

  const goNext = (firstTryDelta = 0) => update((st) => setLessonStep(st, stepIndex + 1, firstTryDelta));
  const goPrev = () => stepIndex > 0 && update((st) => setLessonStep(st, stepIndex - 1));

  const onQuestionDone = (q: Question, o: QuestionOutcome) => {
    update((st) => recordOutcome(st, { questionId: q.id, ...o }));
    const streak = o.correctFirst ? 0 : missStreak + 1;
    setMissStreak(streak);
    // Art arda iki zorlanmada daha kolay bir anlatım öner
    setShowEasier(streak >= 2);
    goNext(o.correctFirst ? 1 : 0);
  };

  const finish = () => {
    const preview = lessonRewardPreview(getState(), lesson.id);
    const firstTry = active?.firstTry ?? 0;
    update((st) => completeLesson(st, lesson.id, firstTry, lesson.activities.length));
    setResult({ ...preview, firstTry, total: lesson.activities.length, replay: preview.xp === 0 });
  };

  if (result) return <LessonReward lesson={lesson} result={result} />;

  return (
    <div className="flex min-h-dvh flex-col pb-8">
      <div className="sticky top-0 z-10 -mx-4 flex items-center gap-3 bg-cream/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <button className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white shadow-[var(--shadow-soft)]" onClick={() => goBack(`/kesif/${module.id}`)} aria-label="Dersten çık (ilerlemen kaydedilir)">
          <X size={22} />
        </button>
        <ProgressBar value={(stepIndex / (steps.length - 1)) * 100} color={module.color} height={14} label="Ders ilerlemesi" />
        <span className="shrink-0 text-sm font-bold text-ink-muted">
          {stepIndex + 1}/{steps.length}
        </span>
      </div>
      <p className="mb-3 text-sm font-bold text-ink-muted">
        {module.place} · {lesson.title}
      </p>

      <AnimatePresence mode="wait">
        <motion.div key={stepIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} className="flex flex-1 flex-col gap-4">
          {step.kind === "story" && (
            <>
              <div className="flex items-center gap-2">
                <BookOpen className="text-turq-dark" aria-hidden />
                <span className="font-display font-bold text-turq-dark">Hikâye {step.index + 1}/{lesson.story.length}</span>
              </div>
              {lesson.story[step.index].visual && <VisualView visual={lesson.story[step.index].visual!} />}
              <MascotSays mood={step.index === 0 ? "merhaba" : "fikir"} size={76}>
                <span className="text-lg">{lesson.story[step.index].text}</span>
              </MascotSays>
              <NavButtons onPrev={stepIndex > 0 ? goPrev : undefined} onNext={() => goNext()} />
            </>
          )}

          {step.kind === "goal" && (
            <>
              <div className="card flex flex-col items-center gap-3 p-6 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-coral/20">
                  <Target size={34} className="text-coral-dark" />
                </span>
                <p className="font-display text-sm font-bold uppercase tracking-wide text-coral-dark">Bu derste öğreneceğin</p>
                <h2 className="text-2xl font-bold leading-snug">{lesson.goal}</h2>
              </div>
              {struggling && (
                <MascotSays mood="cesaret" tone="sun">
                  Bu konu biraz zorlayıcı olabilir. Merak etme, adım adım ve örneklerle gideceğiz!
                </MascotSays>
              )}
              <NavButtons onPrev={goPrev} onNext={() => goNext()} />
            </>
          )}

          {step.kind === "example" && (
            <>
              <h2 className="text-2xl font-bold">Örnek: {lesson.example.title}</h2>
              {lesson.example.visual && <VisualView visual={lesson.example.visual} />}
              <p className="card p-4 text-lg font-semibold leading-relaxed">{lesson.example.text}</p>
              {struggling && <EasierCard text={lesson.easierExample} />}
              <NavButtons onPrev={goPrev} onNext={() => goNext()} nextLabel="Hadi deneyelim!" />
            </>
          )}

          {step.kind === "question" && (
            <>
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-turq-dark">
                  Görev {step.index + 1}/{lesson.activities.length}
                </span>
                <button className="flex items-center gap-1 text-sm font-bold text-navy-soft underline" onClick={() => setShowEasier((v) => !v)}>
                  <HelpCircle size={16} /> {showEasier ? "Örneği gizle" : "Bir örnek daha"}
                </button>
              </div>
              {showEasier && <EasierCard text={lesson.easierExample} />}
              <QuestionView key={step.question.id} question={step.question} onDone={(o) => onQuestionDone(step.question, o)} />
            </>
          )}

          {step.kind === "review" && (
            <>
              <div className="card p-5">
                <h2 className="mb-3 text-2xl font-bold">Kısa tekrar</h2>
                <ul className="flex flex-col gap-2">
                  {lesson.review.map((r) => (
                    <li key={r} className="flex gap-3 rounded-2xl bg-sky/70 p-3 text-[16px] font-semibold">
                      <span aria-hidden>✅</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
              <MascotSays mood="mutlu">Süper! Öğrendiklerini bir kez daha okudun. Dersi bitirmeye hazır mısın?</MascotSays>
              <button className="btn-primary mt-auto w-full text-xl" onClick={finish}>
                Dersi bitir
              </button>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function EasierCard({ text }: { text: string }) {
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-3xl bg-sun/35 p-4">
      <p className="font-display text-lg font-bold">💡 Başka bir yoldan düşünelim</p>
      <p className="mt-1 text-[15px] font-semibold">{text}</p>
    </motion.div>
  );
}

function NavButtons({ onPrev, onNext, nextLabel = "Devam" }: { onPrev?: () => void; onNext: () => void; nextLabel?: string }) {
  return (
    <div className="mt-auto flex gap-3 pt-4">
      {onPrev && (
        <button className="btn-ghost" onClick={onPrev}>
          Geri
        </button>
      )}
      <button className="btn-primary flex-1" onClick={onNext} autoFocus>
        {nextLabel}
      </button>
    </div>
  );
}

function LessonReward({ lesson, result }: { lesson: Lesson; result: { xp: number; coins: number; firstTry: number; total: number; replay: boolean } }) {
  const s = useAppState();
  const mod = getModule(lesson.moduleId)!;
  const next = nextLesson(s);
  const doneInModule = mod.lessons.filter((l) => s.completedLessons[l.id]).length;
  const moduleBadge = { m01: "para-dedektifi", m07: "akilli-alisverisci", m09: "paylasim-kahramani", m10: "zaman-yolcusu" }[mod.id];
  const badge = moduleBadge ? BADGES.find((b) => b.id === moduleBadge) : undefined;

  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center gap-4 py-8 text-center">
      <Mascot mood="kutlama" size={150} />
      <h1 className="text-3xl font-bold">Ders tamamlandı!</h1>
      <p className="text-lg font-semibold text-navy-soft">{lesson.title}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <span className="chip bg-sun text-lg">⭐ +{result.xp} XP</span>
        <span className="chip bg-turq/30 text-lg">🪙 +{result.coins} sanal TL</span>
        <span className="chip bg-sky text-lg">
          🎯 İlk denemede {result.firstTry}/{result.total}
        </span>
      </div>
      {result.replay && <p className="max-w-sm text-sm font-semibold text-ink-muted">Bu dersi daha önce bitirmiştin. Tekrar etmek öğrenmeyi güçlendirir; XP ve sanal TL yalnızca ilk tamamlamada verilir.</p>}
      {result.firstTry < result.total && (
        <p className="max-w-sm text-sm font-semibold text-navy-soft">Zorlandığın sorular Tekrar Köşesi'ne eklendi. Sonra benzer sorularla çalışınca ek XP kazanırsın!</p>
      )}
      <div className="card w-full max-w-sm p-4 text-left">
        <p className="font-display font-bold">{mod.place} ilerlemesi</p>
        <ProgressBar value={(doneInModule / mod.lessons.length) * 100} color={mod.color} label="Bölüm ilerlemesi" />
        <p className="mt-1 text-sm font-semibold text-ink-muted">
          {doneInModule}/{mod.lessons.length} ders · bölüm bitince +30 XP bonus
          {badge && !s.badges[badge.id] ? ` ve "${badge.title}" rozeti` : ""}
        </p>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-3">
        {next && (
          <button className="btn-primary w-full" onClick={() => navigate(`/ders/${next.id}`, { replace: true })}>
            Sonraki ders: {next.title}
          </button>
        )}
        <button className="btn-ghost w-full" onClick={() => navigate(`/kesif/${mod.id}`, { replace: true })}>
          Bölüme dön
        </button>
      </div>
    </div>
  );
}
