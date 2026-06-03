---
title: Tuangou — Developer Onboarding Guide
---

<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; line-height: 1.7; }
  h1 { color: #1a1a2e; border-bottom: 3px solid #e63946; padding-bottom: 8px; }
  h2 { color: #1a1a2e; border-bottom: 2px solid #457b9d; padding-bottom: 6px; margin-top: 2em; }
  h3 { color: #457b9d; margin-top: 1.5em; }
  h4 { color: #e63946; }
  code { background: #f1f3f4; padding: 2px 6px; border-radius: 4px; font-size: 0.88em; }
  pre { background: #1a1a2e; color: #a8dadc; padding: 16px; border-radius: 8px; font-size: 0.82em; overflow-x: auto; }
  pre code { background: none; padding: 0; color: inherit; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th { background: #1a1a2e; color: #a8dadc; padding: 8px 12px; text-align: left; }
  td { border: 1px solid #ddd; padding: 8px 12px; }
  tr:nth-child(even) td { background: #f8f9fa; }
  blockquote { border-left: 4px solid #e63946; padding: 0 16px; margin: 1em 0; background: #fff8f8; border-radius: 0 4px 4px 0; }
  .callout { background: #e8f4fd; border-left: 4px solid #457b9d; padding: 12px 16px; border-radius: 0 4px 4px 0; margin: 1em 0; }
  hr { border: none; border-top: 1px solid #ddd; margin: 2em 0; }
</style>

# Tuangou (团购) — Developer Onboarding Guide

> **For everyone:** This document is written so both technical teammates and non-technical stakeholders can understand the project at whatever depth they need. Skip to the section that's most relevant to you.

---

## Quick-Reference Card

| | |
|---|---|
| **What it is** | Bilingual community group-buying e-commerce platform |
| **Languages** | English + Simplified Chinese (toggle in the UI) |
| **Users** | Shoppers browsing/ordering food; admins managing the store |
| **Stack** | Next.js 15 · React 19 · TypeScript · Tailwind CSS · Supabase |
| **Database** | Supabase (PostgreSQL) — products, orders, carts, user profiles |
| **Auth** | Supabase Auth — email/password, Google, WeChat OAuth (coming soon) |
| **Tests** | 65 unit tests (Vitest + React Testing Library) |
| **Run locally** | `npm install` → add `.env.local` → `npm run seed` → `npm run dev` |
| **Admin access** | Manual SQL step — see §8 |

---

## Table of Contents

1. [What Is This Product?](#1-what-is-this-product) — *Start here if you're new*
2. [Tech Stack](#2-tech-stack) — *What the project is built with*
3. [Project Structure](#3-project-structure) — *How the codebase is organised*
4. [How Authentication Works](#4-how-authentication-works) — *Sign-in, sessions, and roles*
5. [How Data Flows](#5-how-data-flows) — *From user action to database and back*
6. [Key Features](#6-key-features) — *What the website can do*
7. [Database Schema](#7-database-schema) — *What's stored and how it's related*
8. [Running It Locally](#8-running-it-locally) — *Step-by-step setup guide*
9. [Testing](#9-testing) — *How to run and write tests*
10. [Internationalisation (EN/ZH)](#10-internationalisation-enzh) — *How the language toggle works*
11. [Known Limitations & Roadmap](#11-known-limitations--roadmap) — *What's still to do*

---

## 1. What Is This Product?

### In Plain English

**Tuangou** (团购, "group buying") is an online grocery store built for local communities. The core idea is simple: **when neighbours shop together, everyone gets a better price.**

Instead of each person placing a separate order and paying for home delivery, community members browse the same catalogue, add items to their carts, and collect their orders at a designated community pickup point — cutting costs for everyone. Think of it like a neighbourhood co-op, but online.

The platform is designed for **multilingual communities in Canada** (particularly BC), so every page, label, and error message is available in both English and Simplified Chinese. Shoppers can flip between the two with a single click.

### Who Uses It?

| Role | What They Do |
|---|---|
| **Shoppers** | Browse products, add items to their cart, check out, and track their orders |
| **Guests** | Browse freely without an account, but must sign in to place an order |
| **Admins** | Manage products, review orders, see analytics, and monitor user activity |

### What Problem Does It Solve?

- Reduces per-order delivery costs through **community pickup**
- Unlocks **bulk-buy discounts** when enough neighbours buy together
- Serves communities whose **first language is Chinese** (full bilingual support)
- Provides fresh, locally-sourced goods with **no artificial preservatives**

---

## 2. Tech Stack

### For Non-Technical Readers

Think of the tech stack as the collection of tools and building materials the development team chose to construct the website. Just as a builder chooses timber, bricks, and specific power tools, developers choose frameworks, databases, and libraries.

### The Full Stack

| Layer | Technology | What It Does |
|---|---|---|
| **UI Framework** | Next.js 15 (App Router) | Powers every page — both the public storefront and the admin dashboard |
| **UI Language** | React 19 + TypeScript | The component system; TypeScript adds type-safety to prevent common bugs |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS framework; makes it easy to build responsive, consistent UI |
| **UI Primitives** | Radix UI | Unstyled, accessible building blocks (dialogs, dropdowns, sliders, tabs) |
| **Icons** | Lucide React | Clean, consistent icon set used throughout the UI |
| **Charts** | Recharts | Admin dashboard revenue and order charts |
| **Forms** | React Hook Form + Zod | Form state management + validation rules |
| **Database** | Supabase (PostgreSQL) | Stores all products, orders, user accounts, carts, and activity logs |
| **Authentication** | Supabase Auth | Manages user sign-up, sign-in, and sessions |
| **API** | Next.js API Routes (`/api/v1/*`) | Server-side endpoints that the browser calls to read/write data |
| **Testing** | Vitest + React Testing Library | Automated tests that catch regressions before they reach production |
| **Test Mocking** | MSW (Mock Service Worker) | Intercepts HTTP calls in tests so no real network requests are made |

### Key Configuration Files

| File | Purpose |
|---|---|
| `.env.local` | Secret keys and feature flags — **never commit this** |
| `next.config.ts` | Next.js settings (allowed image domains: Unsplash, DiceBear) |
| `tailwind.config.ts` | Custom colour palette and animation settings |
| `tsconfig.json` | TypeScript compiler settings (strict mode, path aliases) |
| `vitest.config.mts` | Test runner configuration |
| `package.json` | All dependencies and runnable scripts |

---

## 3. Project Structure

Everything lives in the `src/` directory. Here's a map:

```
src/
├── app/                     ← Next.js pages and API routes
│   ├── (storefront)/        ← Public-facing pages (home, shop, cart, checkout…)
│   ├── admin/               ← Admin dashboard (restricted to admin role)
│   ├── api/v1/              ← REST API endpoints the browser calls
│   └── auth/callback/       ← OAuth redirect handler
│
├── components/
│   ├── ui/                  ← Low-level primitives (Button, Card, Dialog…)
│   ├── common/              ← Shared layout pieces (Navbar, Footer, LanguageToggle)
│   ├── storefront/          ← Product-focused components (ProductCard, Hero, FilterSidebar…)
│   └── admin/               ← Dashboard components (AdminGate, ProductFormDialog…)
│
├── providers/               ← React Contexts: Auth, Cart, Language
├── lib/
│   ├── repository.ts        ← The data layer — all API calls go through here
│   ├── api/client.ts        ← Thin HTTP wrapper (adds auth header, timeouts)
│   ├── storage.ts           ← localStorage read/write helpers
│   └── utils.ts             ← Shared helpers (formatPrice, formatDate, className merge)
│
├── i18n/                    ← All bilingual text strings + LanguageProvider
├── data/                    ← Static seed data (36 products, 8 categories)
├── types.ts                 ← Shared TypeScript types (Product, Order, CartLine…)
└── test/                    ← Test setup, MSW mock server, mock Supabase client
```

### How the Three Main Sections Relate

```
Browser visits /shop
      ↓
(storefront)/shop/page.tsx         ← React page component
      ↓ calls
lib/repository.ts → listProducts() ← Data layer
      ↓ calls
/api/v1/products                   ← Next.js API route
      ↓ calls
Supabase (PostgreSQL)              ← Database
      ↑ returns rows
      ↑ maps to Product[]
      ↑ renders product cards
```

---

## 4. How Authentication Works

### Plain-English Summary

When a user wants to buy something, they need an account. Tuangou uses **Supabase Auth** to handle identity — the same service that stores all the product and order data. Sign-in is supported via email/password and Google. A WeChat option exists in the code but is currently disabled.

Once signed in, the app remembers the user via a **JWT token** (a secure, encrypted string stored in a cookie). This token is automatically attached to every API request so the server knows who is asking.

### The Complete Sign-In Flow

```
1. User visits /account/login
   └─ Sees: Email/password form  |  Google button  |  WeChat button (disabled)

2. User submits email + password
   └─ AuthProvider.signInWithPassword() → supabase.auth.signInWithPassword()
   └─ Supabase validates credentials, returns a JWT session

3. Session is stored in a cookie (middleware refreshes it on every page visit)

4. AuthProvider fetches /api/v1/me
   └─ Returns: { role, name, email, phone, wechat_id, avatar_url }
   └─ Sets user state across the whole app

5. User is now logged in — cart merges, orders become accessible
```

### OAuth (Google) Flow

```
1. User clicks "Continue with Google"
2. AuthProvider.signInWithGoogle() → supabase.auth.signInWithOAuth({ provider: 'google' })
3. Browser redirects to Google's sign-in page
4. After consent, Google redirects to /auth/callback?code=...
5. Callback route exchanges code for a session → redirects to account page
```

### Roles & Permissions

There are only two roles in the system:

| Role | Who Has It | What They Can Do |
|---|---|---|
| `user` | Everyone who signs up (default) | Browse, buy, manage their own orders and profile |
| `admin` | Manually promoted via SQL | Everything above + full admin dashboard access |

> **Promoting someone to admin** requires a one-line SQL query in Supabase — there is no UI for this yet. See §8.4 for instructions.

### How API Security Works

Every `/api/v1/*` endpoint checks the `Authorization: Bearer <token>` header. Three helper functions enforce this:

| Helper | What It Does |
|---|---|
| `getAuthUser(req)` | Reads the token, validates it with Supabase, returns `{ userId, role }` |
| `requireAuth(req)` | Same, but returns HTTP 401 if there's no valid token |
| `requireAdmin(req)` | Same, but returns HTTP 403 if the user's role isn't `admin` |

### Cart & Session Isolation

When a user signs out, their cart is **immediately cleared** — both from memory and from `localStorage` — so the next person to use the same device doesn't see someone else's items. When a user signs in, any guest cart items are automatically merged into their server-side cart.

---

## 5. How Data Flows

### The Architecture in One Diagram

```
 BROWSER                          NEXT.JS SERVER              SUPABASE
 ──────────────────────────────   ─────────────────────────   ──────────
 React Component
    ↓ calls
 lib/repository.ts                                            
    ↓ fetch() with JWT token
                                  /api/v1/* route handler
                                    ↓ requireAuth() checks JWT
                                    ↓ supabase (service-role client)
                                                                DB query
                                                                ↑ rows
                                    ↑ maps DB rows → DTOs
                                    ↑ JSON response
    ↑ typed result (Product, Order…)
 Component re-renders
```

### Example: Placing an Order

Here's exactly what happens when a customer clicks "Place Order":

```
1. CHECKOUT FORM (browser)
   User fills in: name, phone, address, community pickup point
   Zod validates all required fields
   
2. SUBMIT (browser → server)
   POST /api/v1/orders
   Body: { items: [{productId, quantity}], name, phone, address, community }
   Header: Authorization: Bearer <jwt>
   
3. SERVER VALIDATES (Next.js API route)
   ✓ requireAuth() — confirms a valid logged-in user
   ✓ Fetches all product prices from the DATABASE (ignores client-supplied prices)
   ✓ Checks every productId exists — returns 409 if any are missing
   ✓ Calculates totals server-side (prevents price tampering)
   ✓ Generates a unique order ID with an idempotency key
   
4. DATABASE WRITES (Supabase)
   INSERT INTO orders (id, user_id, subtotal_cents, total_cents, status, …)
   INSERT INTO order_items (order_id, product_id, unit_price_cents, quantity, …)
   DELETE FROM cart_items WHERE cart_id = (user's cart)
   INSERT INTO activities (type='PLACE_ORDER', user_id, meta={orderId})
   
5. RESPONSE (server → browser)
   201 Created + full Order object
   
6. BROWSER UPDATES
   CartProvider.clear() — empties cart
   router.push('/order/confirmed/' + order.id)
```

> **Security note:** Prices are always read from the database during checkout — the browser never sets the price. A user cannot manipulate the request body to pay less.

### The Repository Pattern

All data access goes through `src/lib/repository.ts`. This is intentional — it's the single place you need to change if the backend changes. Component code never calls `fetch()` directly.

```typescript
// Components call this ↓
const products = await listProducts();   // → GET /api/v1/products
const order    = await placeOrder(...)   // → POST /api/v1/orders
const cart     = await fetchServerCart() // → GET /api/v1/cart
```

---

## 6. Key Features

### Storefront (Public — No Account Required)

| Page | What It Does |
|---|---|
| **Home (`/`)** | Hero banner, popular products carousel, new arrivals grid, category tiles, community notice, trust bar |
| **Shop (`/shop`)** | Full product catalogue with filter sidebar (price range, dietary tags) and sort options |
| **Category (`/category/[slug]`)** | Same as Shop, pre-filtered to one category |
| **Product Detail (`/product/[slug]`)** | Product images, description, dietary tags, stock status, quantity selector, "Add to Cart", expandable info tabs (Ingredients / Nutrition / Storage / Origin) |
| **Cart (`/cart`)** | Line items with quantity controls, subtotal, delivery fee, total, checkout button |
| **Checkout (`/checkout`)** | Contact info, pickup community selection, delivery address (shown for large orders), payment section |
| **Order Confirmed (`/order/confirmed/[id]`)** | Confirmation page with order ID, summary, and next steps |

### Account (Sign-In Required)

| Page | What It Does |
|---|---|
| **Login (`/account/login`)** | Email/password form, Google OAuth button, WeChat button (disabled) |
| **Account Home (`/account`)** | Welcome screen, links to orders, saved items (coming soon), sign out |
| **Order History (`/account/orders`)** | All past orders, expandable to see line items and status |

### Admin Dashboard (Requires `admin` Role)

| Page | What It Does |
|---|---|
| **Dashboard (`/admin`)** | Stats cards, 7-day orders trend chart, revenue by category chart |
| **Orders (`/admin/orders`)** | All orders with inline status editing (Confirmed → Processing → Completed/Cancelled) |
| **Products (`/admin/products`)** | Full product catalogue with create/edit dialog and delete confirmation |
| **Users (`/admin/users`)** | All users with email, phone, order count, and total spent |
| **Activity Feed (`/admin/activity`)** | Chronological log of every action: sign-ins, cart adds, orders placed, product edits |

### Bilingual Language Toggle

A pill switch in the top navigation bar lets anyone flip between English and Chinese instantly. The preference is remembered between visits. Every label, error message, and piece of UI text has been translated.

---

## 7. Database Schema

### Plain-English Explanation

The database has 8 tables. Think of each table as a spreadsheet:

| Table | What It Stores |
|---|---|
| `profiles` | Extra info about each user (name, phone, WeChat ID, role) |
| `categories` | The 8 product categories (Fresh Meat, Eggs & Dairy, Snacks…) |
| `products` | The full product catalogue (name EN+ZH, price, stock, dietary tags, image URL) |
| `carts` | One cart row per signed-in user |
| `cart_items` | The individual products in each cart (product ID + quantity) |
| `orders` | Every placed order (subtotal, delivery fee, status, address) |
| `order_items` | The line items within each order (product, price at time of purchase, quantity) |
| `activities` | An immutable audit log of every user action |

### Relationships at a Glance

```
auth.users ──1:1──▶ profiles
auth.users ──1:1──▶ carts ──1:many──▶ cart_items ──▶ products
auth.users ──1:many──▶ orders ──1:many──▶ order_items ──▶ products
products ──▶ categories
auth.users ──1:many──▶ activities
```

### Important Details

- **Prices are stored as integer cents** — `1999` means $19.99. This avoids floating-point rounding errors.
- **Order items snapshot the price at purchase time** — if a product price changes later, old orders are unaffected.
- **Dietary tags are stored as a comma-delimited string** — e.g., `"VEGAN,ORGANIC"`.
- **`cart_items` has a unique constraint** on `(cart_id, product_id)` — you can't accidentally add the same product twice; quantities are merged instead.

---

## 8. Running It Locally

### Prerequisites

- **Node.js 18 or newer** (check with `node --version`)
- A **Supabase project** (free tier works) — [app.supabase.com](https://app.supabase.com)
- The repository cloned to your machine

### Step 1 — Install Dependencies

```bash
npm install
```

### Step 2 — Create Your Environment File

Create a file called `.env.local` in the project root (copy from `.env.example` if it exists):

```env
NEXT_PUBLIC_WECHAT_ENABLED=false

# From your Supabase project → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co/
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

> **Finding these values:** In the Supabase dashboard → Settings → API. The "Project URL" is `SUPABASE_URL`, the "anon public" key is `PUBLISHABLE_KEY`, and the "service_role" key is `SERVICE_ROLE_KEY`.

### Step 3 — Seed the Database

This loads the 8 categories and 36 products into your Supabase project. Only needs to be run once per project.

```bash
npm run seed
```

### Step 4 — Start the Development Server

```bash
npm run dev
```

Visit **http://localhost:3000**. You should see the Tuangou storefront.

### Step 5 — Verify Everything Is Working

```bash
curl http://localhost:3000/api/v1/health
# Should return: {"status":"ok","supabase":{"reachable":true,...}}
```

If you see a `500` with a message about `SUPABASE_SERVICE_ROLE_KEY`, double-check your `.env.local`.

### Step 6 — (Optional) Make Yourself an Admin

Open the Supabase dashboard → SQL Editor and run:

```sql
-- 1. Find your user ID
SELECT id, email FROM auth.users;

-- 2. Promote yourself
UPDATE profiles SET role = 'admin' WHERE user_id = 'paste-your-uuid-here';
```

Then sign in and navigate to **http://localhost:3000/admin**.

---

## 9. Testing

### Running Tests

```bash
npm test              # Run all 65 tests once
npm run test:watch    # Run in watch mode (re-runs on file save)
```

### What's Tested

| Category | Files | Count |
|---|---|---|
| API route handlers | `api/__tests__/*.test.ts` | ~40 tests |
| React components | `providers/__tests__/*.tsx`, `admin/__tests__/*.tsx` | ~15 tests |
| Repository / data layer | `lib/__tests__/repository.test.ts` | ~10 tests |

### How the Test Setup Works

Tests run in a **simulated browser environment (jsdom)** — no real browser needed. All HTTP calls are intercepted by **MSW (Mock Service Worker)**, which returns fixture data instead of hitting a real server. Supabase is fully mocked so tests don't need a database connection.

```
Test runs
  ↓ renders React component
  ↓ component calls fetch() or supabase.*
  ↓ MSW intercepts → returns fixture JSON
  ↓ assertion checks the rendered output
```

### Writing a New Test

```typescript
import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";

it("shows product name", () => {
  render(<ProductCard product={fixtures.product} />);
  expect(screen.getByText("Longjing Tea")).toBeInTheDocument();
});
```

---

## 10. Internationalisation (EN/ZH)

### How It Works

All visible text is stored in a **flat dictionary** at `src/i18n/strings.ts`. Every key has both an English and a Chinese value:

```typescript
"product.addToCart": { en: "Add to Cart", zh: "加入购物车" },
"nav.shop":          { en: "Shop",         zh: "商店" },
```

Components access strings via the `useLanguage()` hook:

```typescript
const { t, toggle, locale } = useLanguage();

<button>{t("product.addToCart")}</button>
// Renders "Add to Cart" (EN) or "加入购物车" (ZH) depending on locale
```

The toggle pill in the navbar calls `toggle()` to flip between locales. The chosen language is saved to `localStorage` so it persists across visits.

### Price Formatting

Prices adapt to locale too: `formatPrice(1999, "en")` → `$19.99`; `formatPrice(1999, "zh")` → `¥19.99`.

### Adding New Text

1. Add a new key to `src/i18n/strings.ts` with both `en` and `zh` values
2. Use `t("your.new.key")` in your component
3. If the key is missing, a warning is logged in development mode

---

## 11. Known Limitations & Roadmap

The project is an MVP — it works end-to-end, but some features are intentionally incomplete.

| Feature | Status | Notes |
|---|---|---|
| **Search** | Not implemented | Search bar is visible but does nothing |
| **Saved Items (Wishlist)** | Not implemented | Link exists in the account menu |
| **WeChat OAuth** | Disabled | Code exists; toggle `NEXT_PUBLIC_WECHAT_ENABLED=true` when ready |
| **Product image upload** | URL only | Admin form accepts an image URL; no file picker |
| **Email notifications** | Not implemented | No order confirmation email |
| **Admin role promotion UI** | Not implemented | Requires manual SQL (see §8.4) |
| **Payment processing** | Visual only | Checkout shows a card form but does not charge anyone |
| **Pagination** | Not implemented | All products/orders/activities load at once |

### Seed Data Note

The static data file (`src/data/products.ts`) has 74 products, but only 36 are seeded to the database. Products that aren't in the database will return a 409 error at checkout. Always run `npm run seed` after setting up a new Supabase project.

---

## Appendix — Useful Commands

```bash
# Development
npm run dev          # Start local server at http://localhost:3000

# Testing
npm test             # Run all tests
npm run test:watch   # Watch mode

# Code Quality
npm run lint         # ESLint
npx tsc --noEmit     # TypeScript type check (no output files)

# Database
npm run seed         # Seed categories + products into Supabase

# Production
npm run build        # Build for production
npm start            # Start production server
```

---

## Appendix — Environment Variables Reference

| Variable | Required | Where to Find It |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase → Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (server only) | Supabase → Settings → API → service_role key |
| `NEXT_PUBLIC_WECHAT_ENABLED` | No | Set to `true` only when WeChat OAuth is fully configured |

> **Security:** `SUPABASE_SERVICE_ROLE_KEY` bypasses Row-Level Security — it is only used server-side (in `/api/v1/*` routes) and must never be exposed to the browser. Variables prefixed with `NEXT_PUBLIC_` are visible in the browser bundle — never put secrets there.

---

*Document generated June 2026 · Tuangou v0.1.0*
