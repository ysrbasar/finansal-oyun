import type { Avatar } from "../types";

export const AVATARS: Avatar[] = [
  { id: "tilki", emoji: "🦊", name: "Tilki", color: "#FF9F5A", reaction: "Tilki kaşifler çok meraklıdır. Her köşeyi keşfedeceğiz!" },
  { id: "panda", emoji: "🐼", name: "Panda", color: "#7AA7FF", reaction: "Pandalar sakin ve planlıdır. Bütçe işlerinde harika olacaksın!" },
  { id: "baykus", emoji: "🦉", name: "Baykuş", color: "#B58CFF", reaction: "Baykuşlar dikkatli düşünür. Akıllı kararlar seni bekliyor!" },
  { id: "kaplumbaga", emoji: "🐢", name: "Kaplumbağa", color: "#58C78A", reaction: "Yavaş ama emin adımlar! Birikimde sabır süper güçtür." },
  { id: "kedi", emoji: "🐱", name: "Kedi", color: "#FFD166", reaction: "Kediler her şeyi fark eder. Şüpheli mesajlar senden kaçamaz!" },
  { id: "tavsan", emoji: "🐰", name: "Tavşan", color: "#FF7A70", reaction: "Tavşanlar hızlıdır. Hesaplarda şimşek gibi olacaksın!" },
  { id: "aslan", emoji: "🦁", name: "Aslan", color: "#F2B84B", reaction: "Aslanlar cesurdur. Zor sorulardan korkmuyoruz!" },
  { id: "penguen", emoji: "🐧", name: "Penguen", color: "#2BB3C0", reaction: "Penguenler takım oyuncusudur. Paylaşım Bahçesi'ni seveceksin!" },
];

export const getAvatar = (id: string | undefined) => AVATARS.find((a) => a.id === id) ?? AVATARS[0];
