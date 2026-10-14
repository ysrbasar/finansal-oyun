import type { Badge } from "../types";

export const BADGE_XP = 15;

export const BADGES: Badge[] = [
  { id: "ilk-adim", title: "İlk Adım", icon: "👣", color: "#35C9B1", description: "Finans kaşifliği yolculuğuna ilk adımı attın!", condition: "İlk dersini tamamla." },
  { id: "para-dedektifi", title: "Para Dedektifi", icon: "🔎", color: "#FFD166", description: "Paraları tanıyor, toplayıp karşılaştırabiliyorsun.", condition: "Para Kasabası'nın 3 dersini tamamla." },
  { id: "ihtiyac-uzmani", title: "İhtiyaç Uzmanı", icon: "🌳", color: "#58C78A", description: "İhtiyaçları ve istekleri ayırt edebiliyorsun.", condition: "\"İhtiyaç mı, İstek mi?\" oyununu en az %80 başarıyla bitir." },
  { id: "butce-mimari", title: "Bütçe Mimarı", icon: "🏗️", color: "#7AA7FF", description: "Bütçe sınırını aşmadan plan kurabiliyorsun.", condition: "Akıllı Alışveriş oyununda bir görevi bütçeyi aşmadan tamamla." },
  { id: "birikim-tohumu", title: "Birikim Tohumu", icon: "🌱", color: "#58C78A", description: "Birikim kavanozuna ilk parayı koydun.", condition: "Bir birikim hedefine ilk katkını yap." },
  { id: "hedef-avcisi", title: "Hedef Avcısı", icon: "🎯", color: "#FF7A70", description: "Bir birikim hedefine ulaştın!", condition: "Birikim Laboratuvarı'nda ya da Birikim Yolculuğu oyununda bir hedefi tamamla." },
  { id: "para-ustu-ustasi", title: "Para Üstü Ustası", icon: "🧮", color: "#FFB347", description: "Para üstünü hızlı ve doğru hesaplıyorsun.", condition: "Para Üstünü Bul oyununda en az 8 doğru yap." },
  { id: "akilli-alisverisci", title: "Akıllı Alışverişçi", icon: "🛍️", color: "#FF9F5A", description: "Liste yapıyor, karşılaştırıyor, bilerek seçiyorsun.", condition: "Akıllı Alışveriş Pazarı'nın 3 dersini tamamla." },
  { id: "kazanc-tasarimcisi", title: "Kazanç Tasarımcısı", icon: "🔖", color: "#B58CFF", description: "Hayali işletmende giderleri aşan bir gelir elde ettin.", condition: "Kazanç Atölyesi oyununda kâr et." },
  { id: "guvenlik-koruyucusu", title: "Güvenlik Koruyucusu", icon: "🛡️", color: "#4C7CF0", description: "Şüpheli mesajları fark ediyor, bilgilerini koruyorsun.", condition: "Güvenlik Radarı oyununu en az %80 başarıyla bitir." },
  { id: "paylasim-kahramani", title: "Paylaşım Kahramanı", icon: "🌻", color: "#F2B84B", description: "Paylaşmanın ve sorumluluğun birçok yolunu keşfettin.", condition: "Paylaşım Bahçesi'nin 3 dersini tamamla." },
  { id: "finans-ustasi", title: "Finans Ustası", icon: "🏆", color: "#FFD166", description: "Büyük Finans Üstadı sınavını başarıyla geçtin!", condition: "Final sınavını geç." },
  { id: "hafiza-sampiyonu", title: "Hafıza Şampiyonu", icon: "🧠", color: "#FF7A70", description: "Kavramları ve açıklamalarını eşleştirebiliyorsun.", condition: "Hafıza Kartları oyununu bitir." },
  { id: "butce-dedektifi", title: "Bütçe Dedektifi", icon: "🕵️", color: "#192744", description: "Harcama kayıtlarındaki hataları buluyorsun.", condition: "Bütçe Dedektifi oyununda en az 4 vakayı çöz." },
  { id: "zaman-yolcusu", title: "Zaman Yolcusu", icon: "⏳", color: "#2BB3C0", description: "Fiyatların zamanla değişebildiğini anladın.", condition: "Ekonomi Zaman Tüneli'nin 3 dersini tamamla." },
  { id: "israrci-kasif", title: "Israrcı Kaşif", icon: "🔁", color: "#35C9B1", description: "İlk seferde zorlandığın soruları tekrar çalışarak öğrendin.", condition: "İlk denemede yanlış yaptığın 5 soruyu sonradan doğru cevapla." },
  { id: "duzenli-kasif", title: "Düzenli Kaşif", icon: "📅", color: "#7AA7FF", description: "Farklı günlerde gelip öğrenmeye devam ettin.", condition: "Uygulamayı 3 farklı günde kullan (günlerin art arda olması gerekmez)." },
  { id: "harita-kasifi", title: "Harita Kaşifi", icon: "🗺️", color: "#FFD166", description: "Keşif haritasının yarısından fazlasını tamamladın.", condition: "6 bölümü tamamla." },
];
