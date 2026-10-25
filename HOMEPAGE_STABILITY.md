# Sholok Homepage — Stability Guide

## Protected Components

Do not modify these files without reviewing the impact on `https://sholok.com/home`:

| File | Purpose | Notes |
|---|---|---|
| `src/pages/Index.tsx` | Homepage layout root | Uses `Header + HomeHero + 4 sections + sidebar` |
| `src/components/portal/Header.tsx` | Sticky top nav | `isHome` flag splits home vs non-home layout |
| `src/components/portal/HomeHero.tsx` | Sholok brand + SearchBar + AI Mode + ServiceGrid | Standalone hero, only shown on /home |
| `src/components/portal/SearchBar.tsx` | Global search input | Used in HomeHero (hero) and Header (non-home pages) |
| `src/components/portal/ShoppingSection.tsx` | Product grid | Fetches `/api/products/public` |
| `src/components/portal/SmartStoreCarousel.tsx` | Smart Store hero carousel | Below CafeSection; uses real Smart Store hero images |
| `src/services/universalSearch.service.ts` | Universal search API fan-out | **normalizeProduct() required** — `/api/search` returns snake_case |
| `src/pages/SearchResults.tsx` | Search results page | Tabs: All / Shopping / Smart Store / Jobs / Blog / Video |

## Responsive Breakpoints

All components use **Tailwind CSS** breakpoints:
- `xs` (default, 0–639px) — 1-2 column layouts, icon-only buttons
- `sm` (640px+) — show more text labels, wider grids
- `lg` (1024px+) — 4-column homepage grid with sidebar

**Homepage grid (`Index.tsx`):**
```
mobile:  grid-cols-1 (main content stacks vertically, no sidebar)
desktop: grid-cols-1 lg:grid-cols-4 (3-col content + 1-col sidebar)
```

**Product grid (`ShoppingSection.tsx`):**
```
mobile:  grid-cols-2
tablet:  sm:grid-cols-3
laptop:  md:grid-cols-4
desktop: lg:grid-cols-5
```

**Search results grid (`SearchResults.tsx`):**
```
products/videos: grid-cols-2 sm:grid-cols-3
```

## Known Root Causes (Fixed)

1. **Nginx browser caching** — `index.html` was cached without `Cache-Control` headers.
   - Fixed: `/etc/nginx/sites-enabled/sholok.com` now serves `Cache-Control: no-store, no-cache, must-revalidate` for `location /`.

2. **Search prices showing ৳0** — `/api/search` returns MySQL snake_case fields (`regular_price`, `sale_price`) but `ProductResult` expected camelCase.
   - Fixed: `normalizeProduct()` in `universalSearch.service.ts` maps snake_case → camelCase on every response.

3. **Mobile header crowding** — Language dropdown + Login text competed with SearchBar icons on mobile.
   - Fixed: Language dropdown hidden on mobile (`hidden sm:block`); Login shows icon-only on mobile.

## Deployment Steps

1. Make changes in `D:\Sholok-Web\s new\Sholok-main\`
2. Build: `npm run build` (output: `dist/`)
3. SCP: `scp -i ~/.ssh/claude_vps -r dist/ root@162.0.213.197:/tmp/portal_dist_new`
4. Deploy: `ssh root@162.0.213.197 "cp -r /tmp/portal_dist_new/* /var/www/sholok/"`
5. Verify bundle: `curl -s https://sholok.com/home | grep "index-.*\.js"`
6. Test live: open `https://sholok.com/home?v=N` (cache-busting param for first load)
7. Commit: copy changed files to `C:\Users\mdk24\Downloads\Sholok-main(1)\Sholok-main\` and `git push origin main`

## Regression Checklist

Before every deploy, verify:

- [ ] `https://sholok.com/home` — "Sholok" heading visible, SearchBar, AI Mode pill, service icons
- [ ] Shopping section loads products with prices (৳)
- [ ] SmartStoreCarousel renders below Cafés with real images and auto-slides
- [ ] `https://sholok.com/search?q=dress` — shopping products show correct ৳ prices
- [ ] Mobile (375px): header not crowded, no horizontal scroll
- [ ] Mobile (375px): product 2-col grid renders without overflow
- [ ] Desktop: 4-col grid (3 content + 1 sidebar with weather widget)
- [ ] Dark mode: all sections readable
- [ ] No new console errors on page load

## Do Not Touch

- `/smart-store/` — separate Vite app in `Sub Web/All Website/Smart_Store`
- `/VideoPlatform/` — separate app in `Sub Web/All Website/Video Controls`
- `/news/` — separate app in `Sub Web/All Website/News`
- `/job-portal/` — separate app in `Sub Web/All Website/Job Portal`
- Blog MySQL database — separate schema in `blog_db`
- Nginx SSL/HTTPS config — never run Certbot or modify SSL settings
- DNS/Cloudflare — never change nameservers or A records
