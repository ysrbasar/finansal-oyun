import { describe, expect, it } from "vitest";
import { ALL_LESSONS, ALL_QUESTIONS, MODULES } from "./data/modules";
import { FLASHCARDS } from "./data/flashcards";
import { BADGES } from "./data/badges";
import { GAMES } from "./data/games";
import { DETECTIVE_CASES, SECURITY_SCENARIOS, MARKET_MISSIONS, MARKET_ITEMS } from "./data/gameContent";
import { BADGE_RULES } from "./lib/engine";

describe("müfredat içeriği", () => {
  it("en az 10 modül ve 30 ders içerir", () => {
    expect(MODULES.length).toBeGreaterThanOrEqual(10);
    expect(ALL_LESSONS.length).toBeGreaterThanOrEqual(30);
    for (const m of MODULES) expect(m.lessons.length).toBeGreaterThanOrEqual(3);
  });

  it("en az 60 değerlendirme sorusu ve 30 karar senaryosu içerir", () => {
    const assessment = ALL_QUESTIONS.filter((q) => q.type !== "decision");
    const decisions = ALL_QUESTIONS.filter((q) => q.type === "decision");
    expect(assessment.length).toBeGreaterThanOrEqual(60);
    expect(decisions.length + SECURITY_SCENARIOS.length + DETECTIVE_CASES.length).toBeGreaterThanOrEqual(30);
    expect(decisions.length).toBeGreaterThanOrEqual(30);
  });

  it("en az dört soru biçimi kullanır", () => {
    const types = new Set(ALL_QUESTIONS.map((q) => q.type));
    for (const t of ["mcq", "truefalse", "match", "decision", "numeric"]) expect(types.has(t as never)).toBe(true);
  });

  it("en az 36 eğitim kartı, 12 rozet ve 6 oyun içerir", () => {
    expect(FLASHCARDS.length).toBeGreaterThanOrEqual(36);
    expect(BADGES.length).toBeGreaterThanOrEqual(12);
    expect(GAMES.length).toBeGreaterThanOrEqual(6);
  });

  it("kimlikler benzersizdir", () => {
    const ids = [...ALL_LESSONS.map((l) => l.id), ...ALL_QUESTIONS.map((q) => q.id), ...FLASHCARDS.map((f) => f.id), ...BADGES.map((b) => b.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("her sorunun cevap anahtarı, açıklaması, ipucu ve konusu vardır", () => {
    for (const q of ALL_QUESTIONS) {
      expect(q.explanation.length, q.id).toBeGreaterThan(5);
      expect(q.hint.length, q.id).toBeGreaterThan(5);
      expect([1, 2, 3]).toContain(q.difficulty);
      if (q.type === "mcq") expect(q.choices.map((c) => c.id), q.id).toContain(q.answer);
      if (q.type === "decision") {
        expect(q.accepted.length, q.id).toBeGreaterThan(0);
        for (const a of q.accepted) expect(q.choices.map((c) => c.id), q.id).toContain(a);
        for (const c of q.choices) expect(c.feedback, `${q.id}/${c.id}`).toBeTruthy();
      }
      if (q.type === "match") expect(q.pairs.length, q.id).toBeGreaterThanOrEqual(3);
      if (q.type === "numeric") expect(Number.isFinite(q.answer)).toBe(true);
    }
  });

  it("dersler arasında başlık tekrarı yoktur", () => {
    const titles = ALL_LESSONS.map((l) => l.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("her rozetin bir kazanma kuralı vardır", () => {
    for (const b of BADGES) expect(BADGE_RULES[b.id], b.id).toBeTypeOf("function");
  });

  it("dedektif vakalarının cevapları seçeneklerde bulunur", () => {
    for (const c of DETECTIVE_CASES) expect(c.choices.map((x) => x.id)).toContain(c.answer);
  });

  it("market görevleri bütçe içinde çözülebilir", () => {
    for (const m of MARKET_MISSIONS) {
      const min = m.required.reduce((t, g) => t + Math.min(...g.anyOf.map((id) => MARKET_ITEMS.find((i) => i.id === id)!.price)), 0);
      expect(min, m.id).toBeLessThanOrEqual(m.budget);
    }
  });
});
