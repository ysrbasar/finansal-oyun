import { motion } from "framer-motion";
import { MessageCircle, ShieldAlert, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { SECURITY_SCENARIOS } from "../data/gameContent";
import { shuffle } from "../lib/util";
import { play } from "../lib/sound";
import type { GameProps } from "../screens/GameScreen";

export function SecurityRadarGame({ onFinish }: GameProps) {
  const list = useMemo(() => shuffle(SECURITY_SCENARIOS).slice(0, 8), []);
  const [i, setI] = useState(0);
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const sc = list[i];
  const actions = useMemo(() => shuffle(sc.actions), [sc]);
  const verdictOk = verdict === sc.safe;

  return (
    <motion.div key={sc.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
      <p className="text-center font-bold text-navy-soft">
        Mesaj {i + 1}/{list.length} · Puan: {score}
      </p>
      <div className="relative rounded-[1.75rem] bg-navy p-4 text-white shadow-[var(--shadow-lift)]">
        <p className="flex items-center gap-2 text-sm font-bold text-sun">
          <MessageCircle size={16} /> {sc.sender}
        </p>
        <p className="mt-2 rounded-2xl rounded-tl-sm bg-white/10 p-3 text-lg font-semibold">{sc.message}</p>
        <motion.div className="absolute -right-2 -top-3 text-3xl" animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} aria-hidden>
          📡
        </motion.div>
      </div>

      {verdict === null ? (
        <>
          <h2 className="text-center text-xl font-bold">Radarın ne diyor?</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="btn-primary h-20 flex-col gap-0" onClick={() => setVerdict(true)}>
              <ShieldCheck /> Güvenli
            </button>
            <button className="btn-coral h-20 flex-col gap-0" onClick={() => setVerdict(false)}>
              <ShieldAlert /> Şüpheli
            </button>
          </div>
        </>
      ) : (
        <>
          <p className={`rounded-2xl p-3 font-semibold ${verdictOk ? "bg-success/20" : "bg-sun/40"}`} role="status">
            {verdictOk ? "Radarın doğru çalıştı! " : "Birlikte bakalım: "}
            Bu mesaj {sc.safe ? "güvenli görünüyor." : "şüpheli."} Peki ne yaparsın?
          </p>
          <div className="grid gap-2">
            {actions.map((a) => (
              <button
                key={a.id}
                disabled={!!action}
                onClick={() => {
                  setAction(a.id);
                  const ok = a.id === sc.best && verdictOk;
                  play(a.id === sc.best ? "dogru" : "ipucu");
                  if (ok) setScore((s) => s + 1);
                }}
                className={`min-h-14 rounded-2xl border-[3px] px-4 py-3 text-left font-bold ${
                  action && a.id === sc.best ? "border-success bg-success/15" : action === a.id ? "border-coral bg-coral/10" : "border-navy/10 bg-white"
                }`}
              >
                {a.text}
              </button>
            ))}
          </div>
          {action && (
            <div className="rounded-3xl bg-sky p-4" role="status">
              <p className="font-semibold">{sc.explanation}</p>
              <p className="mt-1 text-sm font-bold text-navy-soft">Emin olmadığında her zaman güvendiğin bir yetişkine sorabilirsin.</p>
              <button
                className="btn-dark mt-3 w-full"
                autoFocus
                onClick={() => {
                  if (i + 1 >= list.length) {
                    onFinish({ score, max: list.length }, "Şifre, kart bilgisi, adres ya da para isteyen mesajlarda dur, paylaşma ve bir yetişkine göster.");
                  } else {
                    setI(i + 1);
                    setVerdict(null);
                    setAction(null);
                  }
                }}
              >
                {i + 1 >= list.length ? "Sonucu gör" : "Sonraki mesaj"}
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
