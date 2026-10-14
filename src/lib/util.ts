export const formatTL = (n: number) =>
  `${Number.isInteger(n) ? n : n.toFixed(2).replace(".", ",")} TL`;

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function shuffle<T>(arr: readonly T[], rand: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Basit, deterministik dize özeti (günlük görev seçimi gibi işler için) */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const pct = (part: number, whole: number) => (whole <= 0 ? 0 : Math.round((part / whole) * 100));

export const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
