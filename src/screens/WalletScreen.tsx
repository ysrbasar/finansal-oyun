import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useState } from "react";
import { SHOP_ITEMS } from "../data/shop";
import { update, useAppState } from "../lib/store";
import { buyShopItem, equipItem, levelForXp } from "../lib/engine";
import { AvatarBadge, PageHeader, SimNote } from "../components/ui";
import { Banknote } from "../components/Money";
import { play } from "../lib/sound";

const KIND_LABEL = { kazanc: "Kazanç", harcama: "Harcama", birikim: "Kavanoza", "geri-alma": "Geri alındı", baslangic: "Başlangıç" } as const;

export function WalletScreen() {
  const s = useAppState();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const level = levelForXp(s.xp).level;
  const tx = s.wallet.transactions;
  const sum = (k: string) => tx.filter((t) => t.kind === k).reduce((a, t) => a + Math.abs(t.amount), 0);
  const savedNow = s.goals.filter((g) => !g.completedAt).reduce((a, g) => a + g.saved, 0);

  const buy = (id: string) => {
    let err: string | null = null;
    update((st) => {
      const [n, e] = buyShopItem(st, id);
      err = e;
      return n;
    });
    const item = SHOP_ITEMS.find((i) => i.id === id)!;
    if (err) {
      play("ipucu");
      setMsg({ ok: false, text: err });
    } else {
      play("para");
      setMsg({ ok: true, text: `${item.emoji} ${item.name} senin! Cüzdandan ${item.price} sanal TL çıktı.` });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Sanal Cüzdan" subtitle="Harca, biriktir, sonuçlarını karşılaştır" back="/" />
      <section className="relative overflow-hidden rounded-[2rem] bg-navy p-5 text-white shadow-[var(--shadow-lift)]">
        <div className="absolute -right-4 -top-2 rotate-12 opacity-90" aria-hidden>
          <Banknote value={100} width={130} />
        </div>
        <p className="text-sm font-bold text-sun">Bakiye (sanal)</p>
        <p className="font-display text-5xl font-bold">{s.wallet.balance} TL</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
          <div className="rounded-xl bg-white/10 p-2">
            Kazanılan
            <p className="font-display text-lg">{sum("kazanc")} TL</p>
          </div>
          <div className="rounded-xl bg-white/10 p-2">
            Harcanan
            <p className="font-display text-lg">{sum("harcama")} TL</p>
          </div>
          <div className="rounded-xl bg-white/10 p-2">
            Kavanozlarda
            <p className="font-display text-lg">{savedNow} TL</p>
          </div>
        </div>
      </section>
      <SimNote>Sanal TL bir eğitim simülasyonudur, gerçek para değildir ve gerçek parayla alınamaz. XP ise öğrenme puanıdır; harcanmaz.</SimNote>

      <section>
        <h2 className="text-2xl font-bold">🏪 Kaşif Dükkânı</h2>
        <p className="text-sm font-semibold text-ink-muted">Sabit fiyatlı eşyalar. Sürpriz kutu yok; ne aldığını hep bilirsin. Almadan önce bir düşün: Bu para birikim hedefine de gidebilir!</p>
        {msg && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mt-2 rounded-xl p-2 text-sm font-semibold ${msg.ok ? "bg-success/20" : "bg-sun/40"}`} role="status">
            {msg.text}
          </motion.p>
        )}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SHOP_ITEMS.map((it) => {
            const owned = s.shopOwned.includes(it.id);
            const locked = level < it.minLevel;
            const equipped = it.kind === "kavanoz" ? s.profile?.jarSkin === it.id : s.profile?.accessory === it.id;
            return (
              <div key={it.id} className={`flex flex-col items-center rounded-3xl p-3 text-center ${locked ? "bg-navy/5" : "bg-white shadow-[var(--shadow-soft)]"}`}>
                <span className={`text-4xl ${locked ? "opacity-40 grayscale" : ""}`} aria-hidden>
                  {it.emoji}
                </span>
                <p className="font-display font-bold leading-tight">{it.name}</p>
                <p className="text-[11px] font-semibold text-ink-muted">{it.description}</p>
                {locked ? (
                  <p className="mt-2 flex items-center gap-1 text-xs font-bold text-ink-muted">
                    <Lock size={14} /> Seviye {it.minLevel}
                  </p>
                ) : owned ? (
                  <button
                    className={`mt-2 w-full rounded-xl py-2 text-sm font-bold ${equipped ? "bg-success/30" : "bg-sky"}`}
                    onClick={() => update((st) => equipItem(st, equipped ? undefined : it.id, it.kind))}
                  >
                    {equipped ? "Kullanılıyor ✓" : "Kullan"}
                  </button>
                ) : (
                  <button className="btn-sun mt-2 min-h-10 w-full py-1.5 text-base" onClick={() => buy(it.id)}>
                    {it.price} TL
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
          <AvatarBadge profile={s.profile} size={52} />
          <p className="text-sm font-semibold">Avatarın böyle görünüyor. Aksesuarlar haritada ve ana sayfada da görünür.</p>
        </div>
      </section>

      <section className="card p-4">
        <h2 className="font-display text-xl font-bold">Hareket geçmişi</h2>
        <ul className="mt-2 divide-y divide-navy/5">
          {tx.slice(0, 40).map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-2">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm ${t.amount >= 0 ? "bg-success/20" : "bg-coral/15"}`} aria-hidden>
                {t.kind === "birikim" ? "🫙" : t.amount >= 0 ? "⬇️" : "⬆️"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{t.label}</p>
                <p className="text-[11px] font-semibold text-ink-muted">
                  {KIND_LABEL[t.kind]} · {new Date(t.at).toLocaleDateString("tr-TR")}
                </p>
              </div>
              <span className={`font-display font-bold ${t.amount >= 0 ? "text-success-dark" : "text-coral-dark"}`}>
                {t.amount >= 0 ? "+" : ""}
                {t.amount} TL
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
