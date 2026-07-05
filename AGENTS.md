# Binos Properties — POMP

## Commands
- `npm run dev` — Tailwind CSS watch mode (dev)
- `npm run build` — Production build to `dist/public/`
- `npm run deploy` — Build + wrangler deploy
- `npm run db:portals` — Run portals migration on D1

## Architecture
- Vanilla JS SPA (ES modules, no bundler)
- Cloudflare Workers + D1 + R2 backend
- Tailwind CSS via CLI build + CDN fallback for dynamic classes
- Routes are closure-based: `export function renderXxx(container)`
- All state in `let` variables inside route function

## Conventions
- Import `toast` from `../lib/toast.js` for user-facing errors (never `console.error`)
- Import `openImageViewer` from `../lib/image-viewer.js` for image lightboxes
- All user-supplied values in template strings must use `escHtml()`
- All async mutations wrapped in `try/catch` with `toast.error()` on failure
- Soft deletes: send `{ active: false }` via PUT, never DELETE
- Use `container.querySelectorAll` (scoped), not `document.querySelectorAll`
- Use `data-*` attributes for event wiring, not inline `onclick="() => fn()"` markers
- Each route file exports only: `renderXxx(container)` and is imported in `app.js`

## Key Files
- `app.js` — Layout, navigation, route registry, global error handler
- `lib/utils.js` — `apiClient`, formatting, `escHtml`
- `lib/toast.js` — `toast.success/error/info()`
- `lib/image-viewer.js` — `openImageViewer({url, name, onReplace, onDelete})`
- `lib/cache.js` — `initCache`, `refreshDashboard`
- `lib/icons.js` — `ICONS` object with all SVG icon strings
- `routes/settings.js` — Logo/favicon upload via localStorage
