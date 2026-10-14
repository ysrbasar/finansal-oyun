import { motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import type { ReactNode } from "react";
import type { Visual } from "../types";
import { MoneyRow } from "./Money";
import { Jar } from "./Jar";
import { goBack } from "../lib/router";
import { getAvatar } from "../data/avatars";
import { getShopItem } from "../data/shop";
import type { Profile } from "../types";

export function ProgressBar({
  value,
  color = "var(--color-turq)",
  height = 12,
  label,
  track = "rgb(25 39 68 / 0.08)",
}: {
  value: number;
  color?: string;
  height?: number;
  label?: string;
  track?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className="w-full overflow-hidden rounded-full"
      style={{ height, background: track }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
      aria-label={label}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${v}%` }}
        transition={{ type: "spring", stiffness: 80, damping: 18 }}
      />
    </div>
  );
}

export function ProgressRing({ value, size = 64, stroke = 8, color = "var(--color-turq)", children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgb(25 39 68 / 0.1)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (v / 100) * c }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export function VisualView({ visual, compact = false }: { visual: Visual; compact?: boolean }) {
  return (
    <figure className={`rounded-2xl bg-sky/70 ${compact ? "p-3" : "p-4"}`}>
      {visual.kind === "emoji" && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-center">
          {visual.items.map((it, i) => (
            <span key={i} className={`font-display font-semibold ${it.length <= 2 ? "text-4xl" : "rounded-xl bg-white px-2 py-1 text-xl shadow-sm"}`}>
              {it}
            </span>
          ))}
        </div>
      )}
      {visual.kind === "money" && <MoneyRow values={visual.values} scale={compact ? 0.8 : 1} />}
      {visual.kind === "price" && (
        <div className="flex flex-wrap justify-center gap-2">
          {visual.items.map((it, i) => (
            <div key={i} className="flex min-w-24 flex-col items-center rounded-2xl bg-white px-3 py-2 shadow-sm">
              <span className="text-3xl" aria-hidden>
                {it.emoji}
              </span>
              <span className="text-xs font-bold text-ink-muted">{it.name}</span>
              <span className="mt-1 rounded-lg bg-sun px-2 font-display text-base font-bold">{it.price} TL</span>
            </div>
          ))}
        </div>
      )}
      {visual.kind === "jar" && (
        <div className="flex items-center justify-center gap-4">
          <Jar saved={visual.saved} target={visual.target} size={compact ? 70 : 90} />
          <div className="text-sm font-bold">
            <div>Hedef: {visual.target} TL</div>
            <div className="text-turq-dark">Birikim: {visual.saved} TL</div>
          </div>
        </div>
      )}
      {visual.caption && <figcaption className="mt-2 text-center text-xs font-semibold text-ink-muted">{visual.caption}</figcaption>}
    </figure>
  );
}

export function AvatarBadge({ profile, size = 56, ring = true }: { profile: Profile | null; size?: number; ring?: boolean }) {
  const a = getAvatar(profile?.avatarId);
  const acc = getShopItem(profile?.accessory);
  return (
    <div
      className={`relative grid shrink-0 place-items-center rounded-full ${ring ? "ring-4 ring-white" : ""} shadow-[var(--shadow-soft)]`}
      style={{ width: size, height: size, background: a.color }}
      aria-label={`${a.name} avatarı`}
      role="img"
    >
      <span style={{ fontSize: size * 0.55 }} aria-hidden>
        {a.emoji}
      </span>
      {acc && (
        <span className="absolute -right-1 -top-2" style={{ fontSize: size * 0.38 }} aria-hidden>
          {acc.emoji}
        </span>
      )}
    </div>
  );
}

export function BadgeMedal({ icon, color, earned, size = 72 }: { icon: string; color: string; earned: boolean; size?: number }) {
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className={earned ? "" : "opacity-40 grayscale"}>
        <path d="M30 70 L22 98 L38 90 L46 100 L50 72 Z" fill="#FF7A70" />
        <path d="M70 70 L78 98 L62 90 L54 100 L50 72 Z" fill="#FF7A70" />
        <circle cx="50" cy="46" r="40" fill={color} />
        <circle cx="50" cy="46" r="40" fill="url(#medalShine)" />
        <circle cx="50" cy="46" r="31" fill="#fff" opacity="0.92" />
        <defs>
          <radialGradient id="medalShine" cx="0.3" cy="0.25" r="0.8">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      <span className={`absolute ${earned ? "" : "opacity-40 grayscale"}`} style={{ fontSize: size * 0.34, marginTop: -size * 0.09 }} aria-hidden>
        {earned ? icon : "🔒"}
      </span>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  back,
  close,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  close?: string;
  right?: ReactNode;
}) {
  return (
    <header className="mb-4 flex items-center gap-3">
      {back && (
        <button className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white shadow-[var(--shadow-soft)]" onClick={() => goBack(back)} aria-label="Geri dön">
          <ArrowLeft size={22} />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="text-sm font-semibold text-ink-muted">{subtitle}</p>}
      </div>
      {right}
      {close && (
        <button className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white shadow-[var(--shadow-soft)]" onClick={() => goBack(close)} aria-label="Kapat">
          <X size={22} />
        </button>
      )}
    </header>
  );
}

export function SimNote({ children = "Bu tutarlar eğitim amaçlı sanal paradır; gerçek para değildir." }: { children?: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-xl bg-sky px-3 py-2 text-xs font-semibold text-navy-soft">
      <span aria-hidden>ℹ️</span>
      <span>{children}</span>
    </p>
  );
}

export function StatChip({ icon, value, label, tone }: { icon: ReactNode; value: ReactNode; label: string; tone: "sun" | "turq" | "coral" | "sky" }) {
  const tones = {
    sun: "bg-sun/50 text-navy",
    turq: "bg-turq/25 text-navy",
    coral: "bg-coral/20 text-navy",
    sky: "bg-sky text-navy",
  } as const;
  return (
    <span className={`chip ${tones[tone]}`} title={label}>
      <span aria-hidden>{icon}</span>
      <span>{value}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
