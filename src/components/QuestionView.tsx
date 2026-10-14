import { AnimatePresence, motion } from "framer-motion";
import { Check, Lightbulb, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { Choice, Question } from "../types";
import { shuffle } from "../lib/util";
import { play } from "../lib/sound";
import { Mascot } from "./Mascot";
import { NumPad } from "./NumPad";
import { VisualView } from "./ui";

export interface QuestionOutcome {
  correctFirst: boolean;
  correctEventually: boolean;
}

const PRAISE = ["Harika!", "Süpersin!", "Tam isabet!", "Çok iyi düşündün!", "Bravo, kaşif!"];

type Phase = "cevap" | "ipucu" | "bitti";

/**
 * Tüm soru türlerini oynatır. İlk yanlışta ipucu ve ikinci deneme, sonra açıklama.
 */
export function QuestionView({ question, onDone, continueLabel = "Devam et" }: { question: Question; onDone: (o: QuestionOutcome) => void; continueLabel?: string }) {
  const [phase, setPhase] = useState<Phase>("cevap");
  const [firstWrong, setFirstWrong] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [chosenFeedback, setChosenFeedback] = useState<string | null>(null);
  const praise = useMemo(() => PRAISE[Math.floor(Math.random() * PRAISE.length)], [question.id]);

  const resolve = (isCorrect: boolean, feedback?: string, hadMistakes = false) => {
    setChosenFeedback(feedback ?? null);
    if (isCorrect && hadMistakes) setFirstWrong(true);
    if (isCorrect) {
      play("dogru");
      setCorrect(true);
      setPhase("bitti");
    } else if (!firstWrong) {
      play("ipucu");
      setFirstWrong(true);
      setPhase("ipucu");
    } else {
      play("ipucu");
      setCorrect(false);
      setPhase("bitti");
    }
  };

  const finish = () => onDone({ correctFirst: correct && !firstWrong, correctEventually: correct });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className="chip mb-2 bg-sky text-navy-soft">{typeLabel[question.type]}</span>
        <h2 className="text-xl font-bold leading-snug sm:text-2xl">{question.prompt}</h2>
      </div>
      {question.visual && <VisualView visual={question.visual} />}

      <QuestionBody key={question.id} question={question} locked={phase === "bitti"} phase={phase} onAnswer={resolve} onRetry={() => setPhase("cevap")} />

      <AnimatePresence mode="wait">
        {phase === "ipucu" && (
          <motion.div key="ipucu" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-end gap-2 rounded-3xl bg-sun/35 p-3" role="status">
            <Mascot mood="cesaret" size={70} animate={false} />
            <div className="flex-1 pb-1">
              <p className="font-display text-lg font-semibold">Birlikte tekrar düşünelim.</p>
              {chosenFeedback && <p className="text-sm font-semibold">{chosenFeedback}</p>}
              <p className="mt-1 flex gap-1.5 text-sm font-bold text-navy-soft">
                <Lightbulb size={18} className="shrink-0 text-sun-dark" aria-hidden /> {question.hint}
              </p>
            </div>
          </motion.div>
        )}
        {phase === "bitti" && (
          <motion.div
            key="bitti"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl p-4 ${correct ? "bg-success/20" : "bg-sky"}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <Mascot mood={correct ? "mutlu" : "cesaret"} size={64} animate={false} />
              <div className="flex-1">
                <p className="font-display text-xl font-bold">{correct ? (firstWrong ? "İkinci denemede buldun, aferin!" : praise) : "Sorun değil, birlikte bakalım:"}</p>
                {chosenFeedback && <p className="mt-1 text-[15px] font-semibold">{chosenFeedback}</p>}
                {!correct && <p className="mt-1 text-[15px] font-bold">Doğru cevap: {correctAnswerText(question)}</p>}
                <p className="mt-1 text-[15px]">{question.explanation}</p>
              </div>
            </div>
            <button className="btn-dark mt-4 w-full" onClick={finish} autoFocus>
              {continueLabel}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const typeLabel: Record<Question["type"], string> = {
  mcq: "Çoktan seçmeli",
  truefalse: "Doğru mu, yanlış mı?",
  numeric: "Hesapla",
  match: "Eşleştir",
  decision: "Karar ver",
};

export function correctAnswerText(q: Question): string {
  switch (q.type) {
    case "mcq":
      return q.choices.find((c) => c.id === q.answer)?.text ?? "";
    case "truefalse":
      return q.answer ? "Doğru" : "Yanlış";
    case "numeric":
      return `${q.answer}${q.unit ? " " + q.unit : ""}`;
    case "match":
      return q.pairs.map((p) => `${p.left} → ${p.right}`).join(" • ");
    case "decision":
      return q.choices
        .filter((c) => q.accepted.includes(c.id))
        .map((c) => c.text)
        .join(" ya da ");
  }
}

function QuestionBody({
  question,
  locked,
  phase,
  onAnswer,
  onRetry,
}: {
  question: Question;
  locked: boolean;
  phase: Phase;
  onAnswer: (correct: boolean, feedback?: string, hadMistakes?: boolean) => void;
  onRetry: () => void;
}) {
  const waiting = phase === "ipucu";
  switch (question.type) {
    case "mcq":
    case "decision":
      return <ChoiceList question={question} locked={locked} waiting={waiting} onAnswer={onAnswer} onRetry={onRetry} />;
    case "truefalse":
      return (
        <ChoiceList
          question={{ id: question.id, choices: [{ id: "d", text: "Doğru", emoji: "👍" }, { id: "y", text: "Yanlış", emoji: "👎" }] }}
          isCorrect={(id) => (id === "d") === question.answer}
          noShuffle
          locked={locked}
          waiting={waiting}
          onAnswer={onAnswer}
          onRetry={onRetry}
        />
      );
    case "numeric":
      return <NumericInput answer={question.answer} unit={question.unit} locked={locked} waiting={waiting} onAnswer={onAnswer} onRetry={onRetry} />;
    case "match":
      return <MatchBoard pairs={question.pairs} locked={locked} onAnswer={onAnswer} />;
  }
}

function ChoiceList({
  question,
  locked,
  waiting,
  onAnswer,
  onRetry,
  isCorrect,
  noShuffle,
}: {
  question: { id: string; choices: Choice[]; answer?: string; accepted?: string[] };
  locked: boolean;
  waiting: boolean;
  onAnswer: (correct: boolean, feedback?: string) => void;
  onRetry: () => void;
  isCorrect?: (id: string) => boolean;
  noShuffle?: boolean;
}) {
  const choices = useMemo(() => (noShuffle ? question.choices : shuffle(question.choices)), [question.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [picked, setPicked] = useState<string[]>([]);
  const check = isCorrect ?? ((id: string) => (question.accepted ? question.accepted.includes(id) : question.answer === id));
  const last = picked[picked.length - 1];

  return (
    <div className="grid gap-3" role="group" aria-label="Seçenekler">
      {choices.map((c) => {
        const wasPicked = picked.includes(c.id);
        const ok = check(c.id);
        const showOk = locked && ok;
        const showBad = wasPicked && !ok;
        return (
          <motion.button
            key={c.id}
            type="button"
            whileTap={{ scale: 0.98 }}
            disabled={locked || showBad}
            onClick={() => {
              if (waiting) onRetry();
              setPicked((p) => [...p, c.id]);
              onAnswer(ok, c.feedback);
            }}
            className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border-[3px] px-4 py-3 text-left text-[16px] font-bold transition-colors ${
              showOk
                ? "border-success bg-success/15"
                : showBad
                  ? "border-coral/60 bg-coral/10 text-navy/60"
                  : last === c.id && locked
                    ? "border-navy/30 bg-white"
                    : "border-navy/10 bg-white hover:border-turq"
            }`}
            aria-pressed={wasPicked}
          >
            {c.emoji && (
              <span className="text-2xl" aria-hidden>
                {c.emoji}
              </span>
            )}
            <span className="flex-1">{c.text}</span>
            {showOk && <Check className="text-success-dark" aria-label="doğru" />}
            {showBad && <X className="text-coral-dark" aria-label="yanlış seçim" />}
          </motion.button>
        );
      })}
    </div>
  );
}

function NumericInput({
  answer,
  unit,
  locked,
  waiting,
  onAnswer,
  onRetry,
}: {
  answer: number;
  unit?: string;
  locked: boolean;
  waiting: boolean;
  onAnswer: (correct: boolean, feedback?: string) => void;
  onRetry: () => void;
}) {
  const [value, setValue] = useState("");
  return (
    <NumPad
      value={value}
      unit={unit}
      disabled={locked}
      onChange={(v) => {
        if (waiting) onRetry();
        setValue(v);
      }}
      onSubmit={() => {
        const n = Number(value);
        const ok = n === answer;
        onAnswer(ok, ok ? undefined : `${value} ${unit ?? ""} yazdın.`);
        if (!ok) setValue("");
      }}
    />
  );
}

/** Eşleştirme: soldan bir kart seç, sağdan eşini seç. Sürükleyip bırakmak da mümkün. */
function MatchBoard({
  pairs,
  locked,
  onAnswer,
}: {
  pairs: { left: string; right: string }[];
  locked: boolean;
  onAnswer: (correct: boolean, feedback?: string, hadMistakes?: boolean) => void;
}) {
  const lefts = useMemo(() => shuffle(pairs.map((p, i) => ({ i, text: p.left }))), [pairs]);
  const rights = useMemo(() => shuffle(pairs.map((p, i) => ({ i, text: p.right }))), [pairs]);
  const [sel, setSel] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrongFlash, setWrongFlash] = useState<number | null>(null);
  const [usedRights, setUsedRights] = useState<number[]>([]);
  const mistakes = useRef(0);
  const reported = useRef(false);

  const tryMatch = (leftIdx: number, rightIdx: number) => {
    if (matched.includes(leftIdx) || usedRights.includes(rightIdx)) return;
    // Sağdaki metin tekrar edebilir (ör. iki kez "Ürün"), bu yüzden metin eşitliğiyle kontrol edilir
    const ok = pairs[leftIdx].right === pairs[rightIdx].right;
    if (ok) {
      play("dogru");
      const next = [...matched, leftIdx];
      setMatched(next);
      setSel(null);
      setUsedRights((u) => [...u, rightIdx]);
      if (next.length === pairs.length && !reported.current) {
        reported.current = true;
        const m = mistakes.current;
        onAnswer(true, m ? `${m} kez farklı eşleştirme denedin ve sonunda hepsini buldun!` : undefined, m > 0);
      }
    } else {
      play("ipucu");
      mistakes.current++;
      setWrongFlash(rightIdx);
      setTimeout(() => setWrongFlash(null), 500);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3" aria-label="Eşleştirme alanı">
      <div className="flex flex-col gap-2">
        {lefts.map((l) => {
          const done = matched.includes(l.i);
          return (
            <motion.button
              key={l.i}
              type="button"
              drag={!done && !locked}
              dragSnapToOrigin
              whileDrag={{ scale: 1.05, zIndex: 20 }}
              onDragEnd={(_, info) => {
                const el = document
                  .elementsFromPoint(info.point.x - window.scrollX, info.point.y - window.scrollY)
                  .find((e) => (e as HTMLElement).dataset?.matchRight !== undefined) as HTMLElement | undefined;
                if (el) tryMatch(l.i, Number(el.dataset.matchRight));
              }}
              disabled={done || locked}
              onClick={() => setSel(sel === l.i ? null : l.i)}
              className={`relative min-h-14 touch-none rounded-2xl border-[3px] px-3 py-2 text-left text-sm font-bold sm:text-base ${
                done ? "border-success bg-success/15" : sel === l.i ? "border-turq bg-turq/15" : "border-navy/10 bg-white"
              }`}
              aria-pressed={sel === l.i}
            >
              {l.text}
            </motion.button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2">
        {rights.map((r) => {
          const done = usedRights.includes(r.i);
          return (
            <motion.button
              key={r.i}
              type="button"
              data-match-right={r.i}
              animate={wrongFlash === r.i ? { x: [0, -6, 6, -4, 0] } : {}}
              disabled={done || locked || sel === null}
              onClick={() => sel !== null && tryMatch(sel, r.i)}
              className={`min-h-14 rounded-2xl border-[3px] px-3 py-2 text-left text-sm font-bold sm:text-base ${
                done ? "border-success bg-success/15" : wrongFlash === r.i ? "border-coral bg-coral/10" : sel !== null ? "border-dashed border-turq bg-white" : "border-navy/10 bg-white"
              }`}
            >
              {r.text}
            </motion.button>
          );
        })}
      </div>
      <p className="col-span-2 text-center text-xs font-semibold text-ink-muted">Soldan bir kart seç, sonra sağdan eşine dokun. Kartı sürükleyip eşinin üzerine de bırakabilirsin.</p>
    </div>
  );
}
