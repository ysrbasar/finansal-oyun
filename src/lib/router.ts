import { useSyncExternalStore } from "react";

// Basit hash yönlendirici: Statik barındırma ve çevrimdışı PWA ile sorunsuz çalışır.
const getHash = () => (typeof window === "undefined" ? "/" : window.location.hash.replace(/^#/, "") || "/");

/** Uygulama içinde kaç adım ilerlendiği (geri tuşu davranışı için) */
let depth = 0;

function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

export function useRoute() {
  const path = useSyncExternalStore(subscribe, getHash, () => "/");
  const parts = path.split("?")[0].split("/").filter(Boolean);
  return { path, parts };
}

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  if (getHash() === to) return;
  if (opts.replace) {
    window.history.replaceState(null, "", `#${to}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else {
    depth++;
    window.location.hash = to;
  }
  window.scrollTo({ top: 0 });
}

/** Geri: Uygulama içinde geçmiş varsa geri gider, yoksa verilen sayfaya döner */
export function goBack(fallback = "/") {
  if (depth > 0) {
    depth--;
    window.history.back();
  } else {
    navigate(fallback, { replace: true });
  }
}
