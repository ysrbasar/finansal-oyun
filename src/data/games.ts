import type { Game } from "../types";

export const GAMES: Game[] = [
  { id: "ihtiyac-istek", title: "İhtiyaç mı, İstek mi?", icon: "🌳", color: "#58C78A", topic: "ihtiyac", passPercent: 60, description: "Kartları doğru sepete yerleştir.", rules: ["Her kartı \"İhtiyaçlarım\" ya da \"İsteklerim\" alanına taşı.", "Sürükleyebilir ya da kartı seçip alana dokunabilirsin.", "Bazı kartlar duruma göre değişir; açıklamayı oku."] },
  { id: "market", title: "Akıllı Alışveriş", icon: "🛒", color: "#FF9F5A", topic: "butce", passPercent: 100, description: "Bütçeni aşmadan görevi tamamla.", rules: ["Görevdeki ihtiyaçları sepete ekle.", "Kalan bakiye anında güncellenir.", "Bütçeyi aşarsan sepeti düzenle."] },
  { id: "para-ustu", title: "Para Üstünü Bul", icon: "🧮", color: "#FFD166", topic: "para", passPercent: 60, description: "Verilen paradan fiyatı çıkar, para üstünü hesapla.", rules: ["10 tur var, sorular giderek zorlaşır.", "Cevabını yaz ya da para parçalarıyla oluştur.", "Yanlışta ipucu ve ikinci şans var."] },
  { id: "hafiza", title: "Hafıza Kartları", icon: "🧠", color: "#FF7A70", topic: "para", passPercent: 100, description: "Kavramları açıklamalarıyla eşleştir.", rules: ["İki kart aç.", "Eşleşirse açık kalır.", "Tüm eşleri bul."] },
  { id: "birikim-yolu", title: "Birikim Yolculuğu", icon: "🫙", color: "#35C9B1", topic: "birikim", passPercent: 100, description: "Haftalar geçerken biriktir ve hedefine ulaş.", rules: ["Bir hedef seç.", "Her hafta gelen sanal parayı biriktir ya da harca.", "Hedefe 8 haftada ulaşmaya çalış."] },
  { id: "butce-dedektifi", title: "Bütçe Dedektifi", icon: "🕵️", color: "#192744", topic: "butce", passPercent: 60, description: "Harcama kayıtlarındaki hatayı bul.", rules: ["Her vakada bütçeyi ve harcamaları incele.", "Sorunu bul ve doğru cevabı seç.", "6 vaka var."] },
  { id: "kazanc-atolyesi", title: "Kazanç Atölyesi", icon: "🔖", color: "#B58CFF", topic: "kazanc", passPercent: 66, description: "Ayraç işletmeni kur, gelir ve kârı hesapla.", rules: ["Malzeme al, ayraç üret.", "Fiyat belirle ve müşterilere sat.", "Gelir ve kârı hesapla."] },
  { id: "guvenlik-radari", title: "Güvenlik Radarı", icon: "🛡️", color: "#4C7CF0", topic: "dijital", passPercent: 60, description: "Güvenli ve şüpheli durumları ayırt et.", rules: ["Her mesajı oku.", "Güvenli mi, şüpheli mi karar ver.", "Sonra doğru davranışı seç."] },
];

export const getGame = (id: string) => GAMES.find((g) => g.id === id);
