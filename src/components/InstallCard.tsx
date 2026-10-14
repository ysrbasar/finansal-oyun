import { Download, Share, X } from "lucide-react";
import { useState } from "react";
import { useInstall } from "../lib/install";

const KEY = "mfk-install-hidden";

/** Ana ekrana ekleme / kurulum yönergesi */
export function InstallCard({ compact = false }: { compact?: boolean }) {
  const inst = useInstall();
  const [hidden, setHidden] = useState(() => {
    try {
      return compact && localStorage.getItem(KEY) === "1";
    } catch {
      return false;
    }
  });
  if (inst.installed || hidden) return null;
  if (compact && !inst.canPrompt && !inst.ios) return null;

  const hide = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* yok say */
    }
    setHidden(true);
  };

  return (
    <section className="card relative p-4">
      {compact && (
        <button className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-sky" onClick={hide} aria-label="Kurulum kartını gizle">
          <X size={16} />
        </button>
      )}
      <h2 className="font-display text-lg font-bold">📲 Uygulamayı ana ekrana ekle</h2>
      {inst.canPrompt ? (
        <>
          <p className="mt-1 text-sm font-semibold text-ink-muted">Bir dokunuşla kur; internet olmadan da açılır.</p>
          <button className="btn-primary mt-3" onClick={() => void inst.prompt()}>
            <Download size={20} /> Uygulamayı yükle
          </button>
        </>
      ) : inst.ios ? (
        <ol className="mt-2 list-inside list-decimal space-y-1 text-sm font-semibold">
          <li>
            Safari'nin altındaki <Share size={16} className="inline" aria-label="Paylaş" /> <b>Paylaş</b> düğmesine dokun.
          </li>
          <li>
            <b>Ana Ekrana Ekle</b> seçeneğini bul.
          </li>
          <li>
            Sağ üstteki <b>Ekle</b>'ye dokun. Kumbi ana ekranında!
          </li>
        </ol>
      ) : (
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm font-semibold">
          <li>Android Chrome: Menü (⋮) → <b>Uygulamayı yükle</b> ya da <b>Ana ekrana ekle</b>.</li>
          <li>Masaüstü Chrome/Edge: Adres çubuğundaki <b>yükle</b> simgesine tıkla.</li>
          <li>iPhone/iPad: Safari → Paylaş → <b>Ana Ekrana Ekle</b>.</li>
        </ul>
      )}
    </section>
  );
}
