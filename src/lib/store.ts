import { useSyncExternalStore } from "react";
import type { UserProgress } from "../types";
import { ensureDaily, finalize } from "./engine";
import { loadState, saveState } from "./storage";

type Listener = () => void;

let state: UserProgress = ensureDaily(loadState());
const listeners = new Set<Listener>();
let saveFailed = false;

saveState(state);

/** Tüm durum değişiklikleri buradan geçer: uygula → rozet/seviye kontrolü → kaydet → bildir */
export function update(fn: (s: UserProgress) => UserProgress) {
  const prev = state;
  const next = fn(prev);
  if (next === prev) return;
  state = finalize(prev, next);
  saveFailed = !saveState(state);
  listeners.forEach((l) => l());
}

/** Doğrulama yapılmadan tam durum değiştirme (içe aktarma / sıfırlama) */
export function replaceState(next: UserProgress) {
  state = ensureDaily(next);
  saveFailed = !saveState(state);
  listeners.forEach((l) => l());
}

export const getState = () => state;
export const didSaveFail = () => saveFailed;

function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAppState(): UserProgress {
  return useSyncExternalStore(subscribe, getState, getState);
}

// Aynı cihazda başka sekmede değişiklik olursa senkronize ol
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key && e.key.startsWith("minik-finans-kasifleri")) {
      state = loadState();
      listeners.forEach((l) => l());
    }
  });
}
