// 生成 PWA 图标（命轮 logo SVG → PNG）
// 依赖：sharp（已随 next-pwa 安装）
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const outDir = resolve(process.cwd(), "public/icons");
await mkdir(outDir, { recursive: true });

// 命轮 logo SVG：深紫底 + 金色命运之轮 + 中心"命"字
const makeSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="#2A1658"/>
      <stop offset="60%" stop-color="#13082E"/>
      <stop offset="100%" stop-color="#0A0618"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F0D98B"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#9A7A1C"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>

  <!-- 外圈星辰 -->
  <g fill="#F0D98B" opacity="0.4">
    <circle cx="256" cy="80" r="2"/>
    <circle cx="410" cy="130" r="1.5"/>
    <circle cx="432" cy="256" r="2"/>
    <circle cx="380" cy="390" r="1.5"/>
    <circle cx="256" cy="432" r="2"/>
    <circle cx="130" cy="390" r="1.5"/>
    <circle cx="80" cy="256" r="2"/>
    <circle cx="130" cy="130" r="1.5"/>
  </g>

  <!-- 命运之轮主体 -->
  <g stroke="url(#gold)" stroke-width="6" fill="none" filter="url(#glow)" stroke-linecap="round">
    <!-- 外圈 -->
    <circle cx="256" cy="256" r="170"/>
    <!-- 内圈 -->
    <circle cx="256" cy="256" r="100"/>
    <!-- 八辐条 -->
    <line x1="256" y1="86" x2="256" y2="426"/>
    <line x1="86" y1="256" x2="426" y2="256"/>
    <line x1="136" y1="136" x2="376" y2="376"/>
    <line x1="376" y1="136" x2="136" y2="376"/>
  </g>

  <!-- 中心"命"字背景圆 -->
  <circle cx="256" cy="256" r="60" fill="#0A0618" stroke="url(#gold)" stroke-width="4"/>

  <!-- 中心"命"字 -->
  <text x="256" y="288" text-anchor="middle"
        font-family="'ZCOOL XiaoWei', 'Noto Serif SC', 'STKaiti', serif"
        font-size="80" fill="url(#gold)" font-weight="400">命</text>
</svg>`;

const iconSizes = [192, 512];
for (const size of iconSizes) {
  const svg = makeSvg(size);
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(resolve(outDir, `icon-${size}.png`));
  console.log(`✓ icon-${size}.png`);
}

// Maskable icon（512，内容整体缩放 0.8 留 safe area；用 sharp composite 避免 SVG 嵌套）
await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: "#0A0618",
  },
})
  .composite([
    {
      input: await sharp(Buffer.from(makeSvg(512))).resize(410, 410).png().toBuffer(),
      top: 51,
      left: 51,
    },
  ])
  .png()
  .toFile(resolve(outDir, "icon-512-maskable.png"));
console.log("✓ icon-512-maskable.png");

// Apple touch icon 180
await sharp(Buffer.from(makeSvg(180)))
  .resize(180, 180)
  .png()
  .toFile(resolve(outDir, "apple-icon-180.png"));
console.log("✓ apple-icon-180.png");

// Favicon SVG 保留到根目录
await writeFile(resolve(process.cwd(), "public/favicon.svg"), makeSvg(64));
console.log("✓ favicon.svg");

console.log("\nAll icons generated.");
