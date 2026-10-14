// Tek doğruluk kaynağı: Tüm ilerleme, ödül, cüzdan ve rozet hesapları burada.
// Fonksiyonlar saf (pure) çalışır: eski durumu alır, yeni durum döndürür.
import type {
  Celebration,
  FinalResult,
  GameId,
  GameResult,
  Module,
  QuestionStat,
  SavingsGoal,
  TopicId,
  UserProgress,
  WalletTransaction,
} from "../types";
import { ALL_LESSONS, ALL_QUESTIONS, MODULES, getLesson, getModule } from "../data/modules";
import { BADGES, BADGE_XP } from "../data/badges";
import { LEVELS } from "../data/levels";
import { GAMES, getGame } from "../data/games";
import { DAILY_QUESTS, DAILY_REWARD, type QuestEvent } from "../data/dailyQuests";
import { getShopItem } from "../data/shop";
import { TOPIC_IDS } from "../data/topics";
import { hashString, todayKey, uid } from "./util";

export const STATE_VERSION = 1;
export const START_BALANCE = 100;

export const XP = {
  lesson: 20,
  moduleBonus: 30,
  gameFirst: 10,
  gameImprove: 5,
  recover: 3,
  finalPass: 100,
} as const;

export const COINS = { lesson: 5, gameFirst: 10, finalPass: 50 } as const;

export const MAX_ACTIVE_GOALS = 3;

export function createInitialState(now = Date.now()): UserProgress {
  return {
    version: STATE_VERSION,
    profile: null,
    xp: 0,
    completedLessons: {},
    questionStats: {},
    games: {},
    badges: {},
    claimed: {},
    wallet: {
      balance: START_BALANCE,
      transactions: [
        { id: uid(), at: now, amount: START_BALANCE, kind: "baslangic", label: "Başlangıç cüzdanı (sanal para)" },
      ],
    },
    goals: [],
    shopOwned: [],
    activeLesson: null,
    daily: null,
    activeDays: [],
    celebrations: [],
    final: null,
    practiceStats: {},
    flashcardsSeen: [],
    settings: { sound: true, motion: "sistem", unlockAll: false },
  };
}

// ---------- Seviye ----------

export function levelForXp(xp: number) {
  let current = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.minXp) current = l;
  return current;
}

export function nextLevelInfo(xp: number) {
  const cur = levelForXp(xp);
  const next = LEVELS.find((l) => l.level === cur.level + 1);
  if (!next) return { cur, next: undefined, progress: 100, remaining: 0 };
  const span = next.minXp - cur.minXp;
  return {
    cur,
    next,
    progress: Math.round(((xp - cur.minXp) / span) * 100),
    remaining: next.minXp - xp,
  };
}

// ---------- Ders ve modül ilerlemesi ----------

export const isLessonDone = (s: UserProgress, lessonId: string) => Boolean(s.completedLessons[lessonId]);

export const moduleDoneCount = (s: UserProgress, m: Module) =>
  m.lessons.filter((l) => isLessonDone(s, l.id)).length;

export const isModuleComplete = (s: UserProgress, m: Module) => moduleDoneCount(s, m) === m.lessons.length;

export const completedModuleCount = (s: UserProgress) => MODULES.filter((m) => isModuleComplete(s, m)).length;

/** İlk üç bölüm baştan açık; sonrakiler bir önceki bölümde 2 ders bitince açılır */
export function isModuleUnlocked(s: UserProgress, m: Module): boolean {
  if (s.settings.unlockAll || m.order <= 3) return true;
  const prev = MODULES.find((x) => x.order === m.order - 1);
  return prev ? moduleDoneCount(s, prev) >= 2 : true;
}

export const FINAL_REQUIRED_MODULES = 8;

export const isFinalUnlocked = (s: UserProgress) =>
  s.settings.unlockAll || completedModuleCount(s) >= FINAL_REQUIRED_MODULES;

export type ModuleStatus = "kilitli" | "acik" | "devam" | "tamam";

export function moduleStatus(s: UserProgress, m: Module): ModuleStatus {
  if (!isModuleUnlocked(s, m)) return "kilitli";
  const done = moduleDoneCount(s, m);
  if (done === m.lessons.length) return "tamam";
  return done > 0 ? "devam" : "acik";
}

/** Genel ilerleme: 30 ders + final */
export function overallProgress(s: UserProgress) {
  const total = ALL_LESSONS.length + 1;
  const done = Object.keys(s.completedLessons).filter((id) => getLesson(id)).length + (s.final?.passed ? 1 : 0);
  return Math.round((done / total) * 100);
}

/** Sıradaki önerilen ders: açık bölümlerdeki ilk bitmemiş ders */
export function nextLesson(s: UserProgress) {
  for (const m of MODULES) {
    if (!isModuleUnlocked(s, m)) continue;
    const l = m.lessons.find((x) => !isLessonDone(s, x.id));
    if (l) return l;
  }
  return undefined;
}

// ---------- Konu istatistikleri ----------

export interface TopicStat {
  topic: TopicId;
  answered: number;
  firstTry: number;
  learnedLater: number;
  practiceCorrect: number;
  practiceTotal: number;
  /** İlk denemede başarı yüzdesi (cevaplanmışsa) */
  firstTryRate: number | null;
}

export function topicStats(s: UserProgress): TopicStat[] {
  return TOPIC_IDS.map((topic) => {
    const qs = ALL_QUESTIONS.filter((q) => q.topic === topic);
    let answered = 0;
    let firstTry = 0;
    let learnedLater = 0;
    for (const q of qs) {
      const st = s.questionStats[q.id];
      if (!st) continue;
      answered++;
      if (st.firstTryCorrect) firstTry++;
      else if (st.learned || st.recovered) learnedLater++;
    }
    const p = s.practiceStats[topic] ?? { correct: 0, total: 0 };
    return {
      topic,
      answered,
      firstTry,
      learnedLater,
      practiceCorrect: p.correct,
      practiceTotal: p.total,
      firstTryRate: answered ? Math.round((firstTry / answered) * 100) : null,
    };
  });
}

/** İlk seferde zorlanılan ve henüz telafi edilmemiş sorular */
export const reviewQueue = (s: UserProgress) =>
  ALL_QUESTIONS.filter((q) => {
    const st = s.questionStats[q.id];
    return st && !st.firstTryCorrect && !st.recovered;
  });

export const recoveredCount = (s: UserProgress) =>
  Object.values(s.questionStats).filter((st) => st.recovered).length;

/** Bir konuda zorlanıyor mu? (Uyarlanabilir anlatım için) */
export function isStruggling(s: UserProgress, topic: TopicId) {
  const st = topicStats(s).find((t) => t.topic === topic);
  return Boolean(st && st.answered >= 2 && (st.firstTryRate ?? 100) < 50);
}

// ---------- Yardımcılar ----------

function addXp(s: UserProgress, n: number): UserProgress {
  return { ...s, xp: Math.max(0, s.xp + n) };
}

function claim(s: UserProgress, key: string): [UserProgress, boolean] {
  if (s.claimed[key]) return [s, false];
  return [{ ...s, claimed: { ...s.claimed, [key]: Date.now() } }, true];
}

function pushTx(s: UserProgress, tx: Omit<WalletTransaction, "id" | "at">): UserProgress {
  const t: WalletTransaction = { ...tx, id: uid(), at: Date.now() };
  const balance = Math.round((s.wallet.balance + tx.amount) * 100) / 100;
  return { ...s, wallet: { balance, transactions: [t, ...s.wallet.transactions].slice(0, 200) } };
}

const celebrate = (s: UserProgress, c: Celebration): UserProgress => ({ ...s, celebrations: [...s.celebrations, c] });

export function earnCoins(s: UserProgress, amount: number, label: string): UserProgress {
  return pushTx(s, { amount, kind: "kazanc", label });
}

// ---------- Soru sonuçları ----------

export interface AnswerOutcome {
  questionId: string;
  correctFirst: boolean;
  correctEventually: boolean;
}

export function recordOutcome(s: UserProgress, o: AnswerOutcome): UserProgress {
  const prev = s.questionStats[o.questionId];
  let next: QuestionStat;
  let state = s;
  if (!prev) {
    next = {
      seen: 1,
      firstTryCorrect: o.correctFirst,
      learned: o.correctEventually,
      recovered: false,
      lastSeen: Date.now(),
    };
  } else {
    next = { ...prev, seen: prev.seen + 1, learned: prev.learned || o.correctEventually, lastSeen: Date.now() };
    if (!prev.firstTryCorrect && !prev.recovered && o.correctFirst) {
      next.recovered = true;
      const [c, ok] = claim(state, `recover:${o.questionId}`);
      state = ok ? addXp(c, XP.recover) : c;
    }
  }
  return { ...state, questionStats: { ...state.questionStats, [o.questionId]: next } };
}

export function recordPractice(s: UserProgress, topic: TopicId, correct: boolean): UserProgress {
  const p = s.practiceStats[topic] ?? { correct: 0, total: 0 };
  const state = { ...s, practiceStats: { ...s.practiceStats, [topic]: { correct: p.correct + (correct ? 1 : 0), total: p.total + 1 } } };
  return progressDaily(state, "practice");
}

// ---------- Ders tamamlama ----------

export function startLesson(s: UserProgress, lessonId: string): UserProgress {
  return { ...s, activeLesson: { lessonId, step: 0, firstTry: 0 } };
}

export function setLessonStep(s: UserProgress, step: number, firstTryDelta = 0): UserProgress {
  if (!s.activeLesson) return s;
  return { ...s, activeLesson: { ...s.activeLesson, step, firstTry: s.activeLesson.firstTry + firstTryDelta } };
}

export function completeLesson(s: UserProgress, lessonId: string, firstTryCorrect: number, total: number): UserProgress {
  const lesson = getLesson(lessonId);
  if (!lesson) return s;
  const prev = s.completedLessons[lessonId];
  let state: UserProgress = {
    ...s,
    activeLesson: null,
    completedLessons: {
      ...s.completedLessons,
      [lessonId]: prev
        ? { ...prev, plays: prev.plays + 1, firstTryCorrect: Math.max(prev.firstTryCorrect, firstTryCorrect) }
        : { completedAt: Date.now(), firstTryCorrect, total, plays: 1 },
    },
  };
  const [c, first] = claim(state, `lesson:${lessonId}`);
  state = c;
  if (first) {
    state = addXp(state, XP.lesson);
    state = earnCoins(state, COINS.lesson, `Ders ödülü: ${lesson.title}`);
  }
  const mod = getModule(lesson.moduleId);
  if (mod && isModuleComplete(state, mod)) {
    const [c2, ok] = claim(state, `module:${mod.id}`);
    state = c2;
    if (ok) {
      state = addXp(state, XP.moduleBonus);
      state = celebrate(state, { kind: "module", moduleId: mod.id, xp: XP.moduleBonus });
    }
  }
  return progressDaily(state, "lesson");
}

/** Tek bir dersten elde edilecek XP (yalnızca ilk tamamlamada) */
export const lessonRewardPreview = (s: UserProgress, lessonId: string) =>
  s.claimed[`lesson:${lessonId}`] ? { xp: 0, coins: 0 } : { xp: XP.lesson, coins: COINS.lesson };

// ---------- Oyunlar ----------

export function gamePassed(gameId: GameId, score: number, max: number) {
  const g = getGame(gameId);
  if (!g || max <= 0) return false;
  return (score / max) * 100 >= g.passPercent;
}

export interface GameReward {
  xp: number;
  coins: number;
  passed: boolean;
  newBest: boolean;
}

export function gameRewardPreview(s: UserProgress, r: GameResult): GameReward {
  const passed = gamePassed(r.gameId, r.score, r.max);
  const prev = s.games[r.gameId];
  const newBest = !prev || r.score > prev.best;
  if (!passed) return { xp: 0, coins: 0, passed, newBest };
  if (!s.claimed[`game:${r.gameId}`]) return { xp: XP.gameFirst, coins: COINS.gameFirst, passed, newBest };
  if (newBest && !s.claimed[`game:${r.gameId}:best:${r.score}`]) return { xp: XP.gameImprove, coins: 0, passed, newBest };
  return { xp: 0, coins: 0, passed, newBest };
}

export function recordGame(s: UserProgress, r: GameResult): UserProgress {
  const g = getGame(r.gameId);
  if (!g) return s;
  const prev = s.games[r.gameId];
  const passed = gamePassed(r.gameId, r.score, r.max);
  let state: UserProgress = {
    ...s,
    games: {
      ...s.games,
      [r.gameId]: {
        plays: (prev?.plays ?? 0) + 1,
        best: Math.max(prev?.best ?? 0, r.score),
        max: r.max,
        completed: Boolean(prev?.completed) || passed,
        lastPlayed: Date.now(),
      },
    },
  };
  if (passed) {
    const [c, first] = claim(state, `game:${r.gameId}`);
    state = c;
    if (first) {
      state = addXp(state, XP.gameFirst);
      state = earnCoins(state, COINS.gameFirst, `Oyun ödülü: ${g.title}`);
    } else if (!prev || r.score > prev.best) {
      const [c2, ok] = claim(state, `game:${r.gameId}:best:${r.score}`);
      state = ok ? addXp(c2, XP.gameImprove) : c2;
    }
  }
  if (r.gameId === "kazanc-atolyesi" && r.extra?.profit && r.extra.profit > 0) {
    const [c3, ok] = claim(state, "workshop-profit");
    state = ok ? earnCoins(c3, Math.min(20, Math.round(r.extra.profit)), "Atölye kârı (sanal)") : c3;
  }
  return progressDaily(state, "game");
}

// ---------- Cüzdan ve dükkân ----------

export function buyShopItem(s: UserProgress, itemId: string): [UserProgress, string | null] {
  const item = getShopItem(itemId);
  if (!item) return [s, "Bu eşya bulunamadı."];
  if (s.shopOwned.includes(itemId)) return [s, "Bu eşya zaten senin."];
  if (levelForXp(s.xp).level < item.minLevel) return [s, `Bu eşya ${item.minLevel}. seviyede açılır.`];
  if (s.wallet.balance < item.price)
    return [s, `Sanal cüzdanında ${s.wallet.balance} TL var, bu eşya ${item.price} TL. ${item.price - s.wallet.balance} TL daha gerekiyor.`];
  let state = pushTx(s, { amount: -item.price, kind: "harcama", label: `Kaşif Dükkânı: ${item.name}` });
  state = { ...state, shopOwned: [...state.shopOwned, itemId] };
  if (state.profile) {
    state = {
      ...state,
      profile: item.kind === "kavanoz" ? { ...state.profile, jarSkin: itemId } : { ...state.profile, accessory: itemId },
    };
  }
  return [state, null];
}

export function equipItem(s: UserProgress, itemId: string | undefined, kind: "aksesuar" | "kavanoz"): UserProgress {
  if (!s.profile) return s;
  if (itemId && !s.shopOwned.includes(itemId)) return s;
  return { ...s, profile: kind === "kavanoz" ? { ...s.profile, jarSkin: itemId } : { ...s.profile, accessory: itemId } };
}

// ---------- Birikim hedefleri ----------

export function createGoal(s: UserProgress, name: string, emoji: string, target: number): [UserProgress, string | null] {
  const clean = name.trim().slice(0, 30);
  if (!clean) return [s, "Hedefine bir ad ver."];
  if (!Number.isFinite(target) || target < 5) return [s, "Hedef tutarı en az 5 TL olmalı."];
  if (target > 1000) return [s, "Bu laboratuvarda hedefler en çok 1000 TL olabilir."];
  if (s.goals.filter((g) => !g.completedAt).length >= MAX_ACTIVE_GOALS)
    return [s, `Aynı anda en çok ${MAX_ACTIVE_GOALS} hedefin olabilir. Önce birini tamamla ya da sil.`];
  const goal: SavingsGoal = { id: uid(), name: clean, emoji, target: Math.round(target), saved: 0, createdAt: Date.now() };
  return [{ ...s, goals: [...s.goals, goal] }, null];
}

export function depositToGoal(s: UserProgress, goalId: string, amount: number): [UserProgress, string | null] {
  const goal = s.goals.find((g) => g.id === goalId);
  if (!goal || goal.completedAt) return [s, "Bu hedef bulunamadı."];
  if (!Number.isFinite(amount) || amount <= 0) return [s, "Eklenecek tutar sıfırdan büyük olmalı."];
  if (amount > s.wallet.balance) return [s, `Cüzdanında ${s.wallet.balance} TL var. Daha fazlasını ekleyemezsin.`];
  const room = goal.target - goal.saved;
  const add = Math.min(amount, room);
  let state = pushTx(s, { amount: -add, kind: "birikim", label: `Kavanoza: ${goal.name}` });
  state = { ...state, goals: state.goals.map((g) => (g.id === goalId ? { ...g, saved: g.saved + add } : g)) };
  [state] = claim(state, "first-deposit");
  state = progressDaily(state, "save");
  const updated = state.goals.find((g) => g.id === goalId)!;
  if (updated.saved >= updated.target) {
    state = {
      ...state,
      goals: state.goals.map((g) => (g.id === goalId ? { ...g, completedAt: Date.now() } : g)),
      claimed: { ...state.claimed, "goal-complete": state.claimed["goal-complete"] ?? Date.now() },
    };
    state = celebrate(state, { kind: "goal", goalId, name: updated.name, emoji: updated.emoji });
  }
  return [state, null];
}

export function withdrawFromGoal(s: UserProgress, goalId: string, amount: number): [UserProgress, string | null] {
  const goal = s.goals.find((g) => g.id === goalId);
  if (!goal || goal.completedAt) return [s, "Bu hedef bulunamadı."];
  if (!Number.isFinite(amount) || amount <= 0) return [s, "Tutar sıfırdan büyük olmalı."];
  if (amount > goal.saved) return [s, `Kavanozda ${goal.saved} TL var.`];
  let state = pushTx(s, { amount, kind: "geri-alma", label: `Kavanozdan geri: ${goal.name}` });
  state = { ...state, goals: state.goals.map((g) => (g.id === goalId ? { ...g, saved: g.saved - amount } : g)) };
  return [state, null];
}

export function deleteGoal(s: UserProgress, goalId: string): UserProgress {
  const goal = s.goals.find((g) => g.id === goalId);
  if (!goal) return s;
  let state = s;
  if (!goal.completedAt && goal.saved > 0) {
    state = pushTx(state, { amount: goal.saved, kind: "geri-alma", label: `Hedef silindi, para cüzdana döndü: ${goal.name}` });
  }
  return { ...state, goals: state.goals.filter((g) => g.id !== goalId) };
}

// ---------- Günlük görev ----------

export function questForDate(date: string) {
  return DAILY_QUESTS[hashString(date) % DAILY_QUESTS.length];
}

export function ensureDaily(s: UserProgress, date = todayKey()): UserProgress {
  let state = s;
  if (!state.activeDays.includes(date)) state = { ...state, activeDays: [...state.activeDays, date].slice(-60) };
  if (state.daily?.date === date) return state;
  return { ...state, daily: { date, questId: questForDate(date).id, progress: 0, claimed: false } };
}

export function progressDaily(s: UserProgress, event: QuestEvent, n = 1): UserProgress {
  const state = ensureDaily(s);
  const d = state.daily!;
  const quest = DAILY_QUESTS.find((q) => q.id === d.questId);
  if (!quest || quest.event !== event) return state;
  return { ...state, daily: { ...d, progress: Math.min(quest.target, d.progress + n) } };
}

export function claimDaily(s: UserProgress): UserProgress {
  const state = ensureDaily(s);
  const d = state.daily!;
  const quest = DAILY_QUESTS.find((q) => q.id === d.questId);
  if (!quest || d.claimed || d.progress < quest.target) return state;
  const [c, ok] = claim(state, `daily:${d.date}`);
  if (!ok) return { ...c, daily: { ...d, claimed: true } };
  let next = addXp({ ...c, daily: { ...d, claimed: true } }, DAILY_REWARD.xp);
  next = earnCoins(next, DAILY_REWARD.coins, "Günün görevi ödülü");
  return celebrate(next, { kind: "daily", xp: DAILY_REWARD.xp, coins: DAILY_REWARD.coins });
}

export function markFlashcardSeen(s: UserProgress, id: string): UserProgress {
  if (s.flashcardsSeen.includes(id)) return progressDaily(s, "flashcard");
  return progressDaily({ ...s, flashcardsSeen: [...s.flashcardsSeen, id] }, "flashcard");
}

// ---------- Final ----------

export const FINAL_PASS_PERCENT = 60;

export function recordFinal(s: UserProgress, scores: FinalResult["scores"]): UserProgress {
  const total = Math.round((scores.planlama + scores.degerlendirme + scores.hesaplama + scores.guvenlik) / 4);
  const passed = total >= FINAL_PASS_PERCENT;
  const best = s.final && s.final.total > total ? s.final : null;
  let state: UserProgress = { ...s, final: best ?? { completedAt: Date.now(), scores, total, passed } };
  if (passed) {
    const [c, ok] = claim(state, "final");
    state = c;
    if (ok) {
      state = addXp(state, XP.finalPass);
      state = earnCoins(state, COINS.finalPass, "Final ödülü");
    }
  }
  return state;
}

// ---------- Rozetler ----------

const gameRatio = (s: UserProgress, id: GameId) => {
  const g = s.games[id];
  return g && g.max > 0 ? g.best / g.max : 0;
};

const modDone = (s: UserProgress, id: string) => {
  const m = getModule(id);
  return Boolean(m && isModuleComplete(s, m));
};

export const BADGE_RULES: Record<string, (s: UserProgress) => boolean> = {
  "ilk-adim": (s) => Object.keys(s.completedLessons).length >= 1,
  "para-dedektifi": (s) => modDone(s, "m01"),
  "ihtiyac-uzmani": (s) => gameRatio(s, "ihtiyac-istek") >= 0.8,
  "butce-mimari": (s) => (s.games.market?.best ?? 0) >= 1,
  "birikim-tohumu": (s) => Boolean(s.claimed["first-deposit"]),
  "hedef-avcisi": (s) => Boolean(s.claimed["goal-complete"]) || Boolean(s.games["birikim-yolu"]?.completed),
  "para-ustu-ustasi": (s) => (s.games["para-ustu"]?.best ?? 0) >= 8,
  "akilli-alisverisci": (s) => modDone(s, "m07"),
  "kazanc-tasarimcisi": (s) => Boolean(s.claimed["workshop-profit"]),
  "guvenlik-koruyucusu": (s) => gameRatio(s, "guvenlik-radari") >= 0.8,
  "paylasim-kahramani": (s) => modDone(s, "m09"),
  "finans-ustasi": (s) => Boolean(s.final?.passed),
  "hafiza-sampiyonu": (s) => Boolean(s.games.hafiza?.completed),
  "butce-dedektifi": (s) => (s.games["butce-dedektifi"]?.best ?? 0) >= 4,
  "zaman-yolcusu": (s) => modDone(s, "m10"),
  "israrci-kasif": (s) => recoveredCount(s) >= 5,
  "duzenli-kasif": (s) => s.activeDays.length >= 3,
  "harita-kasifi": (s) => completedModuleCount(s) >= 6,
};

/** Her durum değişikliğinden sonra çalışır: rozet, seviye ve kilit açılışlarını üretir */
export function finalize(prev: UserProgress, next: UserProgress): UserProgress {
  let state = next;
  for (const m of MODULES) {
    if (!state.settings.unlockAll && !isModuleUnlocked(prev, m) && isModuleUnlocked(state, m)) {
      state = celebrate(state, { kind: "unlock", moduleId: m.id });
    }
  }
  for (const b of BADGES) {
    if (state.badges[b.id]) continue;
    const rule = BADGE_RULES[b.id];
    if (rule && rule(state)) {
      state = addXp({ ...state, badges: { ...state.badges, [b.id]: { earnedAt: Date.now(), seen: false } } }, BADGE_XP);
      state = celebrate(state, { kind: "badge", badgeId: b.id, xp: BADGE_XP });
    }
  }
  const before = levelForXp(prev.xp).level;
  const after = levelForXp(state.xp).level;
  for (let l = before + 1; l <= after; l++) state = celebrate(state, { kind: "level", level: l });
  return state;
}

export const unseenBadgeCount = (s: UserProgress) => Object.values(s.badges).filter((b) => !b.seen).length;

export function markBadgesSeen(s: UserProgress): UserProgress {
  const badges = Object.fromEntries(Object.entries(s.badges).map(([k, v]) => [k, { ...v, seen: true }]));
  return { ...s, badges };
}

export const lastBadge = (s: UserProgress) => {
  const entries = Object.entries(s.badges).sort((a, b) => b[1].earnedAt - a[1].earnedAt);
  return entries[0] ? BADGES.find((b) => b.id === entries[0][0]) : undefined;
};

export const allGamesCount = GAMES.length;
