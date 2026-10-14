import { Delete } from "lucide-react";
import { play } from "../lib/sound";

/** Çocuklar için büyük tuşlu sayı girişi */
export function NumPad({
  value,
  onChange,
  onSubmit,
  maxLength = 4,
  disabled,
  unit,
  submitLabel = "Kontrol et",
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  maxLength?: number;
  disabled?: boolean;
  unit?: string;
  submitLabel?: string;
}) {
  const press = (d: string) => {
    if (disabled) return;
    play("tik");
    if (value.length >= maxLength) return;
    onChange(value === "0" ? d : value + d);
  };
  return (
    <div
      className="mx-auto w-full max-w-xs"
      onKeyDown={(e) => {
        if (disabled) return;
        if (/^\d$/.test(e.key)) press(e.key);
        else if (e.key === "Backspace") onChange(value.slice(0, -1));
        else if (e.key === "Enter" && value) onSubmit();
      }}
    >
      <div
        className="mb-3 flex h-16 items-center justify-center rounded-2xl border-4 border-navy/10 bg-white font-display text-4xl font-bold"
        aria-live="polite"
        aria-label={`Cevabın: ${value || "boş"} ${unit ?? ""}`}
        tabIndex={0}
      >
        {value || <span className="text-navy/25">?</span>}
        {unit && <span className="ml-2 text-xl text-ink-muted">{unit}</span>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} type="button" className="btn-ghost h-14 text-2xl" onClick={() => press(d)} disabled={disabled}>
            {d}
          </button>
        ))}
        <button type="button" className="btn-ghost h-14" onClick={() => onChange(value.slice(0, -1))} disabled={disabled} aria-label="Sil">
          <Delete />
        </button>
        <button type="button" className="btn-ghost h-14 text-2xl" onClick={() => press("0")} disabled={disabled}>
          0
        </button>
        <button type="button" className="btn-primary h-14 px-2 text-base" onClick={onSubmit} disabled={disabled || !value}>
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
