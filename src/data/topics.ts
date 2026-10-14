import type { TopicId } from "../types";

export const TOPICS: Record<TopicId, { title: string; emoji: string }> = {
  para: { title: "Parayı tanıma", emoji: "🪙" },
  ihtiyac: { title: "İhtiyaç ve istek", emoji: "🌳" },
  deger: { title: "Paranın değeri", emoji: "⚖️" },
  butce: { title: "Bütçe", emoji: "📋" },
  birikim: { title: "Birikim ve hedefler", emoji: "🫙" },
  kazanc: { title: "Emek ve kazanç", emoji: "🛠️" },
  alisveris: { title: "Akıllı alışveriş", emoji: "🛒" },
  dijital: { title: "Dijital güvenlik", emoji: "🔐" },
  paylasim: { title: "Paylaşım ve toplum", emoji: "🌻" },
  zaman: { title: "Fiyatlar ve zaman", emoji: "⏳" },
};

export const TOPIC_IDS = Object.keys(TOPICS) as TopicId[];
