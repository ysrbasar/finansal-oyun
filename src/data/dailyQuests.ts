export type QuestEvent = "lesson" | "game" | "practice" | "save" | "flashcard";

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  event: QuestEvent;
  target: number;
  emoji: string;
}

export const DAILY_REWARD = { xp: 15, coins: 10 };

export const DAILY_QUESTS: DailyQuest[] = [
  { id: "ders", title: "Bir ders tamamla", description: "Keşif haritasından bir ders bitir.", event: "lesson", target: 1, emoji: "📘" },
  { id: "oyun", title: "Bir mini oyun oyna", description: "Oyun merkezinden bir oyunu sonuna kadar oyna.", event: "game", target: 1, emoji: "🎮" },
  { id: "tekrar", title: "3 tekrar sorusu çöz", description: "Tekrar Köşesi'nde 3 soru cevapla.", event: "practice", target: 3, emoji: "🔁" },
  { id: "birikim", title: "Kavanoza para ekle", description: "Birikim hedefine sanal para ekle.", event: "save", target: 1, emoji: "🫙" },
  { id: "kart", title: "5 eğitim kartı çevir", description: "Koleksiyondaki eğitim kartlarından 5 tanesini çevir.", event: "flashcard", target: 5, emoji: "🃏" },
];
