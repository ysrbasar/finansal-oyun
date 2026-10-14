// Mini oyunların başlangıç verileri. Fiyatlar eğitim amaçlı örnek tutarlardır.

export interface SortCard {
  id: string;
  emoji: string;
  name: string;
  answer: "ihtiyac" | "istek" | "duruma-gore";
  note: string;
}

export const SORT_CARDS: SortCard[] = [
  { id: "su", emoji: "💧", name: "İçme suyu", answer: "ihtiyac", note: "Su, yaşamak için gereklidir." },
  { id: "kahvalti", emoji: "🥣", name: "Kahvaltı", answer: "ihtiyac", note: "Güne enerjiyle başlamak için beslenmeye ihtiyacımız var." },
  { id: "mont", emoji: "🧥", name: "Kışın mont", answer: "ihtiyac", note: "Soğukta mont bizi hastalıktan korur." },
  { id: "defter", emoji: "📒", name: "Okul defteri", answer: "ihtiyac", note: "Okulda öğrenmek için gerekli bir malzeme." },
  { id: "dis-fircasi", emoji: "🪥", name: "Diş fırçası", answer: "ihtiyac", note: "Sağlık ve temizlik için gereklidir." },
  { id: "ilac", emoji: "💊", name: "Doktorun verdiği ilaç", answer: "ihtiyac", note: "Hastayken iyileşmek için gereklidir." },
  { id: "oyuncak", emoji: "🧸", name: "Benzerine sahip olduğun yeni oyuncak", answer: "istek", note: "Zaten benzeri varken yenisi bir istektir." },
  { id: "konsol", emoji: "🎮", name: "Yeni oyun konsolu", answer: "istek", note: "Eğlenceli ama yaşamak için gerekmez." },
  { id: "sticker", emoji: "✨", name: "Parlak çıkartma seti", answer: "istek", note: "Güzel bir istek; bekleyebilir." },
  { id: "dondurma", emoji: "🍦", name: "Dondurma", answer: "istek", note: "Lezzetli bir keyif ama temel ihtiyaç değildir." },
  { id: "ayakkabi", emoji: "👟", name: "Yeni ayakkabı", answer: "duruma-gore", note: "Eskisi küçüldüyse ihtiyaç, sadece farklı bir model istiyorsan istek. İki cevap da kabul!" },
  { id: "kalem", emoji: "✏️", name: "Yeni kalem", answer: "duruma-gore", note: "Kalemin bittiyse ihtiyaç, kutuda 10 kalemin varsa istek. Duruma bağlı!" },
];

export interface MarketItem {
  id: string;
  emoji: string;
  name: string;
  price: number;
  note?: string;
}

export const MARKET_ITEMS: MarketItem[] = [
  { id: "ekmek", emoji: "🍞", name: "Ekmek", price: 10 },
  { id: "sut", emoji: "🥛", name: "Süt", price: 25 },
  { id: "elma", emoji: "🍎", name: "Elma (1 kg)", price: 20 },
  { id: "peynir", emoji: "🧀", name: "Peynir", price: 40 },
  { id: "defter", emoji: "📒", name: "Defter", price: 20 },
  { id: "defter-ucuz", emoji: "📓", name: "Ekonomik defter", price: 12, note: "Daha ince sayfalı" },
  { id: "kalem", emoji: "✏️", name: "Kalem", price: 8 },
  { id: "silgi", emoji: "🧽", name: "Silgi", price: 5 },
  { id: "boya", emoji: "🖍️", name: "Boya seti", price: 35 },
  { id: "boya-kucuk", emoji: "🖍️", name: "Küçük boya seti", price: 20, note: "6 renk" },
  { id: "cikolata", emoji: "🍫", name: "Çikolata", price: 15 },
  { id: "top", emoji: "⚽", name: "Top", price: 45 },
  { id: "sticker", emoji: "✨", name: "Çıkartma", price: 12 },
  { id: "meyve-suyu", emoji: "🧃", name: "Meyve suyu", price: 12 },
];

export interface MarketMission {
  id: string;
  title: string;
  story: string;
  budget: number;
  /** Her grup için en az bir ürün alınmalı (alternatifler) */
  required: { label: string; anyOf: string[] }[];
}

export const MARKET_MISSIONS: MarketMission[] = [
  {
    id: "kahvalti",
    title: "Kahvaltı alışverişi",
    story: "Ailen kahvaltı için ekmek ve süt almanı istedi. Kalan parayla istersen bir şey daha alabilirsin.",
    budget: 50,
    required: [
      { label: "Ekmek", anyOf: ["ekmek"] },
      { label: "Süt", anyOf: ["sut"] },
    ],
  },
  {
    id: "okul",
    title: "Okul hazırlığı",
    story: "Yeni dönem için bir defter, bir kalem ve bir boya seti gerekiyor. Bütçen 60 TL.",
    budget: 60,
    required: [
      { label: "Defter", anyOf: ["defter", "defter-ucuz"] },
      { label: "Kalem", anyOf: ["kalem"] },
      { label: "Boya", anyOf: ["boya", "boya-kucuk"] },
    ],
  },
  {
    id: "piknik",
    title: "Piknik sepeti",
    story: "Piknik için ekmek, peynir ve meyve al. 100 TL bütçen var; top da istersen sığıyor mu, bak!",
    budget: 100,
    required: [
      { label: "Ekmek", anyOf: ["ekmek"] },
      { label: "Peynir", anyOf: ["peynir"] },
      { label: "Meyve", anyOf: ["elma"] },
    ],
  },
];

/** Hafıza kartı yüzü: Yazı yerine simge ya da para görseli */
export interface MemoryFace {
  emoji?: string;
  money?: number[];
  /** Ekran okuyucular için açıklama (ekranda yazı olarak gösterilmez) */
  alt: string;
}

export interface MemoryPair {
  a: MemoryFace;
  b: MemoryFace;
}

export interface MemorySet {
  id: string;
  title: string;
  emoji: string;
  hint: string;
  pairs: MemoryPair[];
}

const e = (emoji: string, alt: string): MemoryFace => ({ emoji, alt });
const m = (money: number[], alt: string): MemoryFace => ({ money, alt });

export const MEMORY_SETS: MemorySet[] = [
  {
    id: "meslek",
    title: "Meslek ve iş",
    emoji: "🧑‍🔧",
    hint: "Her meslek sahibini yaptığı işle eşleştir.",
    pairs: [
      { a: e("🧑‍🍳", "Fırıncı"), b: e("🍞", "Ekmek") },
      { a: e("🧑‍🏫", "Öğretmen"), b: e("📚", "Ders kitapları") },
      { a: e("🧑‍🔧", "Tamirci"), b: e("🔧", "İngiliz anahtarı") },
      { a: e("🧑‍⚕️", "Doktor"), b: e("🩺", "Steteskop") },
      { a: e("🧑‍🌾", "Çiftçi"), b: e("🌾", "Buğday") },
      { a: e("🧑‍🚒", "İtfaiyeci"), b: e("🚒", "İtfaiye aracı") },
    ],
  },
  {
    id: "para",
    title: "Aynı değerdeki paralar",
    emoji: "💵",
    hint: "Toplamı aynı olan paraları eşleştir.",
    pairs: [
      { a: m([50, 50], "İki tane 50 TL"), b: m([100], "100 TL") },
      { a: m([20, 10], "20 TL ve 10 TL"), b: m([10, 10, 10], "Üç tane 10 TL") },
      { a: m([5, 5], "İki tane 5 TL"), b: m([10], "10 TL") },
      { a: m([100, 100], "İki tane 100 TL"), b: m([200], "200 TL") },
      { a: m([0.5, 0.5], "İki tane 50 kuruş"), b: m([1], "1 TL") },
      { a: m([20, 20, 10], "20 TL, 20 TL ve 10 TL"), b: m([50], "50 TL") },
    ],
  },
  {
    id: "ihtiyac",
    title: "İhtiyaç ve çözümü",
    emoji: "💧",
    hint: "Her durumu ona gereken ihtiyaçla eşleştir.",
    pairs: [
      { a: e("🥵", "Susamış çocuk"), b: e("💧", "Su") },
      { a: e("🥶", "Üşüyen çocuk"), b: e("🧥", "Mont") },
      { a: e("🤒", "Hasta çocuk"), b: e("💊", "İlaç") },
      { a: e("🏫", "Okul"), b: e("📒", "Defter") },
      { a: e("😋", "Acıkmış çocuk"), b: e("🍲", "Yemek") },
      { a: e("🦷", "Diş"), b: e("🪥", "Diş fırçası") },
    ],
  },
  {
    id: "guvenlik",
    title: "Risk ve doğru davranış",
    emoji: "🛡️",
    hint: "Her riskli durumu doğru davranışla eşleştir.",
    pairs: [
      { a: e("🔐", "Şifre"), b: e("🤫", "Gizli tut") },
      { a: e("🔗", "Garip bağlantı"), b: e("✋", "Tıklama, dur") },
      { a: e("🎁", "Ödül vaat eden mesaj"), b: e("👩‍👧", "Bir yetişkine göster") },
      { a: e("💳", "Kart bilgisi"), b: e("🙅", "Paylaşma") },
      { a: e("🏠", "Ev adresi"), b: e("🚫", "Yabancıya söyleme") },
      { a: e("⏰", "Acele ettiren mesaj"), b: e("🧘", "Dur ve düşün") },
    ],
  },
];

export interface DetectiveCase {
  id: string;
  character: string;
  emoji: string;
  budget: number;
  entries: { label: string; amount: number }[];
  question: string;
  choices: { id: string; text: string }[];
  answer: string;
  explanation: string;
}

export const DETECTIVE_CASES: DetectiveCase[] = [
  {
    id: "d1",
    character: "Mert",
    emoji: "🧒",
    budget: 100,
    entries: [
      { label: "Kitap", amount: 45 },
      { label: "Oyuncak", amount: 35 },
      { label: "Sinema", amount: 30 },
    ],
    question: "Mert'in bütçesinde sorun ne?",
    choices: [
      { id: "a", text: "Toplam 110 TL; bütçeyi 10 TL aşmış." },
      { id: "b", text: "Hiç sorun yok, 10 TL artmış." },
      { id: "c", text: "Toplam 90 TL; bütçenin altında." },
    ],
    answer: "a",
    explanation: "45 + 35 + 30 = 110 TL. 100 TL'lik bütçe 10 TL aşılmış.",
  },
  {
    id: "d2",
    character: "Elif",
    emoji: "👧",
    budget: 60,
    entries: [
      { label: "Defter", amount: 20 },
      { label: "Kalem", amount: 10 },
      { label: "Boya", amount: 25 },
    ],
    question: "Elif'in elinde kaç TL kalmalı?",
    choices: [
      { id: "a", text: "5 TL" },
      { id: "b", text: "15 TL" },
      { id: "c", text: "Hiç kalmaz" },
    ],
    answer: "a",
    explanation: "20 + 10 + 25 = 55 TL harcandı. 60 - 55 = 5 TL kalır.",
  },
  {
    id: "d3",
    character: "Can",
    emoji: "🧒",
    budget: 80,
    entries: [
      { label: "Spor ayakkabı bağcığı", amount: 15 },
      { label: "Atıştırmalık", amount: 20 },
      { label: "Atıştırmalık", amount: 20 },
      { label: "Atıştırmalık", amount: 20 },
    ],
    question: "Can bütçeyi aşmadı ama kayıtlarında dikkat çeken ne var?",
    choices: [
      { id: "a", text: "Paranın çoğu (60 TL) atıştırmalığa gitmiş." },
      { id: "b", text: "Bağcık çok pahalı." },
      { id: "c", text: "Hiç para harcamamış." },
    ],
    answer: "a",
    explanation: "Üç atıştırmalık 60 TL ediyor; 75 TL'lik harcamanın çoğu. Bütçe aşılmasa da plan dengeli değil.",
  },
  {
    id: "d4",
    character: "Zeynep",
    emoji: "👧",
    budget: 50,
    entries: [
      { label: "Hediye kartı", amount: 25 },
      { label: "Kurdele", amount: 5 },
      { label: "Kart", amount: 10 },
    ],
    question: "Zeynep kalan parasını 5 TL yazmış. Doğru mu?",
    choices: [
      { id: "a", text: "Hayır, 10 TL kalmalı." },
      { id: "b", text: "Evet, 5 TL doğru." },
      { id: "c", text: "Hayır, 15 TL kalmalı." },
    ],
    answer: "a",
    explanation: "25 + 5 + 10 = 40 TL. 50 - 40 = 10 TL kalmalı. Zeynep hesap hatası yapmış.",
  },
  {
    id: "d5",
    character: "Bora",
    emoji: "🧒",
    budget: 120,
    entries: [
      { label: "Plan: Kırtasiye", amount: 40 },
      { label: "Plan: Birikim", amount: 50 },
      { label: "Gerçek: Kırtasiye", amount: 40 },
      { label: "Gerçek: Oyun kartı", amount: 50 },
    ],
    question: "Bora'nın planı ile gerçek harcaması arasındaki fark ne?",
    choices: [
      { id: "a", text: "Birikime ayırdığı 50 TL'yi oyun kartına harcamış." },
      { id: "b", text: "Kırtasiyeye fazla harcamış." },
      { id: "c", text: "Plana tam uymuş." },
    ],
    answer: "a",
    explanation: "Kırtasiye plana uygun; ama birikime ayrılan 50 TL oyun kartına gitmiş.",
  },
  {
    id: "d6",
    character: "Ada",
    emoji: "👧",
    budget: 70,
    entries: [
      { label: "Kitap (indirimli)", amount: 30 },
      { label: "İkinci kitap (indirimli)", amount: 30 },
      { label: "Kalem kutusu", amount: 20 },
    ],
    question: "Ada \"İndirimdi, para kazandım!\" diyor. Ne oldu?",
    choices: [
      { id: "a", text: "80 TL harcayıp 70 TL'lik bütçeyi 10 TL aşmış." },
      { id: "b", text: "İndirim olduğu için 60 TL kazanmış." },
      { id: "c", text: "Bütçenin altında kalmış." },
    ],
    answer: "a",
    explanation: "30 + 30 + 20 = 80 TL. İndirimli almak da harcamaktır; bütçe 10 TL aşılmış.",
  },
];

export interface SecurityScenario {
  id: string;
  sender: string;
  message: string;
  safe: boolean;
  actions: { id: string; text: string }[];
  best: string;
  explanation: string;
}

export const SECURITY_SCENARIOS: SecurityScenario[] = [
  {
    id: "s1",
    sender: "Bilinmeyen numara",
    message: "Tebrikler! Telefon kazandın. Ödülü almak için kart şifreni yaz.",
    safe: false,
    actions: [
      { id: "a", text: "Şifre yazmam, mesajı bir yetişkine gösteririm." },
      { id: "b", text: "Şifreyi yazarım, ödül büyük." },
      { id: "c", text: "Cevap verip kim olduğunu sorarım." },
    ],
    best: "a",
    explanation: "Gerçek ödüller şifre istemez. Bilgini paylaşmadan bir yetişkine göstermek en doğrusu.",
  },
  {
    id: "s2",
    sender: "Öğretmenin (okul uygulaması)",
    message: "Yarın resim dersi için boya kalemlerinizi getirmeyi unutmayın.",
    safe: true,
    actions: [
      { id: "a", text: "Boya kalemlerimi çantama koyarım." },
      { id: "b", text: "Mesajı silerim, şüpheli." },
    ],
    best: "a",
    explanation: "Tanıdık, bilgi isteyen değil bilgi veren bir mesaj. Para ya da şifre istemiyor.",
  },
  {
    id: "s3",
    sender: "Oyun sohbeti",
    message: "Bana annenin kart numarasını söylersen sana nadir bir kostüm hediye ederim.",
    safe: false,
    actions: [
      { id: "a", text: "Kart numarasını vermem, sohbetten çıkıp bir yetişkine anlatırım." },
      { id: "b", text: "Sadece son 4 rakamı söylerim." },
    ],
    best: "a",
    explanation: "Kart bilgisinin hiçbir parçası paylaşılmaz. Oyun içindeki yabancılara güvenilmez.",
  },
  {
    id: "s4",
    sender: "Bilinmeyen site",
    message: "Bu linke tıkla, 1000 bedava altın kazan! Sadece 10 saniyen var!",
    safe: false,
    actions: [
      { id: "a", text: "Tıklamam; acele ettiren mesajlar şüphelidir. Bir yetişkine sorarım." },
      { id: "b", text: "Süre bitmeden hemen tıklarım." },
    ],
    best: "a",
    explanation: "\"Hemen, acele et!\" diyen mesajlar düşünmeden hareket etmemizi ister. Durup sormak en iyisi.",
  },
  {
    id: "s5",
    sender: "Annen",
    message: "Akşam yemeğinde makarna var. Ödevlerini bitirince haber ver.",
    safe: true,
    actions: [
      { id: "a", text: "Ödevimi bitirip annemle konuşurum." },
      { id: "b", text: "Şüpheli, polise bildiririm." },
    ],
    best: "a",
    explanation: "Ailenden gelen, bilgi ya da para istemeyen günlük bir mesaj güvenlidir.",
  },
  {
    id: "s6",
    sender: "Tanımadığın biri",
    message: "Merhaba, ben de 8 yaşındayım. Ev adresini yazar mısın? Sana hediye göndereceğim.",
    safe: false,
    actions: [
      { id: "a", text: "Adresimi yazmam ve bir yetişkine haber veririm." },
      { id: "b", text: "Hediye güzel, adresimi yazarım." },
    ],
    best: "a",
    explanation: "Adres, okul ve telefon gibi kişisel bilgiler tanımadığımız kişilerle paylaşılmaz.",
  },
  {
    id: "s7",
    sender: "Video sitesi",
    message: "Bu videoyu izlerken reklam çıktı: \"Bu ayakkabılarla uçarsın!\"",
    safe: true,
    actions: [
      { id: "a", text: "Reklamın abarttığını bilir, izlemeye devam ederim." },
      { id: "b", text: "Hemen kart bilgisi girip ayakkabıyı alırım." },
    ],
    best: "a",
    explanation: "Reklamı görmek tehlikeli değil; ama satın alma kararını yetişkinlerle düşünerek veririz.",
  },
  {
    id: "s8",
    sender: "\"Banka\" yazan mesaj",
    message: "Hesabınız kapanacak! Hemen bu linke girip şifrenizi yenileyin.",
    safe: false,
    actions: [
      { id: "a", text: "Linke girmem, mesajı ailemin görmesini sağlarım." },
      { id: "b", text: "Hesap kapanmasın diye hemen girerim." },
    ],
    best: "a",
    explanation: "Gerçek kurumlar mesajla şifre istemez. Korkutan ve acele ettiren mesajlar şüphelidir.",
  },
  {
    id: "s9",
    sender: "Arkadaşın (sınıfta)",
    message: "Oyun hesabının şifresini bana söyler misin? Seviyeni ben atlatırım.",
    safe: false,
    actions: [
      { id: "a", text: "Şifremi arkadaşımla bile paylaşmam, kibarca hayır derim." },
      { id: "b", text: "Arkadaşım olduğu için söylerim." },
    ],
    best: "a",
    explanation: "Şifre arkadaşla bile paylaşılmaz. Kibarca hayır demek hem seni hem arkadaşlığını korur.",
  },
  {
    id: "s10",
    sender: "Babaannen",
    message: "Bayramda seni görmeye geleceğim, sana kitap getireceğim.",
    safe: true,
    actions: [
      { id: "a", text: "Sevinirim ve teşekkür ederim." },
      { id: "b", text: "Şifremi isteyecek diye korkarım." },
    ],
    best: "a",
    explanation: "Tanıdık bir aile büyüğünden gelen ve hiçbir bilgi istemeyen mesaj güvenlidir.",
  },
];

export interface JourneyGoal {
  id: string;
  name: string;
  emoji: string;
  target: number;
}

export const JOURNEY_GOALS: JourneyGoal[] = [
  { id: "kitap", name: "Macera kitabı", emoji: "📗", target: 60 },
  { id: "top", name: "Futbol topu", emoji: "⚽", target: 70 },
  { id: "boya", name: "Büyük boya seti", emoji: "🎨", target: 80 },
];

export interface JourneyWeek {
  income: number;
  temptation: { text: string; emoji: string; cost: number };
}

/** 8 haftalık birikim yolculuğu: her hafta gelir + bir cazip harcama */
export const JOURNEY_WEEKS: JourneyWeek[] = [
  { income: 15, temptation: { text: "Kantinde renkli bir şeker", emoji: "🍬", cost: 5 } },
  { income: 15, temptation: { text: "Arkadaşların sinemaya gidiyor", emoji: "🎬", cost: 15 } },
  { income: 10, temptation: { text: "Parlak bir anahtarlık", emoji: "🔑", cost: 8 } },
  { income: 15, temptation: { text: "Dondurma günü", emoji: "🍦", cost: 6 } },
  { income: 10, temptation: { text: "Yeni çıkartma seti", emoji: "✨", cost: 10 } },
  { income: 15, temptation: { text: "Oyun parkında jeton", emoji: "🎟️", cost: 10 } },
  { income: 10, temptation: { text: "Süslü kalem", emoji: "🖊️", cost: 7 } },
  { income: 15, temptation: { text: "Atıştırmalık paketi", emoji: "🍿", cost: 8 } },
];
