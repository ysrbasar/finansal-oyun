import type { Module } from "../../types";

export const m04: Module = {
  id: "m04",
  order: 4,
  title: "Bütçe Kurma",
  place: "Bütçe Köprüsü",
  description: "Gelir ve harcamayı tanı, plan yap, bütçe sınırını aşmadan alışveriş listesi kur.",
  icon: "🌉",
  color: "#7AA7FF",
  topic: "butce",
  lessons: [
    {
      id: "m04-l1",
      moduleId: "m04",
      title: "Bütçe nedir?",
      goal: "Bütçenin, paramı nasıl kullanacağımı önceden gösteren bir plan olduğunu öğreneceğim.",
      story: [
        {
          text: "Bütçe Köprüsü'nü geçmek isteyen herkes bir plan çizmek zorunda. Köprü bekçisi soruyor: \"Ne kadar paran var, neye harcayacaksın?\"",
          visual: { kind: "emoji", items: ["🌉", "📋", "🪙"] },
        },
        {
          text: "Bütçe, elimize gelen parayı (gelir) ve harcayacağımız parayı (harcama) önceden planlamaktır. Gelen para giden paradan az olmamalı.",
          visual: { kind: "emoji", items: ["⬇️ Gelir", "⬆️ Harcama"] },
        },
      ],
      example: {
        title: "Kumbi'nin haftalık planı",
        text: "Kumbi'ye bu hafta 60 sanal TL geldi (gelir). Planı: 30 TL kırtasiye, 10 TL atıştırmalık, 20 TL birikim. 30 + 10 + 20 = 60. Gelir ile plan eşit, harika bir bütçe!",
        visual: { kind: "money", values: [50, 10] },
      },
      easierExample:
        "Bütçe bir alışveriş haritası gibidir. Yola çıkmadan önce paranın nereye gideceğini çizersin. Böylece yolda paran bitip şaşırmazsın.",
      activities: [
        {
          id: "m04-l1-q1",
          type: "match",
          topic: "butce",
          difficulty: 1,
          prompt: "Kavramları açıklamalarıyla eşleştir.",
          pairs: [
            { left: "Gelir", right: "Elimize gelen para" },
            { left: "Harcama", right: "Bir şey alınca giden para" },
            { left: "Bütçe", right: "Paranın nasıl kullanılacağının planı" },
          ],
          hint: "Gelir gelir, harcama gider. Plan hangisiydi?",
          explanation: "Gelir gelen para, harcama giden para, bütçe ise ikisini önceden düşündüğümüz plandır.",
        },
        {
          id: "m04-l1-q2",
          type: "numeric",
          topic: "butce",
          difficulty: 2,
          prompt: "Kumbi'nin geliri 60 TL. 30 TL kırtasiye ve 10 TL atıştırmalık planladı. Birikime kaç TL kalır?",
          answer: 20,
          unit: "TL",
          hint: "Önce harcamaları topla: 30 + 10. Sonra 60'tan çıkar.",
          explanation: "30 + 10 = 40 TL harcama. 60 - 40 = 20 TL birikime kalır.",
        },
        {
          id: "m04-l1-d1",
          type: "decision",
          topic: "butce",
          difficulty: 2,
          prompt: "Sana bayramda 100 sanal TL hediye geldi. İlk ne yaparsın?",
          visual: { kind: "money", values: [100] },
          choices: [
            { id: "a", text: "Paramı neye ayıracağımı yazdığım küçük bir plan yaparım.", feedback: "İşte bütçe budur! Önce plan, sonra harcama." },
            { id: "b", text: "Aklıma gelen ilk şeye hemen harcarım.", feedback: "Hemen harcarsak daha önemli bir şey için para kalmayabilir. Kısa bir plan yardımcı olur." },
            { id: "c", text: "Bir kısmını biriktirmeye, bir kısmını harcamaya ayırırım.", feedback: "Çok güzel! Birikim ve harcamayı dengelemek iyi bir bütçe kararıdır." },
          ],
          accepted: ["a", "c"],
          hint: "Köprü bekçisinin sorusu neydi? \"Neye harcayacaksın?\"",
          explanation: "Parayı kullanmadan önce kısa bir plan yapmak, bütçe kurmanın ilk adımıdır.",
        },
      ],
      review: [
        "Gelir gelen para, harcama giden paradır.",
        "Bütçe, paranın nasıl kullanılacağının planıdır.",
        "Harcamalar gelirden fazla olmamalıdır.",
      ],
    },
    {
      id: "m04-l2",
      moduleId: "m04",
      title: "Harcama planı ve bütçe sınırı",
      goal: "Bütçe sınırını aşmadan alışveriş listesi hazırlamayı öğreneceğim.",
      story: [
        {
          text: "Kumbi'nin piknik için 100 sanal TL'si var. Listede ekmek 15 TL, peynir 40 TL, meyve 30 TL, meyve suyu 20 TL, top 45 TL var.",
          visual: {
            kind: "price",
            items: [
              { emoji: "🍞", name: "Ekmek", price: 15 },
              { emoji: "🧀", name: "Peynir", price: 40 },
              { emoji: "🍇", name: "Meyve", price: 30 },
              { emoji: "🧃", name: "Meyve suyu", price: 20 },
              { emoji: "⚽", name: "Top", price: 45 },
            ],
          },
        },
        {
          text: "Hepsini alırsa 150 TL eder, bütçeyi aşar! Bütçe sınırı, harcayabileceğimiz en çok paradır. Önce öncelikleri seçmeli.",
        },
      ],
      example: {
        title: "Birden fazla doğru plan var",
        text: "Plan 1: Ekmek + peynir + meyve = 85 TL, 15 TL kalır. Plan 2: Ekmek + meyve + meyve suyu = 65 TL, 35 TL kalır. İkisi de bütçe sınırının içinde!",
      },
      easierExample:
        "Sepete her ürün eklediğinde toplamı yeniden say. Toplam bütçe sınırına ulaşınca dur. Sınırı geçecek ürünü sepete koyma.",
      activities: [
        {
          id: "m04-l2-q1",
          type: "mcq",
          topic: "butce",
          difficulty: 2,
          prompt: "100 TL bütçeyle hangi liste sınırı AŞAR?",
          choices: [
            { id: "a", text: "Peynir 40 + top 45 + meyve suyu 20" },
            { id: "b", text: "Ekmek 15 + peynir 40 + meyve 30" },
            { id: "c", text: "Ekmek 15 + meyve 30 + top 45" },
          ],
          answer: "a",
          hint: "Her listeyi topla: Hangisi 100'den büyük çıkıyor?",
          explanation: "40 + 45 + 20 = 105 TL, 100 TL'yi aşar. Diğerleri 85 TL ve 90 TL, sınırın içinde.",
        },
        {
          id: "m04-l2-q2",
          type: "truefalse",
          topic: "butce",
          difficulty: 1,
          prompt: "Bir bütçe için yalnızca tek bir doğru alışveriş listesi vardır.",
          answer: false,
          hint: "Kumbi'nin Plan 1 ve Plan 2'sini hatırla.",
          explanation: "Bütçeye uyan birçok farklı plan olabilir. Önemli olan sınırı aşmamak ve önceliklere uymaktır.",
        },
        {
          id: "m04-l2-d1",
          type: "decision",
          topic: "butce",
          difficulty: 3,
          prompt: "Piknik bütçen 100 TL ve sepetinde ekmek (15), peynir (40), meyve (30) var: 85 TL. Bir de 45 TL'lik top istiyorsun. Ne yaparsın?",
          visual: { kind: "price", items: [{ emoji: "🧺", name: "Sepet", price: 85 }, { emoji: "⚽", name: "Top", price: 45 }] },
          choices: [
            { id: "a", text: "Topu eklemem; 15 TL kalır, sınırı aşmam.", feedback: "Bütçe sınırını korudun! 85 + 45 = 130 TL olacaktı." },
            { id: "b", text: "Peyniri çıkarıp topu eklerim: 15 + 30 + 45 = 90 TL.", feedback: "Yaratıcı bir yeniden planlama! Sınırın içinde kaldın; yemeğin yeterli olup olmadığını da düşün." },
            { id: "c", text: "Topu da eklerim, nasılsa bir şey olmaz.", feedback: "85 + 45 = 130 TL olur, bu 100 TL'lik bütçeyi 30 TL aşar." },
          ],
          accepted: ["a", "b"],
          hint: "85 + 45 kaç eder? 100'ü geçiyor mu?",
          explanation: "Sınırı aşacaksak ya o ürünü almayız ya da listeden başka bir şeyi çıkarırız.",
        },
      ],
      review: [
        "Bütçe sınırı, harcayabileceğimiz en çok paradır.",
        "Bir bütçeye uyan birden fazla doğru plan olabilir.",
        "Sınır aşılacaksa listeyi yeniden düzenleriz.",
      ],
    },
    {
      id: "m04-l3",
      moduleId: "m04",
      title: "Plan ile gerçek harcamayı karşılaştır",
      goal: "Planladığım harcama ile gerçekte yaptığım harcamayı karşılaştırmayı öğreneceğim.",
      story: [
        {
          text: "Kumbi pazara 50 TL'lik bir planla gitti: 20 TL meyve, 20 TL sebze, 10 TL ekmek. Ama pazarda sebze 25 TL'ydi!",
          visual: { kind: "emoji", items: ["📋 Plan: 50", "🛒 Gerçek: 55"] },
        },
        {
          text: "Plan ile gerçek her zaman aynı olmayabilir. Farkı fark edip planı yeniden düzenlemek iyi bir bütçe alışkanlığıdır.",
        },
      ],
      example: {
        title: "Fark nereden çıktı?",
        text: "Plan: 20 + 20 + 10 = 50 TL. Gerçek: 20 + 25 + 10 = 55 TL. Fark 5 TL. Kumbi meyveyi biraz azaltarak 15 TL'ye düşürdü ve yine 50 TL'de kaldı.",
      },
      easierExample:
        "Plan, yola çıkmadan çizdiğin harita. Yolda bir köprü kapalıysa yeni bir yol bulursun. Harcamada da fiyat değişirse planını değiştirirsin.",
      activities: [
        {
          id: "m04-l3-q1",
          type: "numeric",
          topic: "butce",
          difficulty: 2,
          prompt: "Plan 50 TL'ydi, gerçekte 55 TL harcandı. Plan kaç TL aşıldı?",
          answer: 5,
          unit: "TL",
          hint: "Gerçek harcamadan planı çıkar: 55 - 50.",
          explanation: "55 - 50 = 5 TL. Plan 5 TL aşılmış.",
        },
        {
          id: "m04-l3-q2",
          type: "mcq",
          topic: "butce",
          difficulty: 2,
          prompt: "Pazarda bir ürün planladığından pahalı çıktı. En iyi davranış hangisi?",
          choices: [
            { id: "a", text: "Planı yeniden düzenlemek ve başka bir kalemden kısmak" },
            { id: "b", text: "Planı unutup istediğim kadar harcamak" },
            { id: "c", text: "Hiçbir şey almadan eve dönmek zorunda kalmak" },
          ],
          answer: "a",
          hint: "Kumbi sebze pahalı çıkınca meyveyi nasıl değiştirdi?",
          explanation: "Planlar esnek olabilir. Bir kalem pahalı çıkarsa başka bir kalemi azaltarak bütçede kalabiliriz.",
        },
        {
          id: "m04-l3-d1",
          type: "decision",
          topic: "butce",
          difficulty: 2,
          prompt: "Hafta sonu harcamalarını yazdın ve planından 10 TL fazla harcadığını gördün. Gelecek hafta ne yaparsın?",
          visual: { kind: "emoji", items: ["📋", "➕10", "🔁"] },
          choices: [
            { id: "a", text: "Nereye fazla harcadığımı bulup o kalemi azaltırım.", feedback: "Bir bütçe dedektifi gibi düşündün! Sorunu bulup çözüm ürettin." },
            { id: "b", text: "Planı daha gerçekçi yaparım; o kaleme biraz daha pay ayırırım.", feedback: "Bu da çok olgun bir karar! Bazen plan, gerçek ihtiyaca göre güncellenmelidir." },
            { id: "c", text: "Bir daha hiç plan yapmam.", feedback: "Plan aşıldı diye vazgeçmek gerekmez. Plan yapmak hatayı fark etmeni sağladı!" },
          ],
          accepted: ["a", "b"],
          hint: "Plan sayesinde neyi fark ettin? Bu bilgiyi nasıl kullanabilirsin?",
          explanation: "Plan ile gerçeği karşılaştırmak öğrenmemizi sağlar. Ya harcamayı azaltırız ya da planı gerçekçi hâle getiririz.",
        },
      ],
      review: [
        "Plan ile gerçek harcama farklı olabilir.",
        "Farkı bulmak için gerçek harcamadan planı çıkarırız.",
        "Planı yeniden düzenlemek iyi bir bütçe alışkanlığıdır.",
      ],
    },
  ],
};
