// PWA ikonlarını SVG'den PNG'ye çevirir (Playwright/Chromium ile). Kullanım: npm run icons
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const icon = (maskable) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${maskable ? 0 : 112}" fill="#35C9B1"/>
  <g transform="translate(256 270) scale(${maskable ? 0.72 : 0.92}) translate(-256 -270)">
    <ellipse cx="256" cy="470" rx="150" ry="20" fill="#192744" opacity="0.15"/>
    <path d="M150 190 L170 100 L232 160 Z" fill="#1f9e8a"/>
    <path d="M362 190 L342 100 L280 160 Z" fill="#1f9e8a"/>
    <ellipse cx="256" cy="300" rx="170" ry="150" fill="#FFF9F0"/>
    <ellipse cx="256" cy="168" rx="122" ry="24" fill="#E8A92A"/>
    <path d="M172 168 Q178 82 256 76 Q334 82 340 168 Z" fill="#FFD166"/>
    <rect x="178" y="140" width="156" height="22" rx="8" fill="#FF7A70"/>
    <ellipse cx="206" cy="262" rx="20" ry="25" fill="#192744"/>
    <ellipse cx="306" cy="262" rx="20" ry="25" fill="#192744"/>
    <circle cx="212" cy="252" r="7" fill="#fff"/><circle cx="312" cy="252" r="7" fill="#fff"/>
    <ellipse cx="256" cy="318" rx="44" ry="30" fill="#7fe0cf"/>
    <ellipse cx="240" cy="318" rx="8" ry="11" fill="#1f9e8a"/><ellipse cx="272" cy="318" rx="8" ry="11" fill="#1f9e8a"/>
    <path d="M216 360 Q256 398 296 360" stroke="#192744" stroke-width="11" stroke-linecap="round" fill="none"/>
    <ellipse cx="166" cy="330" rx="24" ry="15" fill="#FF7A70" opacity="0.5"/><ellipse cx="346" cy="330" rx="24" ry="15" fill="#FF7A70" opacity="0.5"/>
  </g>
</svg>`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const page = await browser.newPage();
async function render(svg, size, out) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace("<svg ", `<svg width="${size}" height="${size}" `)}</body></html>`);
  writeFileSync(out, await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } }));
}
await render(icon(false), 192, "public/pwa-192.png");
await render(icon(false), 512, "public/pwa-512.png");
await render(icon(true), 512, "public/pwa-maskable-512.png");
await render(icon(true), 180, "public/apple-touch-icon.png");
await browser.close();
console.log("İkonlar üretildi.");
