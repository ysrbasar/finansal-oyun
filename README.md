# Minik Finans Kaşifleri

**Paranı tanı, geleceğini keşfet!** 8 yaşındaki çocuklar için Türkçe, oyunlaştırılmış finansal okuryazarlık uygulaması. Telefona kurulabilen, çevrimdışı çalışan bir PWA'dır. Backend, hesap, reklam, uygulama içi satın alma ya da analitik yoktur; tüm ilerleme cihazda (localStorage) tutulur.

## İçerik

- **10 modül, 30 ders**: Para Kasabası, İhtiyaçlar Ormanı, Değer Vadisi, Bütçe Köprüsü, Birikim Dağı, Kazanç Atölyesi, Akıllı Alışveriş Pazarı, Dijital Güvenlik Şehri, Paylaşım Bahçesi, Ekonomi Zaman Tüneli + **Büyük Final**.
- Her ders: hikâye → öğrenme hedefi → örnek → görevler (ipucu ve ikinci deneme ile) → kısa tekrar → ödül.
- **60 değerlendirme sorusu** (çoktan seçmeli, doğru/yanlış, eşleştirme, sayısal) + **30 karar senaryosu**; ayrıca 10 güvenlik senaryosu, 6 dedektif vakası ve sınırsız üretilen pratik sorusu.
- **41 eğitim kartı**, **18 rozet**, **10 seviye** (her seviye harita parçası ve dükkân eşyası açar).
- **8 mini oyun**: İhtiyaç mı İstek mi (sürükle-bırak / dokun), Akıllı Alışveriş (bütçeli market), Para Üstünü Bul, Hafıza Kartları, Birikim Yolculuğu, Bütçe Dedektifi, Kazanç Atölyesi, Güvenlik Radarı.
- **Sanal cüzdan** (100 sanal TL ile başlar), Kaşif Dükkânı (sabit fiyat, şans kutusu yok), hareket geçmişi.
- **Birikim Laboratuvarı**: hedef oluşturma, animasyonlu kavanoz, ekle/geri al, “kaç haftada” ve “harcarsam ne olur” hesaplayıcıları.
- **Uyarlanabilir öğrenme**: zorlanınca kolay anlatım, Tekrar Köşesi (zorlanılan sorular + benzer üretilmiş sorular), ilk deneme başarısı ile sonradan öğrenme ayrı izlenir.
- **Ebeveyn alanı**: basılı tutma + çarpma sorusu ya da yerel PIN ile korunur (gerçek güvenlik değildir), konu bazında başarı, güçlü yönler, tekrar önerileri, dışa/içe aktarma (kişisel bilgi içermez), sıfırlama, ayarlar.

## Çalıştırma

```bash
npm install
npm run dev        # geliştirme sunucusu
npm test           # birim testleri (içerik + öğrenme motoru)
npm run build      # tip kontrolü + üretim derlemesi (dist/)
npm run preview    # derlenmiş sürümü yerelde aç
```

Node 20+ gerekir.

## Yayınlama (Netlify)

Depo Netlify'a bağlandığında `netlify.toml` kullanılır: derleme komutu `npm run build`, yayın klasörü `dist`. Herhangi bir ortam değişkeni gerekmez. Uygulama göreli yollarla derlendiği için alt klasörde de barındırılabilir.

## PWA olarak kurulum

- **Android (Chrome)**: Uygulama içindeki “Uygulamayı yükle” düğmesi ya da menü (⋮) → *Uygulamayı yükle*.
- **iPhone/iPad (Safari)**: Paylaş → *Ana Ekrana Ekle* → *Ekle*.
- **Masaüstü (Chrome/Edge)**: Adres çubuğundaki yükle simgesi.

İlk açılıştan sonra uygulama çevrimdışı açılır; ilerleme cihazda kalır.

## Kod yapısı

```
src/
  types.ts              Veri modelleri (Module, Lesson, Question, Badge, UserProgress, Wallet, SavingsGoal, Settings…)
  data/                 Tüm eğitim içeriği (modüller, kartlar, rozetler, seviyeler, oyun verileri)
  lib/engine.ts         Tek doğruluk kaynağı: XP, seviye, rozet, cüzdan, birikim, günlük görev, final
  lib/practice.ts       Uyarlanabilir pratik ve soru üreticileri
  lib/storage.ts        Yerel kayıt, bozuk veri temizleme, dışa/içe aktarma
  lib/store.ts          Durum deposu (her değişiklikte rozet/seviye kontrolü ve kayıt)
  components/           Maskot Kumbi (aslan kaşif, SVG), para çizimleri, kavanoz, soru motoru, kutlama penceresi
  screens/              Ekranlar
  games/                Mini oyunlar
```

`npm run icons` PWA ikonlarını yeniden üretir (Playwright/Chromium gerekir).

Yazı tipleri (Fredoka, Nunito) SIL Open Font License ile pakete dahildir.
