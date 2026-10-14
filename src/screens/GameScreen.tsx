import { motion } from "framer-motion";
import { Play, X } from "lucide-react";
import { useState } from "react";
import type { GameId, GameResult } from "../types";
import { getGame } from "../data/games";
import { getState, update, useAppState } from "../lib/store";
import { gameRewardPreview, recordGame, type GameReward } from "../lib/engine";
import { goBack, navigate } from "../lib/router";
import { Mascot } from "../components/Mascot";
import { SimNote } from "../components/ui";
import { NotFound } from "./NotFound";
import { NeedsWantsGame } from "../games/NeedsWantsGame";
import { MarketGame } from "../games/MarketGame";
import { ChangeGame } from "../games/ChangeGame";
import { MemoryGame } from "../games/MemoryGame";
import { SavingsJourneyGame } from "../games/SavingsJourneyGame";
import { DetectiveGame } from "../games/DetectiveGame";
import { WorkshopGame } from "../games/WorkshopGame";
import { SecurityRadarGame } from "../games/SecurityRadarGame";

export interface GameProps {
  onFinish: (r: Omit<GameResult, "gameId">, summary?: string) => void;
}

const COMPONENTS: Record<GameId, (p: GameProps) => React.ReactNode> = {
  "ihtiyac-istek": NeedsWantsGame,
  market: MarketGame,
  "para-ustu": ChangeGame,
  hafiza: MemoryGame,
  "birikim-yolu": SavingsJourneyGame,
  "butce-dedektifi": DetectiveGame,
  "kazanc-atolyesi": WorkshopGame,
  "guvenlik-radari": SecurityRadarGame,
};

export function GameScreen({ gameId }: { gameId: string }) {
  const game = getGame(gameId);
  const s = useAppState();
  const [phase, setPhase] = useState<"intro" | "play" | "end">("intro");
  const [round, setRound] = useState(0);
  const [end, setEnd] = useState<{ result: GameResult; reward: GameReward; summary?: string } | null>(null);
  if (!game) return <NotFound />;
  const Comp = COMPONENTS[game.id];
  const rec = s.games[game.id];

  const onFinish: GameProps["onFinish"] = (r, summary) => {
    const result: GameResult = { ...r, gameId: game.id };
    const reward = gameRewardPreview(getState(), result);
    update((st) => recordGame(st, result));
    setEnd({ result, reward, summary });
    setPhase("end");
  };

  return (
    <div className="pb-10">
      <div className="mb-3 flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-2xl" style={{ background: game.color }} aria-hidden>
          {game.icon}
        </span>
        <h1 className="min-w-0 flex-1 truncate text-2xl font-bold">{game.title}</h1>
        <button className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white shadow-[var(--shadow-soft)]" onClick={() => goBack("/oyunlar")} aria-label="Oyundan çık">
          <X size={22} />
        </button>
      </div>

      {phase === "intro" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
          <div className="card p-5">
            <p className="text-lg font-semibold">{game.description}</p>
            <h2 className="mt-4 font-display text-lg font-bold">Nasıl oynanır?</h2>
            <ol className="mt-2 flex flex-col gap-2">
              {game.rules.map((r, i) => (
                <li key={r} className="flex gap-3 rounded-2xl bg-sky/70 p-3 font-semibold">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white font-display font-bold">{i + 1}</span>
                  {r}
                </li>
              ))}
            </ol>
            {rec && (
              <p className="mt-3 text-sm font-bold text-ink-muted">
                En iyi skorun: {rec.best}/{rec.max}
              </p>
            )}
          </div>
          <SimNote>Oyundaki paralar ve fiyatlar eğitim amaçlı örneklerdir; gerçek para kullanılmaz.</SimNote>
          <button className="btn-primary w-full text-xl" onClick={() => setPhase("play")} autoFocus>
            <Play /> Oyuna başla
          </button>
        </motion.div>
      )}

      {phase === "play" && <Comp key={round} onFinish={onFinish} />}

      {phase === "end" && end && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4 py-4 text-center">
          <Mascot mood={end.reward.passed ? "kutlama" : "cesaret"} size={140} />
          <h2 className="text-3xl font-bold">{end.reward.passed ? "Oyun tamamlandı!" : "İyi bir deneme!"}</h2>
          <p className="font-display text-2xl font-bold">
            Skor: {end.result.score}/{end.result.max}
          </p>
          {end.summary && <p className="card max-w-md p-4 text-[15px] font-semibold">{end.summary}</p>}
          <div className="flex flex-wrap justify-center gap-2">
            {end.reward.xp > 0 && <span className="chip bg-sun text-lg">⭐ +{end.reward.xp} XP</span>}
            {end.reward.coins > 0 && <span className="chip bg-turq/30 text-lg">🪙 +{end.reward.coins} sanal TL</span>}
            {end.reward.newBest && end.reward.passed && <span className="chip bg-coral/20 text-lg">🏅 Yeni rekor</span>}
          </div>
          {!end.reward.passed && <p className="max-w-sm font-semibold text-navy-soft">Bir kez daha denemek ister misin? Her denemede biraz daha öğreniyoruz.</p>}
          {end.reward.passed && end.reward.xp === 0 && <p className="max-w-sm text-sm font-semibold text-ink-muted">Bu oyunun ödülünü daha önce aldın. Rekorunu geçersen ek XP kazanırsın!</p>}
          <div className="flex w-full max-w-sm flex-col gap-3">
            <button
              className="btn-primary w-full"
              onClick={() => {
                setRound((r) => r + 1);
                setPhase("play");
              }}
            >
              Tekrar oyna
            </button>
            <button className="btn-ghost w-full" onClick={() => navigate("/oyunlar", { replace: true })}>
              Oyun merkezine dön
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
