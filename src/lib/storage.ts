// Yerel kayıt: localStorage + eski/bozuk veriye karşı temizleme (sanitize)
import type { Celebration, GameId, UserProgress } from "../types";
import { STATE_VERSION, createInitialState } from "./engine";
import { GAMES } from "../data/games";
import { AVATARS } from "../data/avatars";
import { SHOP_ITEMS } from "../data/shop";
import { BADGES } from "../data/badges";
import { TOPIC_IDS } from "../data/topics";
import { getLesson } from "../data/modules";

export const STORAGE_KEY = "minik-finans-kasifleri:v1";
const EXPORT_APP = "minik-finans-kasifleri";

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const num = (v: unknown, d = 0) => (typeof v === "number" && Number.isFinite(v) ? v : d);
const bool = (v: unknown) => v === true;
const str = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const strArr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

const GAME_IDS = new Set(GAMES.map((g) => g.id));
const SHOP_IDS = new Set(SHOP_ITEMS.map((s) => s.id));
const BADGE_IDS = new Set(BADGES.map((b) => b.id));

/** Bilinmeyen ya da hatalı alanları atarak geçerli bir durum üretir */
export function sanitize(raw: unknown): UserProgress {
  const base = createInitialState();
  if (!isObj(raw)) return base;
  const s = { ...base };

  if (isObj(raw.profile)) {
    const p = raw.profile;
    const avatarId = AVATARS.some((a) => a.id === p.avatarId) ? (p.avatarId as string) : AVATARS[0].id;
    s.profile = {
      nickname: str(p.nickname).slice(0, 20),
      avatarId,
      createdAt: num(p.createdAt, Date.now()),
      accessory: SHOP_IDS.has(str(p.accessory)) ? str(p.accessory) : undefined,
      jarSkin: SHOP_IDS.has(str(p.jarSkin)) ? str(p.jarSkin) : undefined,
    };
  }
  s.xp = Math.max(0, Math.round(num(raw.xp)));

  if (isObj(raw.completedLessons)) {
    for (const [id, v] of Object.entries(raw.completedLessons)) {
      if (!getLesson(id) || !isObj(v)) continue;
      s.completedLessons[id] = {
        completedAt: num(v.completedAt, Date.now()),
        firstTryCorrect: num(v.firstTryCorrect),
        total: num(v.total),
        plays: Math.max(1, num(v.plays, 1)),
      };
    }
  }
  if (isObj(raw.questionStats)) {
    for (const [id, v] of Object.entries(raw.questionStats)) {
      if (!isObj(v)) continue;
      s.questionStats[id] = {
        seen: Math.max(1, num(v.seen, 1)),
        firstTryCorrect: bool(v.firstTryCorrect),
        learned: bool(v.learned),
        recovered: bool(v.recovered),
        lastSeen: num(v.lastSeen),
      };
    }
  }
  if (isObj(raw.games)) {
    for (const [id, v] of Object.entries(raw.games)) {
      if (!GAME_IDS.has(id as GameId) || !isObj(v)) continue;
      s.games[id as GameId] = {
        plays: num(v.plays),
        best: num(v.best),
        max: num(v.max),
        completed: bool(v.completed),
        lastPlayed: num(v.lastPlayed),
      };
    }
  }
  if (isObj(raw.badges)) {
    for (const [id, v] of Object.entries(raw.badges)) {
      if (!BADGE_IDS.has(id) || !isObj(v)) continue;
      s.badges[id] = { earnedAt: num(v.earnedAt, Date.now()), seen: bool(v.seen) };
    }
  }
  if (isObj(raw.claimed)) {
    for (const [k, v] of Object.entries(raw.claimed)) if (typeof v === "number") s.claimed[k] = v;
  }
  if (isObj(raw.wallet)) {
    const w = raw.wallet;
    const txs = Array.isArray(w.transactions) ? w.transactions.filter(isObj) : [];
    s.wallet = {
      balance: Math.max(0, num(w.balance, base.wallet.balance)),
      transactions: txs.slice(0, 200).map((t) => ({
        id: str(t.id, Math.random().toString(36).slice(2)),
        at: num(t.at),
        amount: num(t.amount),
        kind: (["kazanc", "harcama", "birikim", "geri-alma", "baslangic"].includes(str(t.kind)) ? t.kind : "kazanc") as UserProgress["wallet"]["transactions"][number]["kind"],
        label: str(t.label).slice(0, 80),
      })),
    };
  }
  if (Array.isArray(raw.goals)) {
    s.goals = raw.goals.filter(isObj).slice(0, 20).map((g) => ({
      id: str(g.id, Math.random().toString(36).slice(2)),
      name: str(g.name, "Hedef").slice(0, 30),
      emoji: str(g.emoji, "🎯").slice(0, 8),
      target: Math.max(1, num(g.target, 50)),
      saved: Math.max(0, num(g.saved)),
      createdAt: num(g.createdAt, Date.now()),
      completedAt: typeof g.completedAt === "number" ? g.completedAt : undefined,
    }));
  }
  s.shopOwned = strArr(raw.shopOwned).filter((id) => SHOP_IDS.has(id));
  if (isObj(raw.activeLesson) && getLesson(str(raw.activeLesson.lessonId))) {
    s.activeLesson = {
      lessonId: str(raw.activeLesson.lessonId),
      step: Math.max(0, Math.round(num(raw.activeLesson.step))),
      firstTry: Math.max(0, Math.round(num(raw.activeLesson.firstTry))),
    };
  }
  if (isObj(raw.daily) && str(raw.daily.date)) {
    s.daily = { date: str(raw.daily.date), questId: str(raw.daily.questId), progress: num(raw.daily.progress), claimed: bool(raw.daily.claimed) };
  }
  s.activeDays = strArr(raw.activeDays).slice(-60);
  if (Array.isArray(raw.celebrations)) {
    s.celebrations = raw.celebrations.filter((c): c is Celebration => isObj(c) && typeof c.kind === "string").slice(0, 20);
  }
  if (isObj(raw.final) && isObj(raw.final.scores)) {
    const sc = raw.final.scores;
    s.final = {
      completedAt: num(raw.final.completedAt, Date.now()),
      scores: { planlama: num(sc.planlama), degerlendirme: num(sc.degerlendirme), hesaplama: num(sc.hesaplama), guvenlik: num(sc.guvenlik) },
      total: num(raw.final.total),
      passed: bool(raw.final.passed),
    };
  }
  if (isObj(raw.practiceStats)) {
    for (const t of TOPIC_IDS) {
      const v = raw.practiceStats[t];
      if (isObj(v)) s.practiceStats[t] = { correct: num(v.correct), total: num(v.total) };
    }
  }
  s.flashcardsSeen = strArr(raw.flashcardsSeen);
  if (isObj(raw.settings)) {
    const st = raw.settings;
    s.settings = {
      sound: st.sound !== false,
      motion: st.motion === "acik" || st.motion === "kapali" ? st.motion : "sistem",
      unlockAll: bool(st.unlockAll),
      parentPin: /^\d{4}$/.test(str(st.parentPin)) ? str(st.parentPin) : undefined,
    };
  }
  s.version = STATE_VERSION;
  return s;
}

export function loadState(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    return sanitize(JSON.parse(raw));
  } catch {
    return createInitialState();
  }
}

export function saveState(s: UserProgress): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}

/** Dışa aktarma: Takma ad ve ebeveyn PIN'i dosyaya yazılmaz */
export function exportProgress(s: UserProgress): string {
  const data: UserProgress = {
    ...s,
    profile: s.profile ? { ...s.profile, nickname: "" } : null,
    settings: { ...s.settings, parentPin: undefined },
    celebrations: [],
  };
  return JSON.stringify({ app: EXPORT_APP, version: STATE_VERSION, exportedAt: new Date().toISOString(), data }, null, 2);
}

export function importProgress(text: string, current: UserProgress): [UserProgress | null, string | null] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return [null, "Dosya okunamadı. Lütfen uygulamadan dışa aktarılmış bir .json dosyası seçin."];
  }
  if (!isObj(parsed) || parsed.app !== EXPORT_APP || !isObj(parsed.data)) {
    return [null, "Bu dosya Minik Finans Kaşifleri ilerleme dosyası değil."];
  }
  const next = sanitize(parsed.data);
  // Cihazdaki takma ad ve PIN korunur
  if (next.profile) next.profile.nickname = current.profile?.nickname ?? "";
  else if (current.profile) next.profile = current.profile;
  next.settings.parentPin = current.settings.parentPin;
  next.celebrations = [];
  return [next, null];
}
