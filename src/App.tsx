import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useEffect } from "react";
import { useRoute } from "./lib/router";
import { useAppState, update } from "./lib/store";
import { ensureDaily } from "./lib/engine";
import { BottomNav, SideNav } from "./components/Nav";
import { CelebrationOverlay } from "./components/CelebrationOverlay";
import { Onboarding } from "./screens/Onboarding";
import { Home } from "./screens/Home";
import { MapScreen } from "./screens/MapScreen";
import { ModuleScreen } from "./screens/ModuleScreen";
import { LessonScreen } from "./screens/LessonScreen";
import { GamesHub } from "./screens/GamesHub";
import { GameScreen } from "./screens/GameScreen";
import { Collection } from "./screens/Collection";
import { SavingsLab } from "./screens/SavingsLab";
import { WalletScreen } from "./screens/WalletScreen";
import { Practice } from "./screens/Practice";
import { FinalExam } from "./screens/FinalExam";
import { ParentArea } from "./screens/ParentArea";
import { SettingsScreen } from "./screens/SettingsScreen";
import { NotFound } from "./screens/NotFound";

/** Tam ekran akışlar: alt gezinme gizlenir */
const FULLSCREEN = new Set(["ders", "oyun", "final", "tekrar", "ebeveyn"]);

export function App() {
  const s = useAppState();
  const { parts, path } = useRoute();
  const section = parts[0] ?? "";

  useEffect(() => {
    document.documentElement.dataset.motion = s.settings.motion;
  }, [s.settings.motion]);

  // Gün değişirse günlük görevi yenile
  useEffect(() => {
    const t = setInterval(() => update((st) => ensureDaily(st)), 60_000);
    return () => clearInterval(t);
  }, []);

  const reduced = s.settings.motion === "kapali" ? "always" : s.settings.motion === "acik" ? "never" : "user";

  if (!s.profile) {
    return (
      <MotionConfig reducedMotion={reduced}>
        <Onboarding />
      </MotionConfig>
    );
  }

  const full = FULLSCREEN.has(section);
  return (
    <MotionConfig reducedMotion={reduced}>
      <div className="flex min-h-dvh">
        {!full && <SideNav section={section} />}
        <main className={`pt-safe min-w-0 flex-1 ${full ? "" : "pb-28 md:pb-10"}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={path.split("?")[0]}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="mx-auto w-full max-w-3xl px-4 pt-4 sm:px-6 sm:pt-6"
            >
              <Screen parts={parts} />
            </motion.div>
          </AnimatePresence>
        </main>
        {!full && <BottomNav section={section} />}
      </div>
      <CelebrationOverlay />
    </MotionConfig>
  );
}

function Screen({ parts }: { parts: string[] }) {
  const [a, b] = parts;
  switch (a) {
    case undefined:
    case "ana":
      return <Home />;
    case "kesif":
      return b ? <ModuleScreen moduleId={b} /> : <MapScreen />;
    case "ders":
      return <LessonScreen lessonId={b ?? ""} />;
    case "oyunlar":
      return <GamesHub />;
    case "oyun":
      return <GameScreen gameId={b ?? ""} />;
    case "koleksiyon":
      return <Collection />;
    case "birikim":
      return <SavingsLab />;
    case "cuzdan":
      return <WalletScreen />;
    case "tekrar":
      return <Practice topic={b} />;
    case "final":
      return <FinalExam />;
    case "ebeveyn":
      return <ParentArea />;
    case "ayarlar":
      return <SettingsScreen />;
    default:
      return <NotFound />;
  }
}
