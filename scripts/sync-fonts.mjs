/**
 * 把 HarmonyOS Sans SC 的分包字体在 `nuxi generate` 之后注入 .output/public/fonts/。
 *
 * 为什么不在 public/ 里存字体：仓库要零字体文件（授权与体积双重考虑），
 * 也不做注入式增强（见 .github/copilot-instructions.md）。
 * 为什么不交给 Vite：CJK 分包有几百个 woff2，交给构建图会让构建变慢、产物结构不可控。
 *
 * 只取 400 / 500 / 700 三档，对应 font-normal / font-medium / font-bold。
 * 与 PidanUI 官网 / OpenPidanUI 官网同款。
 */
import { createRequire } from 'node:module';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG = 'harmonyos-sans-sc-webfont-splitted';
const WEIGHTS = ['Regular', 'Medium', 'Bold'];

const require = createRequire(import.meta.url);
const distDir = dirname(require.resolve(PKG));
const publicDir = fileURLToPath(new URL('../.output/public', import.meta.url));
const outDir = join(publicDir, 'fonts');

if (!existsSync(publicDir)) {
  console.error('[fonts] 找不到 .output/public，先跑 nuxi generate');
  process.exit(1);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

let css = '';
let chunks = 0;
for (const weight of WEIGHTS) {
  css += `${readFileSync(join(distDir, `${weight}.css`), 'utf8')}\n`;
  for (const file of readdirSync(distDir)) {
    if (file.startsWith(`${weight}_`) && file.endsWith('.woff2')) {
      copyFileSync(join(distDir, file), join(outDir, file));
      chunks++;
    }
  }
}
writeFileSync(join(outDir, 'harmonyos.css'), css);

console.log(`[fonts] ${WEIGHTS.length} 个字重 / ${chunks} 个 woff2 分片 → .output/public/fonts/`);

// Nitro 在 Cloudflare 环境里可能生成部署重定向，会让 wrangler 找不到 assets 目录。
// 本站是纯静态 SSG，没有 worker 入口，直接清掉。
for (const stale of ['server', '../.wrangler']) {
  const target = join(publicDir, stale);
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
    console.log(`[fonts] 清理多余产物：${stale}`);
  }
}
