// Uyarlanabilir pratik: Zorlanılan sorular, zayıf konular ve benzer ama aynı olmayan üretilmiş sorular
import type { Difficulty, NumericQuestion, Question, TopicId, UserProgress } from "../types";
import { ALL_QUESTIONS, MODULES } from "../data/modules";
import { isModuleUnlocked, isStruggling, reviewQueue, topicStats } from "./engine";
import { shuffle } from "./util";

const pick = <T,>(arr: readonly T[], rand: () => number) => arr[Math.floor(rand() * arr.length)];
const between = (min: number, max: number, step: number, rand: () => number) => {
  const n = Math.floor((max - min) / step) + 1;
  return min + Math.floor(rand() * n) * step;
};

type Gen = (d: Difficulty, rand: () => number) => Omit<NumericQuestion, "id" | "type" | "difficulty">;

const NAMES = ["Ece", "Mert", "Defne", "Can", "Zeynep", "Arda", "Elif", "Bora", "Selin", "Emir"];
const ITEMS = [
  { e: "📒", n: "defter" },
  { e: "🖍️", n: "boya seti" },
  { e: "📗", n: "kitap" },
  { e: "⚽", n: "top" },
  { e: "🧃", n: "meyve suyu" },
  { e: "🪁", n: "uçurtma" },
  { e: "🧩", n: "yapboz" },
];

/** Konu başına soru üreticileri (her çağrıda farklı sayılar) */
export const GENERATORS: Partial<Record<TopicId, Gen[]>> = {
  para: [
    (d, r) => {
      const notes = d === 1 ? [5, 10] : d === 2 ? [5, 10, 20] : [10, 20, 50];
      const a = pick(notes, r);
      const b = pick(notes, r);
      const c = d === 3 ? pick([5, 10], r) : 0;
      const values = c ? [a, b, c] : [a, b];
      const sum = values.reduce((x, y) => x + y, 0);
      return {
        topic: "para",
        prompt: `Cüzdanda ${values.map((v) => `${v} TL`).join(", ")} var. Toplam kaç TL?`,
        visual: { kind: "money", values },
        answer: sum,
        unit: "TL",
        hint: "Paraları tek tek topla. Önce büyük olandan başla.",
        explanation: `${values.join(" + ")} = ${sum} TL.`,
      };
    },
    (d, r) => {
      const price = d === 1 ? between(5, 15, 5, r) : d === 2 ? between(11, 45, 1, r) : between(36, 95, 1, r);
      const paid = price <= 20 ? 20 : price <= 50 ? 50 : 100;
      return {
        topic: "para",
        prompt: `Ürün ${price} TL. Kasaya ${paid} TL verdin. Para üstü kaç TL?`,
        visual: { kind: "money", values: [paid] },
        answer: paid - price,
        unit: "TL",
        hint: `${price}'ten ${paid}'e kadar say ya da ${paid} - ${price} işlemini yap.`,
        explanation: `${paid} - ${price} = ${paid - price} TL para üstü.`,
      };
    },
  ],
  deger: [
    (d, r) => {
      const it = pick(ITEMS, r);
      const a = d === 1 ? between(10, 30, 5, r) : between(15, 60, 1, r);
      const diff = d === 1 ? between(5, 15, 5, r) : between(3, 25, 1, r);
      return {
        topic: "deger",
        prompt: `A dükkânında ${it.n} ${a + diff} TL, B dükkânında ${a} TL. Aradaki fark kaç TL?`,
        visual: { kind: "price", items: [{ emoji: it.e, name: "A dükkânı", price: a + diff }, { emoji: it.e, name: "B dükkânı", price: a }] },
        answer: diff,
        unit: "TL",
        hint: "Büyük fiyattan küçük fiyatı çıkar.",
        explanation: `${a + diff} - ${a} = ${diff} TL.`,
      };
    },
  ],
  butce: [
    (d, r) => {
      const budget = d === 1 ? 50 : d === 2 ? 100 : 150;
      const x = between(10, Math.floor(budget / 2.5), 5, r);
      const y = between(5, Math.floor(budget / 3), 5, r);
      const name = pick(NAMES, r);
      return {
        topic: "butce",
        prompt: `${name}'in bütçesi ${budget} TL. ${x} TL ve ${y} TL harcadı. Kaç TL kaldı?`,
        answer: budget - x - y,
        unit: "TL",
        hint: `Önce harcamaları topla: ${x} + ${y}. Sonra ${budget}'den çıkar.`,
        explanation: `${x} + ${y} = ${x + y} TL harcama. ${budget} - ${x + y} = ${budget - x - y} TL kaldı.`,
      };
    },
  ],
  birikim: [
    (d, r) => {
      const target = d === 1 ? between(30, 60, 10, r) : between(50, 150, 10, r);
      const saved = between(10, target - 10, d === 1 ? 10 : 5, r);
      return {
        topic: "birikim",
        prompt: `Hedef ${target} TL. Kavanozda ${saved} TL var. Kaç TL daha biriktirmek gerekir?`,
        visual: { kind: "jar", saved, target },
        answer: target - saved,
        unit: "TL",
        hint: "Hedeften mevcut birikimi çıkar.",
        explanation: `${target} - ${saved} = ${target - saved} TL.`,
      };
    },
    (d, r) => {
      const weekly = d === 1 ? 10 : pick([5, 10, 15, 20], r);
      const weeks = between(2, d === 3 ? 8 : 6, 1, r);
      return {
        topic: "birikim",
        prompt: `Her hafta ${weekly} TL biriktirirsen ${weekly * weeks} TL'lik hedefe kaç haftada ulaşırsın?`,
        answer: weeks,
        unit: "hafta",
        hint: `${weekly}'er ${weekly}'er say ve kaç kez saydığına bak.`,
        explanation: `${weekly} × ${weeks} = ${weekly * weeks}. Yani ${weeks} hafta.`,
      };
    },
  ],
  kazanc: [
    (d, r) => {
      const cost = between(10, d === 1 ? 30 : 60, 5, r);
      const count = between(4, 10, 1, r);
      const price = between(Math.ceil(cost / count) + 1, Math.ceil(cost / count) + (d === 1 ? 3 : 6), 1, r);
      const income = count * price;
      return {
        topic: "kazanc",
        prompt: `Malzemeye ${cost} TL harcandı. ${count} ayraç tanesi ${price} TL'den satıldı. Kâr kaç TL?`,
        answer: income - cost,
        unit: "TL",
        hint: `Önce geliri bul: ${count} × ${price}. Sonra gideri çıkar.`,
        explanation: `Gelir ${count} × ${price} = ${income} TL. Kâr ${income} - ${cost} = ${income - cost} TL.`,
      };
    },
  ],
  alisveris: [
    (d, r) => {
      const old = between(20, d === 1 ? 60 : 120, 10, r);
      const cut = between(5, Math.floor(old / 2), 5, r);
      return {
        topic: "alisveris",
        prompt: `Bir ürün ${old} TL'den ${old - cut} TL'ye indi. İndirimli fiyattan alırsan kaç TL harcarsın?`,
        answer: old - cut,
        unit: "TL",
        hint: "İndirimli ürünü almak da harcamadır. Etikette yazan yeni fiyat ne?",
        explanation: `Yeni fiyat ${old - cut} TL. Ürünü alırsan cüzdandan ${old - cut} TL çıkar.`,
      };
    },
  ],
  zaman: [
    (d, r) => {
      const price = pick(d === 1 ? [5, 10] : [5, 10, 15, 20], r);
      const count = between(2, 6, 1, r);
      const money = price * count;
      return {
        topic: "zaman",
        prompt: `${money} TL'n var. Bir gofret ${price} TL olursa kaç gofret alabilirsin? (Örnek senaryo)`,
        answer: count,
        unit: "gofret",
        hint: `${price}'er ${price}'er ${money}'e kadar say.`,
        explanation: `${money} ÷ ${price} = ${count} gofret.`,
      };
    },
  ],
};

export function generateQuestion(topic: TopicId, difficulty: Difficulty, rand: () => number = Math.random): NumericQuestion | null {
  const gens = GENERATORS[topic];
  if (!gens) return null;
  const base = pick(gens, rand)(difficulty, rand);
  return { ...base, id: `gen-${topic}-${Math.floor(rand() * 1e9)}`, type: "numeric", difficulty };
}

export interface PracticeItem {
  question: Question;
  source: "tekrar" | "benzer" | "yeni";
}

/** Bir pratik seti oluşturur. Aynı sırayı tekrar etmez, zorlanılan konulara ağırlık verir. */
export function buildPracticeSet(
  s: UserProgress,
  opts: { topic?: TopicId; count?: number } = {},
  rand: () => number = Math.random,
): PracticeItem[] {
  const count = opts.count ?? 6;
  const unlockedTopics = new Set(MODULES.filter((m) => isModuleUnlocked(s, m)).map((m) => m.topic));
  const topicOk = (t: TopicId) => (opts.topic ? t === opts.topic : unlockedTopics.has(t));
  const now = Date.now();
  const items: PracticeItem[] = [];
  const used = new Set<string>();

  // 1) İlk seferde zorlanılan sorular (tekrar), ama en fazla setin yarısı
  const review = shuffle(reviewQueue(s).filter((q) => topicOk(q.topic)), rand);
  for (const q of review.slice(0, Math.ceil(count / 2))) {
    items.push({ question: q, source: "tekrar" });
    used.add(q.id);
    // Benzer ama birebir aynı olmayan bir soru ekle
    const gen = generateQuestion(q.topic, isStruggling(s, q.topic) ? 1 : q.difficulty, rand);
    if (gen && items.length < count) items.push({ question: gen, source: "benzer" });
  }

  // 2) Zayıf konulardan üretilmiş sorular
  const weak = topicStats(s)
    .filter((t) => topicOk(t.topic) && t.firstTryRate !== null && t.firstTryRate < 70)
    .map((t) => t.topic);
  for (const t of shuffle(weak, rand)) {
    if (items.length >= count) break;
    const gen = generateQuestion(t, 1, rand);
    if (gen) items.push({ question: gen, source: "benzer" });
  }

  // 3) Uzun süredir görülmeyen ya da hiç görülmeyen soru bankası soruları
  const pool = shuffle(
    ALL_QUESTIONS.filter((q) => topicOk(q.topic) && !used.has(q.id)),
    rand,
  ).sort((a, b) => (s.questionStats[a.id]?.lastSeen ?? 0) - (s.questionStats[b.id]?.lastSeen ?? 0));
  for (const q of pool) {
    if (items.length >= count) break;
    const st = s.questionStats[q.id];
    if (st && now - st.lastSeen < 10 * 60 * 1000 && pool.length > count) continue;
    items.push({ question: q, source: "yeni" });
    used.add(q.id);
  }

  // 4) Hâlâ eksikse üretilmiş sorularla tamamla
  const topics = opts.topic ? [opts.topic] : [...unlockedTopics];
  let guard = 0;
  while (items.length < count && guard++ < 20) {
    const gen = generateQuestion(pick(topics, rand), 2, rand);
    if (gen) items.push({ question: gen, source: "benzer" });
  }
  return shuffle(items, rand).slice(0, count);
}
