import type { Level } from "../types";

/** Her seviye bir harita parçası ve yeni bir dükkân eşyası açar */
export const LEVELS: Level[] = [
  { level: 1, title: "Meraklı Kaşif", minXp: 0, unlock: "Kaşif çantan hazır! İlk harita parçası senin." },
  { level: 2, title: "Para Tanıyıcısı", minXp: 50, unlock: "Kaşif Dükkânı'nda Kaşif Şapkası açıldı." },
  { level: 3, title: "Bütçe Çırağı", minXp: 130, unlock: "Kaşif Dükkânı'nda Hesap Gözlüğü açıldı." },
  { level: 4, title: "Birikim Ustası", minXp: 240, unlock: "Kavanozun için Yıldızlı Kavanoz görünümü açıldı." },
  { level: 5, title: "Akıllı Alışverişçi", minXp: 380, unlock: "Kaşif Dükkânı'nda Kaşif Dürbünü açıldı." },
  { level: 6, title: "Kazanç Tasarımcısı", minXp: 540, unlock: "Kaşif Dükkânı'nda Atölye Kaskı açıldı." },
  { level: 7, title: "Dijital Güvenlik Koruyucusu", minXp: 720, unlock: "Kaşif Dükkânı'nda Koruyucu Pelerin açıldı." },
  { level: 8, title: "Ekonomi Kâşifi", minXp: 920, unlock: "Kavanozun için Gökkuşağı Kavanoz görünümü açıldı." },
  { level: 9, title: "Finans Ustası", minXp: 1150, unlock: "Kaşif Dükkânı'nda Usta Madalyası açıldı." },
  { level: 10, title: "Büyük Finans Kaşifi", minXp: 1400, unlock: "Kaşif Dükkânı'nda Büyük Kaşif Tacı açıldı. Hazine haritası tamamlandı!" },
];

/** Her seviyede kazanılan harita parçaları (koleksiyon) */
export const MAP_PIECES = ["🧭", "🏘️", "🌳", "⚖️", "🌉", "⛰️", "🛠️", "🛒", "🏙️", "🏆"];
