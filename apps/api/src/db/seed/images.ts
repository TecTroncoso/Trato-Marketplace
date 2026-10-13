import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const PUBLIC_DIR = resolve(__dirname, "../../../../web/public");

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function write(relativePath: string, content: string): void {
  const fullPath = join(PUBLIC_DIR, relativePath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content, "utf8");
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

const FONT = "Segoe UI, system-ui, -apple-system, Arial, sans-serif";

export function productImage(slug: string, title: string, emoji: string, hue: number, index: number): string {
  const hueShift = hue + index * 18;
  const emojiSize = index === 0 ? 190 : index === 1 ? 150 : 165;
  const emojiY = index === 0 ? 300 : index === 1 ? 270 : 285;
  const label = escapeXml(truncate(title, 34));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" role="img" aria-label="${label}">
<defs>
<linearGradient id="bg${index}" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${hueShift}, 62%, 58%)"/>
<stop offset="1" stop-color="hsl(${hueShift + 34}, 58%, 40%)"/>
</linearGradient>
</defs>
<rect width="600" height="600" fill="url(#bg${index})"/>
<circle cx="${index === 1 ? 470 : 500}" cy="${index === 2 ? 150 : 100}" r="${index === 1 ? 150 : 120}" fill="rgba(255,255,255,0.12)"/>
<circle cx="${index === 2 ? 120 : 80}" cy="${index === 1 ? 480 : 520}" r="95" fill="rgba(255,255,255,0.10)"/>
<circle cx="300" cy="${emojiY - 30}" r="150" fill="rgba(255,255,255,0.14)"/>
<text x="300" y="${emojiY + 40}" font-size="${emojiSize}" text-anchor="middle">${emoji}</text>
<rect x="0" y="470" width="600" height="130" fill="rgba(0,0,0,0.22)"/>
<text x="300" y="522" font-size="26" font-weight="600" fill="#ffffff" text-anchor="middle" font-family="${FONT}">${label}</text>
<text x="300" y="562" font-size="18" font-weight="700" fill="#fff159" text-anchor="middle" letter-spacing="4" font-family="${FONT}">TRATO</text>
</svg>`;
  return svg;
}

export function writeProductImages(slug: string, title: string, emoji: string, hue: number): string[] {
  const paths: string[] = [];
  for (let index = 0; index < 3; index += 1) {
    const path = `/products/${slug}-${index + 1}.svg`;
    write(path.replace(/^\//, ""), productImage(slug, title, emoji, hue, index));
    paths.push(path);
  }
  return paths;
}

export function writeCategoryImage(slug: string, name: string, emoji: string, hue: number): string {
  const path = `/categories/${slug}.svg`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${escapeXml(name)}">
<defs>
<linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${hue}, 68%, 62%)"/>
<stop offset="1" stop-color="hsl(${hue + 30}, 60%, 44%)"/>
</linearGradient>
</defs>
<rect width="400" height="400" rx="24" fill="url(#cg)"/>
<circle cx="330" cy="80" r="95" fill="rgba(255,255,255,0.12)"/>
<circle cx="70" cy="330" r="70" fill="rgba(255,255,255,0.10)"/>
<text x="200" y="235" font-size="150" text-anchor="middle">${emoji}</text>
<text x="200" y="330" font-size="24" font-weight="700" fill="#ffffff" text-anchor="middle" font-family="${FONT}">${escapeXml(truncate(name, 24))}</text>
</svg>`;
  write(path.replace(/^\//, ""), svg);
  return path;
}

export function writeSellerAvatar(slug: string, name: string, hue: number): string {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  const path = `/sellers/${slug}.svg`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96" role="img" aria-label="${escapeXml(name)}">
<defs>
<linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${hue}, 60%, 55%)"/>
<stop offset="1" stop-color="hsl(${hue + 40}, 55%, 38%)"/>
</linearGradient>
</defs>
<rect width="96" height="96" rx="48" fill="url(#sg)"/>
<text x="48" y="62" font-size="38" font-weight="700" fill="#ffffff" text-anchor="middle" font-family="${FONT}">${initials}</text>
</svg>`;
  write(path.replace(/^\//, ""), svg);
  return path;
}

function heroSvg(id: string, from: string, to: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 520" width="1600" height="520" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="hg-${id}" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${from}"/>
<stop offset="1" stop-color="${to}"/>
</linearGradient>
</defs>
<rect width="1600" height="520" fill="url(#hg-${id})"/>
<circle cx="1380" cy="120" r="280" fill="rgba(255,255,255,0.14)"/>
<circle cx="1180" cy="440" r="180" fill="rgba(255,255,255,0.10)"/>
<circle cx="250" cy="470" r="240" fill="rgba(0,0,0,0.06)"/>
<path d="M0 400 Q 400 320 800 400 T 1600 400 L 1600 520 L 0 520 Z" fill="rgba(255,255,255,0.10)"/>
</svg>`;
}

export function writeHeroImages(): void {
  write("hero/hero-yellow.svg", heroSvg("yellow", "#ffe45c", "#ffbf2e"));
  write("hero/hero-blue.svg", heroSvg("blue", "#5aa9ff", "#2b62e0"));
  write("hero/hero-green.svg", heroSvg("green", "#5ee0a0", "#12a05a"));
}

export function writeFavicon(): void {
  write("../src/app/icon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<rect width="64" height="64" rx="14" fill="#ffe600"/>
<text x="32" y="46" font-size="40" font-weight="800" text-anchor="middle" font-family="${FONT}" fill="#2d3277">T</text>
</svg>`);
}

export function publicDir(): string {
  return PUBLIC_DIR;
}
