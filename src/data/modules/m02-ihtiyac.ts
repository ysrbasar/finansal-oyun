import type { Module } from "../../types";

export const m02: Module = {
  id: "m02",
  order: 2,
  title: "İhtiyaç mı, İstek mi?",
  place: "İhtiyaçlar Ormanı",
  description: "Yaşamak için gerekenlerle canımızın istediklerini ayırt et, öncelik belirle.",
  icon: "🌳",
  color: "#58C78A",
  topic: "ihtiyac",
  lessons: [
    {
      id: "m02-l1",
      moduleId: "m02",
      title: "İhtiyaçlarımız",
      goal: "Yaşamak ve sağlıklı kalmak için gereken temel ihtiyaçları tanıyacağım.",
      story: [
        {
          text: "Kumbi ormanda yürüyüşe çıktı. Yanına su, sağlıklı bir atıştırmalık ve hava soğuk olduğu için montunu aldı.",
          visual: { kind: "emoji", items: ["💧", "🥪", "🧥"], caption: "Yürüyüş çantası" },
        },
        {
          text: "Bunlar ihtiyaç: Su, beslenme, barınma, mevsime uygun giysi ve sağlık, yaşamak ve iyi olmak için gereklidir.",
          visual: { kind: "emoji", items: ["💧", "🍲", "🏠", "🧥", "🩺"] },
        },
      ],
      example: {
        title: "Okul sabahı",
        text: "Sabah okula giderken kahvaltı yapmak, hava yağmurluysa yağmurluk giymek ve dersler için defter almak ihtiyaçtır. Bunlar olmadan gün zorlaşır.",
        visual: { kind: "emoji", items: ["🥣", "🧥", "📒"] },
      },
      easierExample:
        "Kendine şunu sor: \"Bu olmazsa sağlığım ya da günlük hayatım zorlaşır mı?\" Cevabın evetse, büyük ihtimalle bu bir ihtiyaçtır.",
      activities: [
        {
          id: "m02-l1-q1",
          type: "mcq",
          topic: "ihtiyac",
          difficulty: 1,
          prompt: "Aşağıdakilerden hangisi temel bir ihtiyaçtır?",
          choices: [
            { id: "a", text: "İçme suyu", emoji: "💧" },
            { id: "b", text: "Yeni bir oyun konsolu", emoji: "🎮" },
            { id: "c", text: "Parlak bir çıkartma", emoji: "✨" },
          ],
          answer: "a",
          hint: "Hangisi olmadan sağlıklı kalmak zor olur?",
          explanation: "Su, yaşamak için gereklidir. Oyun konsolu ve çıkartma güzel şeylerdir ama yaşamak için şart değildir.",
        },
        {
          id: "m02-l1-q2",
          type: "truefalse",
          topic: "ihtiyac",
          difficulty: 1,
          prompt: "Kışın soğuk bir günde mont giymek bir ihtiyaçtır.",
          answer: true,
          hint: "Soğukta montsuz kalırsak sağlığımıza ne olabilir?",
          explanation: "Mevsime uygun giysi bir ihtiyaçtır. Soğukta mont bizi hastalanmaktan korur.",
        },
        {
          id: "m02-l1-d1",
          type: "decision",
          topic: "ihtiyac",
          difficulty: 2,
          prompt: "Okul çantanın fermuarı tamamen koptu ve kitapların düşüyor. Ailenle konuşurken hangisini önce düşünürsün?",
          visual: { kind: "emoji", items: ["🎒", "💥"] },
          choices: [
            { id: "a", text: "Çantanın tamir edilmesini ya da gerekiyorsa yenisini.", feedback: "Doğru öncelik! Çanta okul için gerekli; önce tamir seçeneğini düşünmek de çok akıllıca." },
            { id: "b", text: "Önce yeni bir oyuncak, çanta sonra.", feedback: "Oyuncak bekleyebilir ama kitapların düşerse okulda zorlanırsın. Önce ihtiyaç gelir." },
            { id: "c", text: "Hiçbir şey yapmam, kitapları elimde taşırım.", feedback: "Bir süre olabilir ama her gün zor olur. Çanta burada gerçek bir ihtiyaç." },
          ],
          accepted: ["a"],
          hint: "Hangisi okula gitmeni doğrudan etkiliyor?",
          explanation: "Okul için gereken bir eşya bozulduğunda onu onarmak ya da yenilemek ihtiyaçtır ve öncelik alır.",
        },
      ],
      review: [
        "İhtiyaçlar yaşamak ve iyi olmak için gereklidir.",
        "Su, beslenme, barınma, mevsime uygun giysi, sağlık ve okul malzemesi ihtiyaçtır.",
        "Bozulan bir ihtiyaç eşyası için önce tamiri düşünmek akıllıcadır.",
      ],
    },
    {
      id: "m02-l2",
      moduleId: "m02",
      title: "İsteklerimiz ve beklemek",
      goal: "İsteklerin güzel ama hemen karşılanmak zorunda olmadığını öğreneceğim.",
      story: [
        {
          text: "Orman pazarında Kumbi parlak, yeni bir uçurtma gördü. \"Çok güzel!\" dedi. Ama evinde zaten bir uçurtması vardı.",
          visual: { kind: "emoji", items: ["🪁", "🏠", "🪁"], caption: "Yeni uçurtma mı, eskisi mi?" },
        },
        {
          text: "Canımızın istediği ama yaşamak için gerekmeyen şeylere istek denir. İstekler kötü değildir; sadece beklemeyi ve seçmeyi öğrenmemiz gerekir.",
        },
      ],
      example: {
        title: "Bekleme kutusu",
        text: "Defne bir şeyi çok istediğinde onu \"bekleme listesine\" yazıyor. Bir hafta sonra hâlâ istiyorsa ailesiyle konuşup biriktirmeye başlıyor. Bazen bir hafta sonra o isteği unuttuğunu fark ediyor!",
        visual: { kind: "emoji", items: ["📝", "⏳", "🤔"] },
      },
      easierExample:
        "İstek, \"Olsa çok güzel olur\" dediğimiz şeydir. İhtiyaç ise \"Olmazsa zorlanırım\" dediğimiz şeydir. İstekler için beklemek çoğu zaman sorun olmaz.",
      activities: [
        {
          id: "m02-l2-q1",
          type: "mcq",
          topic: "ihtiyac",
          difficulty: 1,
          prompt: "Evinde zaten çalışan bir oyuncak araban varken, aynısının kırmızı rengini istemek nedir?",
          choices: [
            { id: "a", text: "İstek", emoji: "💭" },
            { id: "b", text: "İhtiyaç", emoji: "🧰" },
            { id: "c", text: "Takas", emoji: "⇄" },
          ],
          answer: "a",
          hint: "Zaten bir araban var. Yenisi olmazsa günlük hayatın zorlaşır mı?",
          explanation: "Benzerine zaten sahipken yenisini istemek bir istektir. İstemek normaldir, ama acil değildir.",
        },
        {
          id: "m02-l2-q2",
          type: "truefalse",
          topic: "ihtiyac",
          difficulty: 1,
          prompt: "Her isteğimizin hemen o gün karşılanması gerekir.",
          answer: false,
          hint: "Defne'nin bekleme listesini hatırla. Bir hafta beklemek ona ne kazandırdı?",
          explanation: "İstekler bekleyebilir. Beklemek, gerçekten isteyip istemediğimizi anlamamıza yardım eder.",
        },
        {
          id: "m02-l2-d1",
          type: "decision",
          topic: "ihtiyac",
          difficulty: 2,
          prompt: "Markette rengârenk bir şeker kutusu gördün ve çok istedin. Ama bu hafta için biriktirdiğin bir hedefin var. Ne yaparsın?",
          visual: { kind: "emoji", items: ["🍬", "🫙"] },
          choices: [
            { id: "a", text: "Şekeri bekleme listeme yazar, hedefime odaklanırım.", feedback: "Harika bir sabır örneği! İsteğini unutmadın, sadece sıraya koydun." },
            { id: "b", text: "Küçük bir paket alır, kalanını biriktiririm.", feedback: "Dengeli bir seçim! Küçük bir keyif ile hedefini birlikte düşündün." },
            { id: "c", text: "Bütün paramı şekerlere harcarım.", feedback: "O an güzel olabilir ama hedefin için hiç para kalmaz. Hedefini de düşünmeyi dene." },
          ],
          accepted: ["a", "b"],
          hint: "Paranın tamamını harcarsan hedefin için ne kalır?",
          explanation: "İstekleri tamamen yasaklamak gerekmez. Önemli olan hedeflerimizi de düşünerek karar vermektir.",
        },
      ],
      review: [
        "İstek, olsa güzel olan ama yaşamak için gerekmeyen şeydir.",
        "İstekler bekleyebilir; beklemek iyi karar vermeye yardım eder.",
        "İsteklerle hedefler arasında denge kurabiliriz.",
      ],
    },
    {
      id: "m02-l3",
      moduleId: "m02",
      title: "Duruma göre değişir: Öncelik",
      goal: "Bir şeyin ihtiyaç mı istek mi olduğunun duruma göre değişebileceğini ve öncelik belirlemeyi öğreneceğim.",
      story: [
        {
          text: "Kumbi'nin iki arkadaşı var. Elif'in ayakkabıları küçülmüş, ayağını sıkıyor. Bora'nın ayakkabıları ise yeni ama o başka bir model istiyor.",
          visual: { kind: "emoji", items: ["👟", "😣", "👟", "😊"] },
        },
        {
          text: "Aynı şey, yeni ayakkabı, Elif için ihtiyaç, Bora için istek! Bir şeyin ne olduğu kişiye ve duruma göre değişebilir.",
        },
      ],
      example: {
        title: "Elinde sınırlı para var",
        text: "Selin'in 50 TL'si var. Kırtasiye listesinde defter (ihtiyaç) ve süslü bir kalemlik (istek) var. Önce defteri alıyor, kalan parası yeterse kalemliği düşünüyor. Buna öncelik belirlemek denir.",
        visual: { kind: "price", items: [{ emoji: "📒", name: "Defter", price: 20 }, { emoji: "🖊️", name: "Süslü kalemlik", price: 40 }] },
      },
      easierExample:
        "Öncelik, \"Önce hangisi?\" sorusunun cevabıdır. Para sınırlıysa önce ihtiyaçları, sonra istekleri sıraya koyarız. Acil olan ihtiyaçlar ise en başa gelir.",
      activities: [
        {
          id: "m02-l3-q1",
          type: "mcq",
          topic: "ihtiyac",
          difficulty: 2,
          prompt: "Elif'in ayakkabıları küçülmüş ve ayağını sıkıyor. Yeni ayakkabı Elif için nedir?",
          choices: [
            { id: "a", text: "İhtiyaç" },
            { id: "b", text: "İstek" },
            { id: "c", text: "Hiçbiri" },
          ],
          answer: "a",
          hint: "Ayakkabı ayağını sıkarsa yürümek ve sağlıklı kalmak kolay olur mu?",
          explanation: "Küçülen ayakkabı ayağa zarar verebilir. Bu durumda yeni ayakkabı Elif için bir ihtiyaçtır.",
        },
        {
          id: "m02-l3-q2",
          type: "match",
          topic: "ihtiyac",
          difficulty: 2,
          prompt: "Her durumu doğru açıklamayla eşleştir.",
          pairs: [
            { left: "Susadım, su içmeliyim", right: "Acil ihtiyaç" },
            { left: "Kalemim bitmek üzere", right: "Yakında gerekecek ihtiyaç" },
            { left: "Yeni çıkan çıkartma seti", right: "Bekleyebilecek istek" },
          ],
          hint: "Hangisi şimdi, hangisi yakında, hangisi beklese de olur?",
          explanation: "Susuzluk hemen giderilmeli. Biten kalem yakında gerekir. Çıkartma seti ise bekleyebilir.",
        },
        {
          id: "m02-l3-d1",
          type: "decision",
          topic: "ihtiyac",
          difficulty: 3,
          prompt: "Bisikletin tekerleği patladı ve her gün parka bisikletle gidiyorsun. Bir de yeni bir zil istiyorsun. Paran ikisine birden yetmiyor. Hangisini seçersin?",
          visual: { kind: "emoji", items: ["🚲", "💥", "🔔"] },
          choices: [
            { id: "a", text: "Önce lastik tamiri, zil sonraya.", feedback: "Çok iyi öncelik! Tekerlek olmadan bisiklet kullanılamaz, zil ise bekleyebilir." },
            { id: "b", text: "Önce zil, tekerlek sonra.", feedback: "Zil güzel ama patlak tekerlekle bisiklete binemezsin. Önce çalışmasını sağlayan parçayı düşün." },
            { id: "c", text: "Bir süre yürüyerek giderim, ikisine birden biriktiririm.", feedback: "Bu da düşünülmüş bir plan! Beklemeyi göze alıp ikisi için birikim yapıyorsun." },
          ],
          accepted: ["a", "c"],
          hint: "Hangisi olmadan bisiklet hiç kullanılamaz?",
          explanation: "Öncelik belirlerken, eşyanın çalışması için gereken şeyi öne alırız. Birikim yapıp beklemek de geçerli bir plandır.",
        },
      ],
      review: [
        "Aynı şey bir kişi için ihtiyaç, başkası için istek olabilir.",
        "Para sınırlıysa önce ihtiyaçlar gelir.",
        "Bazı ihtiyaçlar acildir, bazıları biraz bekleyebilir.",
      ],
    },
  ],
};
