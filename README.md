# 命轮 · FateWheel

> 天道有常，人事无常。以古法观世，以星辰问心。

一个融合东方古法与现代 AI 的占卜 Web 应用。支持三种玩法、可安装为 PWA、离线可用，AI 解读由 DeepSeek 生成。

[![Deploy to Cloudflare Workers](https://github.com/riba2534/fate_wheel/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/riba2534/fate_wheel/actions/workflows/deploy.yml)

**线上访问**：<https://fate.red>

## 功能

- **命运之轮**：叩问心事，转动天轮，窥见命途所向。输入问题，随机落定扇区，AI 生成事业、情感、财运、健康四向解读
- **每日一签**：一日一签，顺天而行。同一用户同一天必得同签，结果缓存至次日零时（按北京时间）
- **周易六十四卦**：古法摇卦，六爻随机起卦，识别本卦与变卦，AI 给出爻辞级解读
- **卡片导出**：`html2canvas-pro` 将结果渲染为可保存或分享的卦象卡片
- **分享链接**：占卜结果存入 D1，生成 7 天内有效的短链，任何人打开即可还原卦象
- **历史记录**：IndexedDB 本地保存，不上传服务器
- **PWA**：支持安装到桌面/主屏，离线可访问壳页面

## 技术栈

### 前端

| 类别 | 方案 |
|---|---|
| 框架 | Next.js 16.2（App Router，强制 webpack 以兼容 `@ducanh2912/next-pwa`） |
| UI | React 19 + TypeScript + Tailwind CSS v4 |
| 动画 | Framer Motion + GSAP |
| 图标字体 | Lucide React、Cinzel、Noto Sans/Serif SC、ZCool Xiaowei（全部自托管） |
| 本地存储 | IndexedDB（`idb`） |
| 状态管理 | Zustand |
| 卡片导出 | html2canvas-pro |
| PWA | `@ducanh2912/next-pwa`（Workbox） |

### 后端与基础设施

| 类别 | 方案 |
|---|---|
| 运行时 | Cloudflare Workers（通过 `@opennextjs/cloudflare` 适配器） |
| 数据库 | Cloudflare D1（分享记录，7 天过期） |
| 缓存与限流 | Cloudflare KV（每日一签缓存 + 按分钟/日限流） |
| LLM | DeepSeek Chat（通过原生 `fetch`，不使用 SDK） |
| 静态资源 | Cloudflare Workers Assets |
| CI/CD | GitHub Actions 自动部署 |

## 项目结构

```
app/
  api/divine/{wheel,daily,iching}/route.ts  # 三个占卜 API（限流 + LLM + KV 缓存）
  api/share/route.ts                        # 分享读写（D1）
  r/[id]/page.tsx                           # 分享还原 SSR 页
  wheel / daily / iching / history /        # 前端页面
  card-preview / manifest.ts / layout.tsx
components/
  wheel / iching / card / backgrounds / layout / ui
lib/
  db/d1.ts              # D1 访问层
  db/schema.sql         # D1 建表脚本
  deepseek/             # 提示词工程 + fetch 客户端 + Zod schema
  divination/           # 占卜纯逻辑（摇卦、扇区、签、RNG）
  storage/              # IndexedDB 历史记录
  rate-limit.ts         # KV 限流
middleware.ts           # www.fate.red → fate.red 301 重定向
wrangler.jsonc          # Cloudflare Workers 配置
open-next.config.ts     # OpenNext 适配器配置
```

## 本地开发

### 前置

- Node.js ≥ 22
- pnpm ≥ 10
- DeepSeek API Key（[申请地址](https://platform.deepseek.com)）

### 安装

```bash
pnpm install
```

### 配置环境变量

创建 `.dev.vars`（供 `opennextjs-cloudflare preview` 使用，已被 `.gitignore`）：

```
DEEPSEEK_API_KEY=sk-xxxxxxxx
```

如需使用 `next dev` 开发前端（不连 Cloudflare 资源），额外创建 `.env.local`：

```
DEEPSEEK_API_KEY=sk-xxxxxxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 常用命令

```bash
pnpm dev           # 启动 Next.js 开发服务器（webpack 模式，不含 Cloudflare bindings）
pnpm build:cf      # 构建 OpenNext 产物（.open-next/）
pnpm preview       # 本地以 Workers 方式运行，带完整 D1/KV bindings
pnpm deploy        # 构建并部署到 Cloudflare（需要 wrangler 登录）
pnpm lint          # 跑 Next.js lint
```

## 部署

### 自动部署（推荐）

`main` 分支任何新 push 都会触发 GitHub Actions，2 分钟左右完成 `pnpm install → opennextjs-cloudflare build → wrangler deploy`。

首次配置需在 repo secrets 中设置：

| Secret 名 | 说明 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | 建议签发窄权限 token：`Workers Scripts: Edit` + `Account Settings: Read` + `D1: Edit` + `Workers KV Storage: Edit` |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard 右侧侧栏可见 |

`DEEPSEEK_API_KEY` 不放在 GitHub Secrets，而是通过 `wrangler secret put DEEPSEEK_API_KEY` 直接存在 Cloudflare 侧，`wrangler deploy` 不会清除。

### 手动部署

```bash
export CLOUDFLARE_API_TOKEN=...
export CLOUDFLARE_ACCOUNT_ID=...
pnpm deploy
```

### 初始化 Cloudflare 资源

第一次部署到一个新的 Cloudflare 账户时，需要手动创建 D1 和 KV：

```bash
# 创建 D1 数据库，把返回的 database_id 填入 wrangler.jsonc
npx wrangler d1 create fate-wheel

# 初始化 schema
npx wrangler d1 execute fate-wheel --file=./lib/db/schema.sql --remote

# 创建 KV namespace，把返回的 id 填入 wrangler.jsonc
npx wrangler kv namespace create CACHE_KV

# 设置 DeepSeek 密钥
npx wrangler secret put DEEPSEEK_API_KEY
```

## 设计笔记

- **限流**：默认每 clientId 每分钟 5 次、每天 30 次。KV 的最终一致性可能放行少量并发请求，对本应用软限流可接受
- **每日一签的"今天"**：Workers 运行在 UTC，若直接用 `new Date()` 取日期会和国内用户差 8 小时。代码里显式处理为 UTC+8
- **无 `edge` runtime**：OpenNext Cloudflare 不支持 `export const runtime = "edge"`，所有 server 代码默认跑在单一 Worker 入口内（`nodejs_compat` flag），通过 `getCloudflareContext()` 拿到 bindings
- **分享数据结构**：D1 只存 `shares(id, type, data_json, created_at, expire_at)`，`data_json` 是完整占卜结果的 JSON，SSR 页读取后直接渲染

## 许可证

未指定。

---

<p align="center">
  <sub>庚寅年 ✦ 于此问天</sub>
</p>
