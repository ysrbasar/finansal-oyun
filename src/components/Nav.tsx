import { Gamepad2, Home, Map, PiggyBank, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { navigate } from "../lib/router";
import { useAppState } from "../lib/store";
import { unseenBadgeCount } from "../lib/engine";
import { Mascot } from "./Mascot";

const ITEMS = [
  { to: "/", match: ["", "ana"], label: "Ana Sayfa", Icon: Home },
  { to: "/kesif", match: ["kesif"], label: "Keşfet", Icon: Map },
  { to: "/oyunlar", match: ["oyunlar"], label: "Oyunlar", Icon: Gamepad2 },
  { to: "/birikim", match: ["birikim", "cuzdan"], label: "Birikim", Icon: PiggyBank },
  { to: "/koleksiyon", match: ["koleksiyon"], label: "Koleksiyon", Icon: Trophy },
];

export function BottomNav({ section }: { section: string }) {
  const s = useAppState();
  const unseen = unseenBadgeCount(s);
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-navy/5 bg-white/95 backdrop-blur md:hidden" aria-label="Ana gezinme">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {ITEMS.map(({ to, match, label, Icon }) => {
          const active = match.includes(section);
          return (
            <li key={to}>
              <button
                className="relative flex w-full flex-col items-center gap-0.5 pb-1 pt-2 text-[11px] font-bold"
                onClick={() => navigate(to)}
                aria-current={active ? "page" : undefined}
              >
                {active && <motion.span layoutId="navpill" className="absolute top-1 h-9 w-14 rounded-2xl bg-turq/20" />}
                <Icon size={24} className={`relative ${active ? "text-navy" : "text-ink-muted"}`} strokeWidth={active ? 2.6 : 2} />
                <span className={`relative ${active ? "text-navy" : "text-ink-muted"}`}>{label}</span>
                {to === "/koleksiyon" && unseen > 0 && (
                  <span className="absolute right-3 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1 text-[10px] text-white" aria-label={`${unseen} yeni rozet`}>
                    {unseen}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SideNav({ section }: { section: string }) {
  const s = useAppState();
  const unseen = unseenBadgeCount(s);
  return (
    <nav className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-2 border-r border-navy/5 bg-white/70 p-4 md:flex" aria-label="Ana gezinme">
      <button className="mb-4 flex items-center gap-2 text-left" onClick={() => navigate("/")}>
        <Mascot mood="merhaba" size={52} animate={false} />
        <span className="font-display text-lg font-bold leading-tight">
          Minik Finans
          <br />
          Kaşifleri
        </span>
      </button>
      {ITEMS.map(({ to, match, label, Icon }) => {
        const active = match.includes(section);
        return (
          <button
            key={to}
            onClick={() => navigate(to)}
            aria-current={active ? "page" : undefined}
            className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 font-display text-lg font-semibold ${active ? "bg-turq/20" : "hover:bg-sky"}`}
          >
            <Icon size={22} />
            {label}
            {to === "/koleksiyon" && unseen > 0 && <span className="ml-auto rounded-full bg-coral px-2 text-xs text-white">{unseen} yeni</span>}
          </button>
        );
      })}
      <div className="mt-auto flex flex-col gap-1 text-sm font-bold text-ink-muted">
        <button className="rounded-xl px-4 py-2 text-left hover:bg-sky" onClick={() => navigate("/ayarlar")}>
          ⚙️ Ayarlar ve kurulum
        </button>
        <button className="rounded-xl px-4 py-2 text-left hover:bg-sky" onClick={() => navigate("/ebeveyn")}>
          👪 Ebeveyn alanı
        </button>
      </div>
    </nav>
  );
}
