// Minik Finans Kaşifleri — ortak veri modelleri

export type TopicId =
  | "para"
  | "ihtiyac"
  | "deger"
  | "butce"
  | "birikim"
  | "kazanc"
  | "alisveris"
  | "dijital"
  | "paylasim"
  | "zaman";

export type Difficulty = 1 | 2 | 3;

/** Ders ve oyunlarda gösterilebilen küçük görsel sahneler */
export type Visual =
  | { kind: "emoji"; items: string[]; caption?: string }
  | { kind: "money"; values: number[]; caption?: string }
  | { kind: "price"; items: { emoji: string; name: string; price: number }[]; caption?: string }
  | { kind: "jar"; saved: number; target: number; caption?: string };

export interface Choice {
  id: string;
  text: string;
  emoji?: string;
  /** Karar sorularında seçime özel geri bildirim */
  feedback?: string;
}

interface QuestionBase {
  id: string;
  topic: TopicId;
  difficulty: Difficulty;
  prompt: string;
  visual?: Visual;
  /** İlk yanlışta gösterilen yönlendirici ipucu */
  hint: string;
  /** Cevaptan sonra gösterilen kısa açıklama */
  explanation: string;
}

export interface McqQuestion extends QuestionBase {
  type: "mcq";
  choices: Choice[];
  answer: string;
}

export interface TrueFalseQuestion extends QuestionBase {
  type: "truefalse";
  answer: boolean;
}

export interface NumericQuestion extends QuestionBase {
  type: "numeric";
  answer: number;
  unit?: string;
}

export interface MatchQuestion extends QuestionBase {
  type: "match";
  pairs: { left: string; right: string }[];
}

/** Bir durum karşısında karar: birden fazla seçenek geçerli olabilir */
export interface DecisionQuestion extends QuestionBase {
  type: "decision";
  choices: Choice[];
  /** Kabul edilen (geçerli) seçenekler */
  accepted: string[];
}

export type Question =
  | McqQuestion
  | TrueFalseQuestion
  | NumericQuestion
  | MatchQuestion
  | DecisionQuestion;

export interface StoryPanel {
  text: string;
  visual?: Visual;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  goal: string;
  story: StoryPanel[];
  example: { title: string; text: string; visual?: Visual };
  /** Zorlanan çocuğa gösterilen alternatif, daha kolay anlatım */
  easierExample: string;
  activities: Question[];
  review: string[];
}

export interface Module {
  id: string;
  order: number;
  title: string;
  place: string;
  description: string;
  icon: string;
  color: string;
  topic: TopicId;
  lessons: Lesson[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  emoji: string;
  topic: TopicId;
}

export type GameId =
  | "ihtiyac-istek"
  | "market"
  | "para-ustu"
  | "hafiza"
  | "birikim-yolu"
  | "butce-dedektifi"
  | "kazanc-atolyesi"
  | "guvenlik-radari";

export interface Game {
  id: GameId;
  title: string;
  description: string;
  rules: string[];
  icon: string;
  color: string;
  topic: TopicId;
  /** Tamamlanma için gereken başarı yüzdesi */
  passPercent: number;
}

export interface GameResult {
  gameId: GameId;
  score: number;
  max: number;
  /** Oyuna özel ek bilgi (ör. kâr) */
  extra?: Record<string, number>;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  condition: string;
  icon: string;
  color: string;
}

export interface Level {
  level: number;
  title: string;
  minXp: number;
  unlock: string;
}

export interface Avatar {
  id: string;
  emoji: string;
  name: string;
  color: string;
  reaction: string;
}

export interface WalletTransaction {
  id: string;
  at: number;
  amount: number;
  kind: "kazanc" | "harcama" | "birikim" | "geri-alma" | "baslangic";
  label: string;
}

export interface Wallet {
  balance: number;
  transactions: WalletTransaction[];
}

export interface SavingsGoal {
  id: string;
  name: string;
  emoji: string;
  target: number;
  saved: number;
  createdAt: number;
  completedAt?: number;
}

export interface Settings {
  sound: boolean;
  motion: "sistem" | "acik" | "kapali";
  unlockAll: boolean;
  parentPin?: string;
}

export interface QuestionStat {
  /** Kaç kez karşılaşıldı */
  seen: number;
  /** İlk karşılaşmada ilk denemede doğru mu */
  firstTryCorrect: boolean;
  /** Herhangi bir denemede doğru cevaplandı mı */
  learned: boolean;
  /** İlk seferde zorlanıp sonraki bir karşılaşmada ilk denemede doğru yapıldı mı */
  recovered: boolean;
  lastSeen: number;
}

export interface LessonRecord {
  completedAt: number;
  firstTryCorrect: number;
  total: number;
  plays: number;
}

export interface GameRecord {
  plays: number;
  best: number;
  max: number;
  completed: boolean;
  lastPlayed: number;
}

export interface ActiveLesson {
  lessonId: string;
  step: number;
  /** Bu oturumda ilk denemede doğru cevaplanan soru sayısı */
  firstTry: number;
}

export type Celebration =
  | { kind: "badge"; badgeId: string; xp: number }
  | { kind: "level"; level: number }
  | { kind: "module"; moduleId: string; xp: number }
  | { kind: "goal"; goalId: string; name: string; emoji: string }
  | { kind: "unlock"; moduleId: string }
  | { kind: "daily"; xp: number; coins: number };

export interface DailyQuestState {
  date: string;
  questId: string;
  progress: number;
  claimed: boolean;
}

export interface FinalResult {
  completedAt: number;
  scores: { planlama: number; degerlendirme: number; hesaplama: number; guvenlik: number };
  total: number;
  passed: boolean;
}

export interface UserProgress {
  version: number;
  profile: Profile | null;
  xp: number;
  completedLessons: Record<string, LessonRecord>;
  questionStats: Record<string, QuestionStat>;
  games: Partial<Record<GameId, GameRecord>>;
  badges: Record<string, { earnedAt: number; seen: boolean }>;
  /** Tek seferlik ödüllerin anahtarları — aynı ödül iki kez verilmez */
  claimed: Record<string, number>;
  wallet: Wallet;
  goals: SavingsGoal[];
  shopOwned: string[];
  activeLesson: ActiveLesson | null;
  daily: DailyQuestState | null;
  activeDays: string[];
  celebrations: Celebration[];
  final: FinalResult | null;
  /** Üretilen (rastgele) pratik sorularının konu bazında sonuçları */
  practiceStats: Partial<Record<TopicId, { correct: number; total: number }>>;
  /** Çevrilen eğitim kartları */
  flashcardsSeen: string[];
  settings: Settings;
}

export interface Profile {
  nickname: string;
  avatarId: string;
  createdAt: number;
  accessory?: string;
  jarSkin?: string;
}
