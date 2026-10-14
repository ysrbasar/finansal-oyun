/** Kaşif Dükkânı: sanal TL ile alınan kozmetik eşyalar (gerçek para yoktur) */
export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  minLevel: number;
  kind: "aksesuar" | "kavanoz";
  description: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: "kurdele", name: "Renkli Kurdele", emoji: "🎀", price: 20, minLevel: 1, kind: "aksesuar", description: "Avatarına neşeli bir kurdele." },
  { id: "sapka", name: "Kaşif Şapkası", emoji: "🤠", price: 40, minLevel: 2, kind: "aksesuar", description: "Gerçek kaşiflerin şapkası." },
  { id: "gozluk", name: "Hesap Gözlüğü", emoji: "🤓", price: 50, minLevel: 3, kind: "aksesuar", description: "Fiyatları daha net görmek için." },
  { id: "yildiz-kavanoz", name: "Yıldızlı Kavanoz", emoji: "⭐", price: 45, minLevel: 4, kind: "kavanoz", description: "Birikim kavanozuna yıldızlı görünüm." },
  { id: "durbun", name: "Kaşif Dürbünü", emoji: "🔭", price: 60, minLevel: 5, kind: "aksesuar", description: "Uzaktaki hedefleri görmek için." },
  { id: "kask", name: "Atölye Kaskı", emoji: "⛑️", price: 60, minLevel: 6, kind: "aksesuar", description: "Kazanç Atölyesi'nin resmi kaskı." },
  { id: "pelerin", name: "Koruyucu Pelerin", emoji: "🦸", price: 70, minLevel: 7, kind: "aksesuar", description: "Dijital güvenlik koruyucularına özel." },
  { id: "gokkusagi-kavanoz", name: "Gökkuşağı Kavanoz", emoji: "🌈", price: 70, minLevel: 8, kind: "kavanoz", description: "Kavanozuna gökkuşağı renkleri." },
  { id: "madalya", name: "Usta Madalyası", emoji: "🏅", price: 80, minLevel: 9, kind: "aksesuar", description: "Finans ustalarının madalyası." },
  { id: "tac", name: "Büyük Kaşif Tacı", emoji: "👑", price: 100, minLevel: 10, kind: "aksesuar", description: "Büyük Finans Kaşifi'ne layık bir taç." },
];

export const getShopItem = (id: string | undefined) => SHOP_ITEMS.find((s) => s.id === id);
