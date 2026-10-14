import { motion } from "framer-motion";
import { GAMES } from "../data/games";
import { useAppState } from "../lib/store";
import { navigate } from "../lib/router";
import { MascotSays } from "../components/Mascot";

export function GamesHub() {
  const s = useAppState();
  return (
    <div>
      <header className="mb-3">
        <h1 className="text-3xl font-bold">Oyun Merkezi</h1>
        <p className="font-semibold text-ink-muted">Öğrendiklerini oyunlarla dene. İlk başarıda +10 XP ve +10 sanal TL!</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {GAMES.map((g, i) => {
          const rec = s.games[g.id];
          return (
            <motion.button
              key={g.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/oyun/${g.id}`)}
              className="relative flex items-center gap-4 overflow-hidden rounded-[1.75rem] p-4 text-left shadow-[var(--shadow-soft)]"
              style={{ background: `linear-gradient(135deg, ${g.color}38, #ffffff 70%)` }}
            >
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-4xl shadow-[var(--shadow-press)]" style={{ background: g.color }} aria-hidden>
                {g.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl font-bold leading-tight">{g.title}</span>
                <span className="block text-sm font-semibold text-navy-soft">{g.description}</span>
                <span className="mt-1 block text-xs font-bold text-ink-muted">
                  {rec ? `${rec.plays} kez oynandı · en iyi ${rec.best}/${rec.max}${rec.completed ? " · ✅" : ""}` : "Yeni oyun!"}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
      <div className="mt-5">
        <MascotSays mood="fikir" tone="sky" size={60}>
          Tekrar oynamak serbest! XP ilk başarıda ve rekorunu geliştirdiğinde gelir.
        </MascotSays>
      </div>
    </div>
  );
}
