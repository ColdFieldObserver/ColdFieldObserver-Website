/**
 * 产物级断言（与 OpenPidanUI 官网同款思路）。
 *
 * `prerender.failOnError: true` 只能抓「枚举了但渲染报错」，抓不到「该枚举却漏了」——
 * 漏页在线上就是 404，而构建会显示成功。所以在 nuxi generate 之后逐条对账。
 * 另外把本次改版的几个硬约束也在这里兜住：静态预设、字体自包含、工具模块已移除。
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRoutes } from '../build/post-index.ts';

const PUBLIC_DIR = fileURLToPath(new URL('../.output/public', import.meta.url));

/**
 * autoSubfolderIndex: false：
 *   /posts/xxx            → posts/xxx.html
 *   /posts/               → posts/index.html（带尾斜杠的索引页）
 *   /categories/公告       → categories/公告.html（中文不预先编码）
 *   /atom.xml、/404.html  → 原样
 */
function toFile(route) {
  const decoded = decodeURIComponent(route);
  if (decoded === '/') return 'index.html';
  if (/\.(html|json|xml|txt|ico|svg)$/.test(decoded)) return decoded.slice(1);
  if (decoded.endsWith('/')) return `${decoded.slice(1)}index.html`;
  return `${decoded.slice(1)}.html`;
}

if (!existsSync(PUBLIC_DIR)) {
  console.error('[verify] 找不到 .output/public，先跑 nuxi generate');
  process.exit(1);
}

const failures = [];
const routes = buildRoutes();
const missing = routes.filter((route) => !existsSync(join(PUBLIC_DIR, toFile(route))));
if (missing.length) {
  failures.push(`${missing.length} 条路由没有产物：`);
  for (const route of missing) failures.push(`  - ${route}  (期望 ${toFile(route)})`);
}

// assets-only Worker 的产物里不该有服务端入口，否则 wrangler deploy 会失败
for (const stale of ['server', '_worker.js']) {
  if (existsSync(join(PUBLIC_DIR, stale))) {
    failures.push(`产物里出现了 ${stale}：说明 Nitro 没用 static 预设`);
  }
}

// 工具模块已整体移除，/tools/ 及工具页不应再出现在产物里
if (existsSync(join(PUBLIC_DIR, 'tools'))) {
  failures.push('产物里还有 tools/：工具模块未清理干净');
}

// 字体自包含：sync-fonts.mjs 必须产出本地样式表，且页面不能再引用字体 CDN
if (!existsSync(join(PUBLIC_DIR, 'fonts', 'harmonyos.css'))) {
  failures.push('缺少 fonts/harmonyos.css：sync-fonts.mjs 没有执行或执行失败');
}
const homeFile = join(PUBLIC_DIR, 'index.html');
if (existsSync(homeFile)) {
  const home = readFileSync(homeFile, 'utf8');
  if (home.includes('cdn.jsdelivr.net')) {
    failures.push('首页仍在引用字体 CDN，字体没有真正自包含');
  }
  if (!home.includes('/fonts/harmonyos.css')) {
    failures.push('首页没有引用 /fonts/harmonyos.css');
  }
}

if (failures.length) {
  console.error('[verify] 产物校验失败：');
  for (const line of failures) console.error(line);
  process.exit(1);
}

console.log(`[verify] ${routes.length} 条路由全部有产物 ✓ 字体自包含 / 静态预设 / 无工具页 ✓`);
