# Good Food, Shared Together / 好食材，一起团

A bilingual (EN / 中文) **community group-buying** e-commerce MVP — frontend
only, no backend. All data is mocked and persisted in `localStorage`.
Authentication is a **simulated WeChat consent screen**.

> Built with **Next.js 15 (App Router)** + **TypeScript** + **Tailwind CSS** +
> **shadcn-style primitives** + **Recharts**. No external i18n, state, or
> backend libraries — providers + `localStorage` is the contract.

## Quick start

```powershell
# from the repo root (the path contains a space — quote when needed)
cd "c:\Users\jimcn\Downloads\wechat store"
npm install
npm run dev
# → http://localhost:3000
```

> If `pnpm` is available you can use `pnpm install && pnpm dev` instead. The
> project was scaffolded with npm because pnpm wasn't found on this machine.

## Highlights

- 8 categories, **36 mock products** (4–5 per category) with bilingual names,
  descriptions, pack sizes, dietary tags, stock states, prices, and Unsplash
  imagery (the `<ProductImage>` falls back to a warm gradient if a URL fails).
- 5 mock WeChat identities; **Auntie Mei / 美姨** (`wx_admin_001`) is the admin.
- **EN | 中文** toggle pill in the navbar persists to `tuangou.lang`.
- Anonymous browsing → click **Place Order** → gated WeChat consent screen →
  return → place order → `/order/confirmed/[id]`.
- Admin panel: dashboard with Recharts cards, products CRUD (Upload New / Edit
  / Delete with confirmation), users drawer with their orders + activity,
  orders table with inline status edit, and a chronological activity feed.
- Mobile-first: hamburger nav, single-column product grids, drawer for admin
  detail panes, and sticky cart count badge.

## EN ↔ ZH toggle

The pill in the navbar (and inside the WeChat consent screen) flips every
visible label. Strings live in `src/i18n/strings.ts` — adding a new label means
adding one entry with `{ en, zh }`. Missing keys log a warning in dev.

## Sign in as **admin** (the only path that unlocks `/admin/*`)

1. Click **Sign In** in the navbar (or visit any admin page directly).
2. You'll land on the **WeChat Authorization** consent screen.
3. In the identity picker, choose **"Auntie Mei / 美姨"** (the row tagged
   `Admin`). Their `openid` is `wx_admin_001`.
4. Click **Authorize / 确认授权**.
5. You'll be redirected to `/admin` automatically (or back to the page that
   triggered the sign-in via the `returnTo` query param).

To switch back to a regular user, sign out from `/account` and authorize again
as one of the other 4 identities (Wei Lin / 林伟, Mei Chen / 陈美, David Zhao / 赵建国,
Lily Wang / 王丽丽).

## Resetting the demo

Everything that mutates lives in `localStorage` under the `tuangou.` prefix:

| Key                  | Holds                                   |
| -------------------- | --------------------------------------- |
| `tuangou.lang`       | `"en"` or `"zh"`                        |
| `tuangou.user`       | currently signed-in WeChat identity     |
| `tuangou.cart`       | cart line items                         |
| `tuangou.products`   | the product catalog (admin edits here)  |
| `tuangou.orders`     | placed orders                           |
| `tuangou.activities` | full activity feed (admin & shopper)    |

To wipe state, open DevTools → Application → Local Storage and delete every
key beginning with `tuangou.`, or run in the console:

```js
Object.keys(localStorage)
  .filter(k => k.startsWith("tuangou."))
  .forEach(k => localStorage.removeItem(k));
location.reload();
```

The seed catalog reloads automatically on the next read.

## Project layout

```
src/
  app/
    (storefront)/       # public chrome (navbar/footer)
      page.tsx           # /
      shop/, category/[slug]/, product/[slug]/
      cart/, checkout/, order/confirmed/[id]/
      account/, account/orders/, account/login/
    auth/wechat/consent/ # the simulated WeChat consent screen
    admin/               # dashboard + products + users + orders + activity
  components/
    common/      # Navbar, Footer, LanguageToggle, CategoryIcon
    storefront/  # ProductCard, ProductImage, FilterSidebar, Hero, etc.
    admin/       # AdminGate, AdminSidebar, ProductFormDialog
    ui/          # button, card, input, dialog, drawer, table, tabs, …
  data/          # categories.ts, products.ts, wechatAccounts.ts (seed)
  i18n/          # strings.ts + LanguageProvider.tsx
  providers/     # AuthProvider, CartProvider, AppProviders
  lib/
    repository.ts  # the only module that touches localStorage for domain data
    storage.ts     # tiny typed wrapper around localStorage
    utils.ts       # cn, formatPrice, formatDate, maskOpenid, uid
  types.ts
```

`src/lib/repository.ts` is the seam for swapping in a real backend. Replace
each function (`listProducts`, `placeOrder`, `listOrders`, `listActivities`,
`upsertProduct`, `deleteProduct`, `updateOrderStatus`, …) with `fetch` calls
and the rest of the app keeps working.

## Notable trade-offs

- **No real shadcn CLI install.** Instead, I hand-wrote the small set of
  primitives we use directly under `src/components/ui/*` so the build is
  reproducible and offline-friendly. They follow the same Radix + cva +
  Tailwind pattern shadcn uses.
- **Images** are hot-linked to `images.unsplash.com` photo IDs. If a photo ID
  rotates, `<ProductImage>` falls back to a warm gradient instead of a broken
  image.
- **Stripe-style** checkout is purely visual — `Place Order` writes to
  `tuangou.orders` and clears the cart.
- **i18n** has no namespace tree; the dictionary is one flat record. This
  trades nesting for fail-loud `console.warn`s on missing keys in dev.

## Known TODOs / polish

- Search is not wired (input shown in some places but no global search yet).
- "Saved Items" link on `/account` is disabled; saved-for-later is not stored.
- Email + Google buttons on `/account/login` are stubs by design — WeChat is
  the canonical sign-in.
- The admin product-form image picker takes a URL; an upload-from-disk
  affordance (data URL) would be a small addition.
- Some Unsplash photo IDs may go stale over time; swap them or add real
  product photos when wiring the backend.

— Built end-to-end as the MVP brief requested. Have fun.
