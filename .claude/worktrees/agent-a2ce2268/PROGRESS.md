# Project Progress — WeChat Group-Buy Store

**Branch:** `development`  
**Last updated:** 2026-05-19  
**Dev server:** http://localhost:3000

---

## Summary Table

| Area | Status |
|---|---|
| Order placement (500 error) | Fixed |
| Cart shared between users | Fixed |
| Cart cleared after order | Confirmed working |
| Admin panel | Built from scratch |
| "Product not found" on checkout | Fixed (seed script added) |
| Server-side price validation | Added |
| Idempotency on order creation | Added |
| Race-safe cart helpers | Added |
| Unit tests | 65 passing across 14 files |
| Pushed to remote | Not yet |

---

## Bugs Encountered and Fixed

### 1. Order Placement 500 Error

**Symptoms:** Every attempt to place an order returned HTTP 500 with no useful message in the browser.

**Root causes (three independent issues):**

- `orders.id` is defined as `TEXT PRIMARY KEY` with no `DEFAULT`. Inserting a row without an explicit `id` value caused a primary key constraint violation.
- The route inserted `status: "PENDING"`, but the database `CHECK` constraint only permits the values `CONFIRMED`, `PROCESSING`, `COMPLETED`, and `CANCELLED`.
- `SUPABASE_SERVICE_ROLE_KEY` was commented out in `.env.local`. Every call to `createAdminClient()` threw `supabaseKey is required` and crashed the entire API layer, including authenticated routes.

**Fixes applied:**

- Restored `SUPABASE_SERVICE_ROLE_KEY` from `backend/.env`.
- Added `MissingSupabaseConfigError`, which lists all missing environment variables by name on startup.
- Wrapped all route handlers with `withRoute(name, fn)` for structured error logging (method, path, duration, status, error message and stack on failure).
- Added `GET /api/v1/health` diagnostic endpoint that reports environment variable presence, Supabase connectivity, and product count without exposing secret values.

---

### 2. Cart Shared Between Users

**Symptoms:** After logging out, the next user to log in on the same device would see or inherit the previous user's cart items.

**Root cause:** Cart state was stored in `localStorage` and never cleared on logout. Because `localStorage` is scoped to the browser origin and not the user session, it persisted across sign-outs.

**Fix:** `CartProvider.tsx` now listens for the Supabase `SIGNED_OUT` auth event and clears both React state and the corresponding `localStorage` key. Cart data is now effectively scoped to the authenticated session.

---

### 3. Cart Not Clearing After Order

**Status:** This was already working correctly on the server side. On successful order creation, the route deletes all `cart_items` rows for the user. Confirmed and preserved.

---

### 4. No Admin Panel

**Symptoms:** Admin pages existed in the route tree but rendered with the storefront layout and styling. There was no distinct admin experience, no navigation, and no useful data presentation. `AdminGate` showed a blank loading state for non-admin users instead of an explicit rejection.

**Root causes:**

- Admin pages inherited the customer-facing layout component.
- Admin API endpoints did not join `auth.users`, so user contact information (email, phone) was unavailable.
- `AdminGate` had no error branch for failed role checks.

**Fixes applied:**

- Built a fully distinct admin UI with a dark `bg-slate-900` sidebar containing Dashboard, Orders, Users, Products, and Activity sections.
- Added a sticky top bar with breadcrumbs, a search field, and a user identity pill.
- Data tables display status pills and open a detail drawer on row click.
- `AdminGate` now renders an explicit "Access denied" screen for non-admin users.
- Admin orders API joins `auth.users` to surface email and phone.
- Admin users API uses `supabase.auth.admin.listUsers()` for the full user list.

**How to grant admin access:** In the Supabase SQL editor, run:

```sql
UPDATE profiles SET role = 'admin' WHERE id = '<your-user-uuid>';
```

Then navigate to `/admin`.

---

### 5. "Product not found: p_004" on Checkout

**Symptoms:** Attempting to check out any item resulted in a 409 Conflict response with a message like `Product not found: p_004`.

**Root cause:** The Supabase `products` table was empty (`productCount: 0`). The storefront rendered products from `src/data/products.ts` (a static mock catalog with IDs `p_001` through `p_074`), but the orders route validated cart items against the real database and found no matching rows.

**Fixes applied:**

- Created `scripts/seed-supabase.mts` — an idempotent seed script that upserts 39 products across 8 categories from the mock catalog into Supabase. Safe to run multiple times.
- Registered the script as `npm run seed`.
- Improved the orders route to collect all missing product IDs in a single pass, delete stale cart lines server-side, and return a descriptive `409 Conflict` response listing which IDs were not found.

---

## Security and Reliability Hardening

- **Idempotency:** `POST /api/v1/orders` accepts an `Idempotency-Key` header. The order ID is derived deterministically from the key, and a `23505` unique-constraint conflict is treated as a replay, returning the original order rather than an error.
- **Server-side price validation:** Client-supplied prices are ignored. All prices are fetched directly from the database at order time, preventing price manipulation.
- **Race-safe cart helpers:** Concurrent `add-to-cart` requests that produce a `23505` unique violation are recovered gracefully with an upsert fallback.
- **Admin endpoint protection:** All `/api/v1/admin/*` routes return `403 Forbidden` for any user without the `admin` role.
- **Structured error logging:** `withRoute(name, fn)` wraps every route handler, capturing method, path, duration, HTTP status, and the full error stack on failure.

---

## Tests

- **Total:** 65 Vitest unit tests passing across 14 test files.
- **Coverage areas:**
  - Orders handler: success path, unauthenticated request, invalid payload, idempotency replay, stale product IDs.
  - Admin auth gate: access granted for admin role, access denied for non-admin.
  - Cart provider: clears state and localStorage on sign-out.
  - Health endpoint: returns expected fields and connectivity status.

---

## Git History

| Commit | Description |
|---|---|
| `885cd58` | Main fixes — env config, admin panel, cart isolation, route hardening (37 files) |
| `4c9988f` | Seed script fix — resolves "Product not found: p_004" on checkout |

**Base branch:** created from `fix/admin-checkout`  
**Remote:** not yet pushed.

---

## How to Run

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev

# Seed the Supabase products table (run once; safe to re-run)
npm run seed

# Run the unit test suite
npm test
```

---

## Manual Smoke Test

After starting the dev server and seeding the database, walk through the following:

1. **Health check** — `GET http://localhost:3000/api/v1/health`. Confirm `supabase: "ok"` and `productCount: 39`.
2. **Storefront** — Browse to http://localhost:3000. Confirm products load and categories filter correctly.
3. **Add to cart** — Add two or more products to the cart. Confirm the cart badge updates.
4. **Guest checkout rejection** — Without logging in, attempt to place an order. Confirm a 401 response.
5. **Sign in** — Log in with a test account.
6. **Order placement** — Complete checkout. Confirm a 201 response and that the cart clears afterward.
7. **Cart isolation** — Sign out, then sign in with a different account. Confirm the cart is empty.
8. **Admin panel** — With an admin-role account, navigate to `/admin`. Confirm the sidebar, order table, and user list render. With a non-admin account, confirm the "Access denied" screen.
9. **Idempotency** — Submit the same order request twice with the same `Idempotency-Key` header. Confirm the second response returns the original order rather than a duplicate.

---

## Remaining and Known Issues

| Issue | Notes |
|---|---|
| Products table must be seeded | Run `npm run seed` once after any database wipe or fresh Supabase project setup. |
| Admin role must be set manually | No UI exists to promote users to admin. Use the Supabase SQL editor (`UPDATE profiles SET role = 'admin' WHERE id = '...'`). |
| `development` branch not pushed | All commits exist locally only. Push with `git push origin development` when ready. |
| No email/SMS order confirmation | Out of scope for this session; no transactional messaging is wired up. |
| Mock catalog vs. DB catalog | `src/data/products.ts` contains 74 entries; only 39 are seeded into Supabase. The remaining 35 are available in the mock data but cannot be ordered until added to the DB. |
