import { update, useAppState } from "../lib/store";
import { AVATARS } from "../data/avatars";
import { navigate } from "../lib/router";
import { InstallCard } from "../components/InstallCard";
import { AvatarBadge, PageHeader } from "../components/ui";
import { MascotSays } from "../components/Mascot";

export function SettingsScreen() {
  const s = useAppState();
  const set = (patch: Partial<typeof s.settings>) => update((st) => ({ ...st, settings: { ...st.settings, ...patch } }));
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Ayarlar" back="/" />
      <section className="card p-4">
        <h2 className="font-display text-lg font-bold">Kaşifim</h2>
        <div className="mt-2 flex items-center gap-3">
          <AvatarBadge profile={s.profile} size={60} />
          <input
            value={s.profile?.nickname ?? ""}
            onChange={(e) => update((st) => (st.profile ? { ...st, profile: { ...st.profile, nickname: e.target.value.slice(0, 20) } } : st))}
            placeholder="Takma ad (isteğe bağlı)"
            className="h-12 min-w-0 flex-1 rounded-2xl border-[3px] border-navy/10 px-3 font-bold outline-none focus:border-turq"
            aria-label="Takma ad"
            maxLength={20}
          />
        </div>
        <div className="mt-3 grid grid-cols-8 gap-1.5" role="radiogroup" aria-label="Avatar">
          {AVATARS.map((a) => (
            <button
              key={a.id}
              role="radio"
              aria-checked={s.profile?.avatarId === a.id}
              aria-label={a.name}
              onClick={() => update((st) => (st.profile ? { ...st, profile: { ...st.profile, avatarId: a.id } } : st))}
              className={`grid aspect-square place-items-center rounded-xl text-2xl ${s.profile?.avatarId === a.id ? "ring-4 ring-navy" : ""}`}
              style={{ background: a.color }}
            >
              {a.emoji}
            </button>
          ))}
        </div>
      </section>
      <section className="card flex flex-col gap-3 p-4">
        <label className="flex min-h-12 items-center justify-between font-bold">
          🔊 Sesler
          <input type="checkbox" className="h-7 w-7 accent-[#35C9B1]" checked={s.settings.sound} onChange={(e) => set({ sound: e.target.checked })} />
        </label>
        <label className="flex min-h-12 items-center justify-between font-bold">
          ✨ Daha az hareket
          <input type="checkbox" className="h-7 w-7 accent-[#35C9B1]" checked={s.settings.motion === "kapali"} onChange={(e) => set({ motion: e.target.checked ? "kapali" : "sistem" })} />
        </label>
      </section>
      <InstallCard />
      <button className="card flex items-center gap-3 p-4 text-left font-bold" onClick={() => navigate("/ebeveyn")}>
        <span className="text-2xl" aria-hidden>
          👪
        </span>
        Ebeveyn alanı (yetişkinler için)
      </button>
      <MascotSays mood="merhaba" tone="sky" size={60}>
        İlerlemen bu cihazda saklanır. İnternet olmasa da kaşifliğe devam edebilirsin!
      </MascotSays>
    </div>
  );
}
