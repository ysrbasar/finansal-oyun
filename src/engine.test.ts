import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserProgress } from "./types";
import {
  claimDaily,
  completeLesson,
  createGoal,
  createInitialState,
  depositToGoal,
  finalize,
  isModuleUnlocked,
  levelForXp,
  progressDaily,
  questForDate,
  recordFinal,
  recordGame,
  recordOutcome,
  reviewQueue,
  buyShopItem,
  withdrawFromGoal,
  START_BALANCE,
} from "./lib/engine";
import { MODULES } from "./data/modules";
import { exportProgress, importProgress, sanitize } from "./lib/storage";
import { GENERATORS, buildPracticeSet, generateQuestion } from "./lib/practice";
import type { TopicId } from "./types";

const apply = (s: UserProgress, fn: (s: UserProgress) => UserProgress) => finalize(s, fn(s));

let base: UserProgress;
beforeEach(() => {
  base = createInitialState();
  base.profile = { nickname: "Yıldız", avatarId: "tilki", createdAt: 1 };
});

describe("ders ve XP", () => {
  it("ders ödülü yalnızca ilk tamamlamada verilir", () => {
    let s = apply(base, (x) => completeLesson(x, "m01-l1", 3, 3));
    const xp1 = s.xp;
    const bal1 = s.wallet.balance;
    expect(xp1).toBeGreaterThanOrEqual(20);
    expect(bal1).toBe(START_BALANCE + 5);
    expect(s.badges["ilk-adim"]).toBeTruthy();
    s = apply(s, (x) => completeLesson(x, "m01-l1", 3, 3));
    expect(s.xp).toBe(xp1);
    expect(s.wallet.balance).toBe(bal1);
    expect(s.completedLessons["m01-l1"].plays).toBe(2);
  });

  it("bölüm bitince bonus, rozet ve yeni bölüm kilidi açılır", () => {
    let s = base;
    const m4 = MODULES[3];
    expect(isModuleUnlocked(s, m4)).toBe(false);
    for (const id of ["m03-l1", "m03-l2"]) s = apply(s, (x) => completeLesson(x, id, 3, 3));
    expect(isModuleUnlocked(s, m4)).toBe(true);
    expect(s.celebrations.some((c) => c.kind === "unlock" && c.moduleId === "m04")).toBe(true);
    for (const id of ["m01-l1", "m01-l2", "m01-l3"]) s = apply(s, (x) => completeLesson(x, id, 3, 3));
    expect(s.claimed["module:m01"]).toBeTruthy();
    expect(s.badges["para-dedektifi"]).toBeTruthy();
    expect(s.celebrations.some((c) => c.kind === "module")).toBe(true);
  });

  it("seviye XP'ye göre hesaplanır ve seviye atlama kutlanır", () => {
    expect(levelForXp(0).level).toBe(1);
    expect(levelForXp(50).level).toBe(2);
    const s = apply(base, (x) => ({ ...x, xp: 140 }));
    expect(s.celebrations.filter((c) => c.kind === "level").map((c) => (c as { level: number }).level)).toEqual([2, 3]);
  });
});

describe("soru istatistikleri", () => {
  it("ilk deneme başarısı ve sonradan öğrenme ayrı tutulur, gelişim bonusu bir kez verilir", () => {
    let s = apply(base, (x) => recordOutcome(x, { questionId: "m01-l1-q1", correctFirst: false, correctEventually: true }));
    expect(s.questionStats["m01-l1-q1"].firstTryCorrect).toBe(false);
    expect(s.questionStats["m01-l1-q1"].learned).toBe(true);
    expect(reviewQueue(s).map((q) => q.id)).toContain("m01-l1-q1");
    const xp = s.xp;
    s = apply(s, (x) => recordOutcome(x, { questionId: "m01-l1-q1", correctFirst: true, correctEventually: true }));
    expect(s.questionStats["m01-l1-q1"].recovered).toBe(true);
    expect(s.xp).toBe(xp + 3);
    expect(reviewQueue(s).map((q) => q.id)).not.toContain("m01-l1-q1");
    s = apply(s, (x) => recordOutcome(x, { questionId: "m01-l1-q1", correctFirst: true, correctEventually: true }));
    expect(s.xp).toBe(xp + 3);
  });
});

describe("oyunlar", () => {
  it("ilk başarıda ödül verir, tekrarda sadece rekor için az XP verir", () => {
    let s = apply(base, (x) => recordGame(x, { gameId: "guvenlik-radari", score: 7, max: 8 }));
    expect(s.wallet.balance).toBe(START_BALANCE + 10);
    expect(s.badges["guvenlik-koruyucusu"]).toBeTruthy();
    const xp = s.xp;
    s = apply(s, (x) => recordGame(x, { gameId: "guvenlik-radari", score: 7, max: 8 }));
    expect(s.xp).toBe(xp);
    s = apply(s, (x) => recordGame(x, { gameId: "guvenlik-radari", score: 8, max: 8 }));
    expect(s.xp).toBe(xp + 5);
    expect(s.wallet.balance).toBe(START_BALANCE + 10);
  });

  it("başarısız oyun ödül vermez ama kaydedilir", () => {
    const s = apply(base, (x) => recordGame(x, { gameId: "para-ustu", score: 2, max: 10 }));
    expect(s.games["para-ustu"]?.plays).toBe(1);
    expect(s.xp).toBe(0);
  });
});

describe("cüzdan ve birikim", () => {
  it("hedefe para eklenir, cüzdandan düşer, tamamlanınca kutlanır", () => {
    let [s, err] = createGoal(base, "Kitap", "📚", 30);
    expect(err).toBeNull();
    const id = s.goals[0].id;
    [s, err] = depositToGoal(s, id, 500);
    expect(err).toMatch(/Cüzdanında/);
    let n: UserProgress;
    [n] = depositToGoal(s, id, 10);
    s = finalize(s, n);
    expect(s.wallet.balance).toBe(START_BALANCE - 10);
    expect(s.badges["birikim-tohumu"]).toBeTruthy();
    [n] = withdrawFromGoal(s, id, 5);
    s = finalize(s, n);
    expect(s.goals[0].saved).toBe(5);
    [n] = depositToGoal(s, id, 50);
    s = finalize(s, n);
    expect(s.goals[0].saved).toBe(30);
    expect(s.goals[0].completedAt).toBeTruthy();
    expect(s.wallet.balance).toBe(START_BALANCE - 30);
    expect(s.badges["hedef-avcisi"]).toBeTruthy();
  });

  it("dükkânda seviye ve bakiye kontrol edilir", () => {
    let [s, err] = buyShopItem(base, "tac");
    expect(err).toMatch(/seviyede/);
    [s, err] = buyShopItem(base, "kurdele");
    expect(err).toBeNull();
    expect(s.wallet.balance).toBe(START_BALANCE - 20);
    expect(s.profile?.accessory).toBe("kurdele");
    [, err] = buyShopItem(s, "kurdele");
    expect(err).toMatch(/zaten/);
  });
});

describe("günlük görev", () => {
  it("görev tamamlanınca ödül günde bir kez alınır", () => {
    const date = "2026-10-14";
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${date}T10:00:00`));
    const quest = questForDate(date);
    let s: UserProgress = { ...base, daily: { date, questId: quest.id, progress: 0, claimed: false } };
    for (let i = 0; i < quest.target; i++) s = progressDaily(s, quest.event);
    s = apply(s, claimDaily);
    const xp = s.xp;
    expect(s.daily?.claimed).toBe(true);
    s = apply(s, claimDaily);
    expect(s.xp).toBe(xp);
    vi.useRealTimers();
  });
});

describe("final", () => {
  it("geçme notu ile rozet ve ödül verir, en iyi sonucu saklar", () => {
    let s = apply(base, (x) => recordFinal(x, { planlama: 100, degerlendirme: 80, hesaplama: 75, guvenlik: 100 }));
    expect(s.final?.passed).toBe(true);
    expect(s.badges["finans-ustasi"]).toBeTruthy();
    s = apply(s, (x) => recordFinal(x, { planlama: 0, degerlendirme: 0, hesaplama: 0, guvenlik: 0 }));
    expect(s.final?.passed).toBe(true);
  });
});

describe("yerel kayıt", () => {
  it("bozuk veriyi güvenli bir duruma dönüştürür", () => {
    const s = sanitize({ xp: "çok", wallet: { balance: -5, transactions: "x" }, completedLessons: { yok: {}, "m01-l1": { plays: 2 } }, games: { hile: {} }, settings: { motion: "uç" } });
    expect(s.xp).toBe(0);
    expect(s.wallet.balance).toBe(0);
    expect(Object.keys(s.completedLessons)).toEqual(["m01-l1"]);
    expect(s.games).toEqual({});
    expect(s.settings.motion).toBe("sistem");
    expect(sanitize(null).wallet.balance).toBe(START_BALANCE);
  });

  it("dışa aktarma kişisel bilgi içermez, içe aktarma ilerlemeyi geri yükler", () => {
    const s = apply({ ...base, settings: { ...base.settings, parentPin: "1234" } }, (x) => completeLesson(x, "m01-l1", 2, 3));
    const text = exportProgress(s);
    expect(text).not.toContain("Yıldız");
    expect(text).not.toContain("1234");
    const [restored, err] = importProgress(text, s);
    expect(err).toBeNull();
    expect(restored?.completedLessons["m01-l1"]).toBeTruthy();
    expect(restored?.profile?.nickname).toBe("Yıldız");
    expect(importProgress("{}", s)[1]).toBeTruthy();
    expect(importProgress("bozuk", s)[1]).toBeTruthy();
  });
});

describe("pratik motoru", () => {
  it("üretilen sorular tutarlı ve negatif olmayan cevaplar verir", () => {
    for (const topic of Object.keys(GENERATORS) as TopicId[]) {
      for (const d of [1, 2, 3] as const) {
        for (let i = 0; i < 50; i++) {
          const q = generateQuestion(topic, d)!;
          expect(q.answer, `${topic}: ${q.prompt}`).toBeGreaterThanOrEqual(0);
          expect(Number.isInteger(q.answer)).toBe(true);
        }
      }
    }
  });

  it("pratik seti zorlanılan soruları ve benzer soruları içerir", () => {
    const s = recordOutcome(base, { questionId: "m01-l3-q1", correctFirst: false, correctEventually: false });
    const set = buildPracticeSet(s, { count: 6 });
    expect(set.length).toBe(6);
    expect(set.some((p) => p.question.id === "m01-l3-q1")).toBe(true);
    expect(set.some((p) => p.source === "benzer")).toBe(true);
  });
});
