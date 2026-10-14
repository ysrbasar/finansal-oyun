/** Sürükle-bırak yardımcı: Bırakılan noktanın altındaki hedefi bulur (data-drop özelliği) */
export function dropTargetAt(point: { x: number; y: number }): string | null {
  const els = document.elementsFromPoint(point.x - window.scrollX, point.y - window.scrollY);
  const el = els.find((e) => (e as HTMLElement).dataset?.drop !== undefined) as HTMLElement | undefined;
  return el?.dataset.drop ?? null;
}
