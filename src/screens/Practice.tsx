import { useState } from "react";
import type { TopicId } from "../types";
import { getState, update, useAppState } from "../lib/store";
import { buildPracticeSet, type PracticeItem } from "../lib/practice";
import { progressDaily, recordOutcome, recordPractice } from "../lib/engine";
import { TOPICS, TOPIC_IDS } from "../data/topics";
import { navigate } from "../lib/router";
import { QuestionView } from "../components/QuestionView";
import { PageHeader, ProgressBar } from "../components/ui";
import { Mascot } from "../components/Mascot";

const SOURCE_LABEL = { tekrar: "Zorlandığın soru", benzer: "Benzer yeni soru", yeni: "Karışık pratik" } as const;

export function Practice({ topic }: { topic?: string }) {
  const t = TOPIC_IDS.includes(topic as TopicId) ? (topic as TopicId) : undefined;
  const s = useAppState();
  const [round, setRound] = useState(0);
  const [items, setItems] = useState<PracticeItem[]>(() => buildPracticeSet(getState(), { topic: t }));
  const [i, setI] = useState(0);
  const [stats, setStats] = useState({ first: 0, eventually: 0, xpStart: s.xp });

  const restart = () => {
    setItems(buildPracticeSet(getState(), { topic: t }));
    setI(0);
    setStats({ first: 0, eventually: 0, xpStart: getState().xp });
    setRound((r) => r + 1);
  };

  const finished = i >= items.length;
  const item = items[i];

  return (
    <div className="pb-10">
      <PageHeader title="Tekrar Köşesi" subtitle={t ? TOPICS[t].title : "Sana özel karışık pratik"} close="/" />
      {!finished ? (
        <>
          <div className="mb-3 flex items-center gap-3">
            <ProgressBar value={(i / items.length) * 100} label="Pratik ilerlemesi" />
            <span className="shrink-0 text-sm font-bold">
              {i + 1}/{items.length}
            </span>
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-coral-dark">
            {SOURCE_LABEL[item.source]} · {TOPICS[item.question.topic].emoji} {TOPICS[item.question.topic].title}
          </p>
          <QuestionView
            key={`${round}-${i}-${item.question.id}`}
            question={item.question}
            continueLabel={i + 1 >= items.length ? "Sonuçları gör" : "Sonraki soru"}
            onDone={(o) => {
              update((st) => {
                if (item.question.id.startsWith("gen-")) return recordPractice(st, item.question.topic, o.correctFirst);
                return progressDaily(recordOutcome(st, { questionId: item.question.id, ...o }), "practice");
              });
              setStats((x) => ({ ...x, first: x.first + (o.correctFirst ? 1 : 0), eventually: x.eventually + (o.correctEventually ? 1 : 0) }));
              setI(i + 1);
            }}
          />
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <Mascot mood={stats.first >= items.length / 2 ? "kutlama" : "cesaret"} size={130} />
          <h2 className="text-3xl font-bold">Pratik bitti!</h2>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="chip bg-success/25 text-base">🎯 İlk denemede {stats.first}/{items.length}</span>
            <span className="chip bg-sky text-base">🔁 Sonradan öğrenilen {stats.eventually - stats.first}</span>
            {s.xp > stats.xpStart && <span className="chip bg-sun text-base">⭐ +{s.xp - stats.xpStart} XP gelişim bonusu</span>}
          </div>
          <p className="max-w-sm font-semibold text-navy-soft">Daha önce zorlandığın bir soruyu ilk denemede doğru yapınca gelişim bonusu kazanırsın. Her tekrar beynini güçlendirir!</p>
          <div className="flex w-full max-w-sm flex-col gap-3">
            <button className="btn-primary" onClick={restart}>
              Yeni bir set
            </button>
            <button className="btn-ghost" onClick={() => navigate("/", { replace: true })}>
              Ana sayfaya dön
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
