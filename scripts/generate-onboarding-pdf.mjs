import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, "../docs/tuangou-onboarding.pdf");

// ── Colour palette ──────────────────────────────────────────────────────────
const C = {
  navy:     "#1a1a2e",
  blue:     "#457b9d",
  red:      "#e63946",
  lightBlue:"#a8dadc",
  bgGray:   "#f8f9fa",
  codeBg:   "#1a1a2e",
  codeText: "#a8dadc",
  muted:    "#6c757d",
  border:   "#dee2e6",
  white:    "#ffffff",
  black:    "#212529",
};

const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });
const stream = fs.createWriteStream(OUTPUT);
doc.pipe(stream);

const PW = doc.page.width;
const COL = PW - 100; // usable width

// ── Helpers ─────────────────────────────────────────────────────────────────
let currentY = 0;
function y() { return doc.y; }
function gap(n = 12) { doc.moveDown(n / 12); }

function ensureSpace(needed) {
  if (doc.y + needed > doc.page.height - 60) doc.addPage();
}

function hline(color = C.border) {
  gap(4);
  doc.moveTo(50, doc.y).lineTo(PW - 50, doc.y).strokeColor(color).lineWidth(1).stroke();
  gap(8);
}

function h1(text) {
  ensureSpace(60);
  doc.rect(50, doc.y, COL, 36).fill(C.navy);
  doc.fillColor(C.white).fontSize(18).font("Helvetica-Bold")
     .text(text, 58, doc.y - 30, { width: COL - 16 });
  gap(20);
}

function h2(text) {
  ensureSpace(50);
  gap(6);
  const lineY = doc.y + 2;
  doc.moveTo(50, lineY).lineTo(50 + COL, lineY).strokeColor(C.red).lineWidth(2).stroke();
  doc.fillColor(C.navy).fontSize(14).font("Helvetica-Bold").text(text, 50, doc.y - 8);
  gap(10);
}

function h3(text) {
  ensureSpace(36);
  gap(4);
  doc.fillColor(C.blue).fontSize(12).font("Helvetica-Bold").text(text, 50);
  gap(6);
}

function h4(text) {
  ensureSpace(28);
  doc.fillColor(C.red).fontSize(11).font("Helvetica-Bold").text(text, 50);
  gap(4);
}

function body(text, indent = 0) {
  doc.fillColor(C.black).fontSize(10).font("Helvetica").text(text, 50 + indent, doc.y, { width: COL - indent });
  gap(6);
}

function bullet(text, indent = 12) {
  const startY = doc.y;
  doc.fillColor(C.red).fontSize(10).font("Helvetica").text("•", 50 + indent, startY);
  doc.fillColor(C.black).fontSize(10).font("Helvetica")
     .text(text, 50 + indent + 14, startY, { width: COL - indent - 14 });
  gap(4);
}

function note(text) {
  ensureSpace(40);
  const startY = doc.y;
  doc.rect(50, startY, COL, 1).fill(C.blue); // accent bar
  doc.rect(50, startY, COL, 40).fill("#e8f4fd").stroke(C.border).lineWidth(0.5);
  doc.rect(50, startY, 4, 40).fill(C.blue);
  doc.fillColor(C.navy).fontSize(9.5).font("Helvetica-Oblique")
     .text(text, 62, startY + 8, { width: COL - 20 });
  doc.y = startY + 44;
  gap(6);
}

function code(text) {
  ensureSpace(60);
  const lines = text.split("\n").length;
  const boxH = lines * 14 + 20;
  ensureSpace(boxH + 10);
  const startY = doc.y;
  doc.rect(50, startY, COL, boxH).fill(C.codeBg);
  doc.fillColor(C.codeText).fontSize(8.5).font("Courier")
     .text(text, 60, startY + 10, { width: COL - 20, lineGap: 3 });
  doc.y = startY + boxH;
  gap(10);
}

function table(headers, rows) {
  ensureSpace(40 + rows.length * 24);
  const colW = COL / headers.length;
  let cx = 50, rowY = doc.y;

  // Header row
  headers.forEach((h, i) => {
    doc.rect(cx + i * colW, rowY, colW, 22).fill(C.navy);
    doc.fillColor(C.white).fontSize(9).font("Helvetica-Bold")
       .text(h, cx + i * colW + 6, rowY + 6, { width: colW - 10 });
  });
  rowY += 22;

  // Data rows
  rows.forEach((row, ri) => {
    const bg = ri % 2 === 0 ? C.white : C.bgGray;
    headers.forEach((_, i) => {
      doc.rect(cx + i * colW, rowY, colW, 22).fill(bg).strokeColor(C.border).lineWidth(0.3).stroke();
      doc.fillColor(C.black).fontSize(8.5).font("Helvetica")
         .text(row[i] ?? "", cx + i * colW + 6, rowY + 6, { width: colW - 10 });
    });
    rowY += 22;
  });

  doc.y = rowY;
  gap(10);
}

// ── Cover Page ───────────────────────────────────────────────────────────────
doc.rect(0, 0, PW, doc.page.height).fill(C.navy);

// Red accent strip
doc.rect(0, doc.page.height / 2 - 4, PW, 6).fill(C.red);

// Title block
doc.fillColor(C.white).fontSize(32).font("Helvetica-Bold")
   .text("TUANGOU", 50, 180, { align: "center", width: COL });
doc.fillColor(C.lightBlue).fontSize(14).font("Helvetica")
   .text("团购  ·  Community Group-Buying Platform", 50, 222, { align: "center", width: COL });

doc.fillColor(C.white).fontSize(20).font("Helvetica-Bold")
   .text("Developer Onboarding Guide", 50, 280, { align: "center", width: COL });

doc.fillColor(C.lightBlue).fontSize(11).font("Helvetica")
   .text("For technical and non-technical team members", 50, 316, { align: "center", width: COL });

// Stats strip
const statsY = 380;
doc.rect(50, statsY, COL, 70).fill("#16213e");
const stats = [
  ["Next.js 15", "Framework"],
  ["Supabase", "Database + Auth"],
  ["65 Tests", "All Passing"],
  ["EN + ZH", "Bilingual"],
];
stats.forEach(([val, label], i) => {
  const sx = 50 + i * (COL / 4) + (COL / 4) / 2 - 40;
  doc.fillColor(C.red).fontSize(13).font("Helvetica-Bold").text(val, sx, statsY + 12, { width: 80, align: "center" });
  doc.fillColor(C.lightBlue).fontSize(8).font("Helvetica").text(label, sx, statsY + 32, { width: 80, align: "center" });
});

doc.fillColor(C.lightBlue).fontSize(9).font("Helvetica")
   .text("v0.1.0  ·  June 2026", 50, doc.page.height - 60, { align: "center", width: COL });

// ── Page 2+ ─────────────────────────────────────────────────────────────────
doc.addPage();

// ── Quick Reference ──────────────────────────────────────────────────────────
h1("Quick-Reference Card");
table(
  ["Topic", "Details"],
  [
    ["What it is", "Bilingual community group-buying e-commerce platform"],
    ["Languages", "English + Simplified Chinese (toggle in the UI)"],
    ["Users", "Shoppers, Guests, and Admins"],
    ["Frontend", "Next.js 15 · React 19 · TypeScript · Tailwind CSS"],
    ["Backend", "Next.js API Routes (/api/v1/*)"],
    ["Database", "Supabase (PostgreSQL)"],
    ["Auth", "Supabase Auth — email/password, Google, WeChat (coming soon)"],
    ["Tests", "65 unit tests — Vitest + React Testing Library"],
    ["Run locally", "npm install → .env.local → npm run seed → npm run dev"],
    ["Admin access", "Manual SQL: UPDATE profiles SET role='admin' WHERE user_id='...'"],
  ]
);

// ── Section 1: What Is This ──────────────────────────────────────────────────
h1("1. What Is This Product?");

h2("In Plain English");
body("Tuangou (团购, \"group buying\") is an online grocery store built for local communities. The core idea is simple: when neighbours shop together, everyone gets a better price.");
body("Instead of each person placing a separate order and paying for home delivery, community members browse the same catalogue, add items to their carts, and collect their orders at a designated community pickup point — cutting costs for everyone. Think of it like a neighbourhood co-op, but online.");
body("The platform is designed for multilingual communities in Canada (particularly BC), so every page, label, and error message is available in both English and Simplified Chinese. Shoppers can flip between the two with a single click.");

h2("Who Uses It?");
table(
  ["Role", "What They Do"],
  [
    ["Shoppers", "Browse products, add items to cart, check out, and track orders"],
    ["Guests", "Browse freely without an account — must sign in to place an order"],
    ["Admins", "Manage products, review orders, see analytics, monitor activity"],
  ]
);

h2("What Problem Does It Solve?");
bullet("Reduces per-order delivery costs through community pickup");
bullet("Unlocks bulk-buy discounts when enough neighbours buy together");
bullet("Serves communities whose first language is Chinese (full bilingual support)");
bullet("Provides fresh, locally-sourced goods with no artificial preservatives");

// ── Section 2: Tech Stack ────────────────────────────────────────────────────
h1("2. Tech Stack");

note("Think of the tech stack as the collection of tools and building materials the team chose. Just as a builder selects timber, bricks, and power tools, developers choose frameworks, databases, and libraries.");

table(
  ["Layer", "Technology", "What It Does"],
  [
    ["UI Framework", "Next.js 15 (App Router)", "Powers every page — storefront and admin dashboard"],
    ["UI Language", "React 19 + TypeScript", "Component system; TypeScript prevents common bugs"],
    ["Styling", "Tailwind CSS 3.4", "Utility-first CSS for responsive, consistent UI"],
    ["UI Primitives", "Radix UI", "Accessible building blocks (dialogs, dropdowns, sliders)"],
    ["Icons", "Lucide React", "Clean icon set used throughout the interface"],
    ["Charts", "Recharts", "Admin dashboard revenue and order trend charts"],
    ["Forms", "React Hook Form + Zod", "Form state management and validation rules"],
    ["Database", "Supabase (PostgreSQL)", "Products, orders, users, carts, activity logs"],
    ["Authentication", "Supabase Auth", "Manages sign-up, sign-in, and sessions"],
    ["API", "Next.js API Routes", "Server endpoints the browser calls to read/write data"],
    ["Testing", "Vitest + RTL", "Automated tests that catch regressions"],
    ["Test Mocking", "MSW", "Intercepts HTTP in tests — no real network needed"],
  ]
);

h2("Key Configuration Files");
table(
  ["File", "Purpose"],
  [
    [".env.local", "Secret keys and feature flags — NEVER commit this file"],
    ["next.config.ts", "Next.js settings (allowed image domains)"],
    ["tailwind.config.ts", "Custom colour palette and animations"],
    ["tsconfig.json", "TypeScript compiler settings (strict mode, path aliases)"],
    ["vitest.config.mts", "Test runner configuration"],
    ["package.json", "All dependencies and runnable scripts"],
  ]
);

// ── Section 3: Project Structure ─────────────────────────────────────────────
h1("3. Project Structure");
body("Everything lives in the src/ directory. Here's the map:");
code(
`src/
├── app/                     ← Next.js pages and API routes
│   ├── (storefront)/        ← Public-facing pages (home, shop, cart, checkout…)
│   ├── admin/               ← Admin dashboard (restricted to admin role)
│   ├── api/v1/              ← REST API endpoints the browser calls
│   └── auth/callback/       ← OAuth redirect handler
│
├── components/
│   ├── ui/                  ← Low-level primitives (Button, Card, Dialog…)
│   ├── common/              ← Shared layout (Navbar, Footer, LanguageToggle)
│   ├── storefront/          ← Product components (ProductCard, Hero, Filter…)
│   └── admin/               ← Dashboard components (AdminGate, ProductForm…)
│
├── providers/               ← React Contexts: Auth, Cart, Language
├── lib/
│   ├── repository.ts        ← Data layer — all API calls go through here
│   ├── api/client.ts        ← HTTP wrapper (adds auth header, timeouts)
│   ├── storage.ts           ← localStorage read/write helpers
│   └── utils.ts             ← Shared helpers (formatPrice, formatDate…)
│
├── i18n/                    ← All bilingual text strings + LanguageProvider
├── data/                    ← Static seed data (36 products, 8 categories)
├── types.ts                 ← Shared TypeScript types (Product, Order…)
└── test/                    ← Test setup, MSW server, Supabase mock`
);

h2("How the Three Main Sections Relate");
code(
`Browser visits /shop
      ↓
(storefront)/shop/page.tsx         ← React page component
      ↓ calls
lib/repository.ts → listProducts() ← Data layer
      ↓ calls
/api/v1/products                   ← Next.js API route
      ↓ queries
Supabase (PostgreSQL)              ← Database
      ↑ returns rows → mapped to Product[] → page renders`
);

// ── Section 4: Auth ──────────────────────────────────────────────────────────
h1("4. How Authentication Works");

note("Plain-English summary: Tuangou uses Supabase Auth to handle identity. Sign-in is supported via email/password and Google. A WeChat option exists in the code but is currently disabled. Once signed in, the app remembers the user via a JWT token (a secure string stored in a cookie) that is automatically attached to every API request.");

h2("The Complete Sign-In Flow");
code(
`1. User visits /account/login
   └─ Options: Email/password  |  Google  |  WeChat (disabled)

2. User submits email + password
   └─ AuthProvider.signInWithPassword()
   └─ → supabase.auth.signInWithPassword()
   └─ Supabase validates → returns a JWT session

3. Session stored in a cookie
   └─ middleware.ts refreshes it on every page visit

4. AuthProvider fetches GET /api/v1/me
   └─ Returns: { role, name, email, phone, wechat_id, avatar_url }
   └─ Sets user state across the whole app

5. User is logged in — cart merges, orders become accessible`
);

h2("Roles & Permissions");
table(
  ["Role", "Who Has It", "What They Can Access"],
  [
    ["user", "Everyone who signs up (default)", "Browse, buy, manage own orders and profile"],
    ["admin", "Manually promoted via SQL", "Everything above + full admin dashboard"],
  ]
);
note("Promoting someone to admin requires one SQL query in Supabase. There is no UI for this yet. See §8 for step-by-step instructions.");

h2("API Security");
body("Every /api/v1/* endpoint checks the Authorization: Bearer <token> header. Three helper functions handle this:");
table(
  ["Helper", "What It Does"],
  [
    ["getAuthUser(req)", "Reads the token, validates it with Supabase, returns { userId, role }"],
    ["requireAuth(req)", "Same — returns HTTP 401 if no valid token is present"],
    ["requireAdmin(req)", "Same — returns HTTP 403 if the user's role isn't 'admin'"],
  ]
);

h2("Cart & Session Isolation");
body("When a user signs out, their cart is immediately cleared — both from memory and from localStorage — so the next person using the same device does not see someone else's items. When a user signs in, any guest cart items are automatically merged into their server-side cart.");

// ── Section 5: Data Flow ──────────────────────────────────────────────────────
h1("5. How Data Flows");

h2("The Architecture in One Diagram");
code(
` BROWSER                        NEXT.JS SERVER              SUPABASE
 ──────────────────────────────  ─────────────────────────   ──────────
 React Component
    ↓ calls
 lib/repository.ts
    ↓ fetch() + JWT token
                                 /api/v1/* route handler
                                   ↓ requireAuth() checks token
                                   ↓ supabase admin client
                                                               DB query
                                                               ↑ rows
                                   ↑ maps rows → DTOs
                                   ↑ JSON response
    ↑ typed result (Product, Order…)
 Component re-renders`
);

h2("Example: Placing an Order");
code(
`1. CHECKOUT FORM (browser)
   User fills in: name, phone, address, community pickup
   Zod validates all required fields

2. SUBMIT  →  POST /api/v1/orders
   Body: { items: [{productId, quantity}], name, phone… }
   Header: Authorization: Bearer <jwt>

3. SERVER VALIDATES
   ✓ requireAuth() — confirms a valid logged-in user
   ✓ Fetches ALL product prices from the DATABASE
     (client-supplied prices are ignored — prevents tampering)
   ✓ Checks every productId exists — 409 if any are missing
   ✓ Calculates totals server-side
   ✓ Generates a unique order ID (idempotency-safe)

4. DATABASE WRITES
   INSERT orders + order_items
   DELETE cart_items (cart is cleared)
   INSERT activities (type='PLACE_ORDER')

5. RESPONSE: 201 Created + full Order object

6. BROWSER: clear cart → redirect to /order/confirmed/[id]`
);
note("Security: Prices are always read from the database at checkout — the browser never sets the price. A malicious user cannot modify the request body to pay less.");

// ── Section 6: Key Features ───────────────────────────────────────────────────
h1("6. Key Features");

h2("Storefront (Public — No Account Required)");
table(
  ["Page", "What It Does"],
  [
    ["Home (/)", "Hero banner, popular products carousel, new arrivals, category tiles, trust bar"],
    ["Shop (/shop)", "Full catalogue with price/dietary filters and sort options"],
    ["Category (/category/[slug])", "Same as Shop, pre-filtered to one category"],
    ["Product Detail (/product/[slug])", "Images, description, dietary tags, stock status, Add to Cart, info tabs"],
    ["Cart (/cart)", "Line items with quantity controls, subtotal, delivery fee, total"],
    ["Checkout (/checkout)", "Contact info, community pickup, address, payment section"],
    ["Order Confirmed (/order/confirmed/[id])", "Confirmation page with order ID and summary"],
  ]
);

h2("Account (Sign-In Required)");
table(
  ["Page", "What It Does"],
  [
    ["Login (/account/login)", "Email/password form, Google OAuth button, WeChat button (disabled)"],
    ["Account Home (/account)", "Welcome screen, links to orders, saved items, sign out"],
    ["Order History (/account/orders)", "All past orders, expandable to see line items and status"],
  ]
);

h2("Admin Dashboard (Requires admin Role)");
table(
  ["Page", "What It Does"],
  [
    ["Dashboard (/admin)", "Stats cards, 7-day orders trend chart, revenue by category chart"],
    ["Orders (/admin/orders)", "All orders with inline status editing (Confirmed → Processing → Completed)"],
    ["Products (/admin/products)", "Full catalogue with create/edit dialog and delete confirmation"],
    ["Users (/admin/users)", "All users with email, phone, order count, total spent"],
    ["Activity Feed (/admin/activity)", "Chronological log of all actions: sign-ins, cart adds, orders, edits"],
  ]
);

// ── Section 7: Database ───────────────────────────────────────────────────────
h1("7. Database Schema");
note("Plain-English summary: Think of each database table as a spreadsheet. Tables are linked together through shared IDs — just like a pivot table in Excel.");

h2("Tables at a Glance");
table(
  ["Table", "What It Stores"],
  [
    ["profiles", "Extra info about each user (name, phone, WeChat ID, role)"],
    ["categories", "The 8 product categories (Fresh Meat, Eggs & Dairy, Snacks…)"],
    ["products", "The full product catalogue (name EN+ZH, price, stock, dietary tags)"],
    ["carts", "One cart row per signed-in user"],
    ["cart_items", "The individual products in each cart (product ID + quantity)"],
    ["orders", "Every placed order (subtotal, delivery fee, status, address)"],
    ["order_items", "Line items within each order (price at time of purchase + qty)"],
    ["activities", "Immutable audit log of every user action"],
  ]
);

h2("Relationships");
code(
`auth.users ─ 1:1 ──▶ profiles
auth.users ─ 1:1 ──▶ carts ─ 1:many ──▶ cart_items ──▶ products
auth.users ─ 1:many ──▶ orders ─ 1:many ──▶ order_items ──▶ products
products ──▶ categories
auth.users ─ 1:many ──▶ activities`
);

h2("Important Details");
bullet("Prices are stored as integer cents — 1999 means $19.99 (avoids floating-point rounding errors)");
bullet("Order items snapshot the price at purchase time — if a price changes later, old orders are unaffected");
bullet("Dietary tags are stored as comma-delimited text — e.g., 'VEGAN,ORGANIC'");
bullet("cart_items has a unique constraint on (cart_id, product_id) — quantities are merged, not duplicated");
bullet("Run npm run seed once per fresh Supabase project to load categories and products");

// ── Section 8: Local Setup ────────────────────────────────────────────────────
h1("8. Running It Locally");

h2("Prerequisites");
bullet("Node.js 18 or newer — check with: node --version");
bullet("A Supabase project (free tier works) — app.supabase.com");
bullet("The repository cloned to your machine");

h2("Step-by-Step");

h3("Step 1 — Install Dependencies");
code("npm install");

h3("Step 2 — Create Your Environment File");
body("Create a file called .env.local in the project root:");
code(
`NEXT_PUBLIC_WECHAT_ENABLED=false

# From your Supabase project → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co/
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...`
);
note("Finding these values: In the Supabase dashboard → Settings → API. 'Project URL' is SUPABASE_URL, the 'anon public' key is PUBLISHABLE_KEY, and 'service_role' key is SERVICE_ROLE_KEY.");

h3("Step 3 — Seed the Database");
body("Loads 8 categories and 36 products into your Supabase project. Only needs to run once.");
code("npm run seed");

h3("Step 4 — Start the Development Server");
code("npm run dev\n# Visit http://localhost:3000");

h3("Step 5 — Verify Everything Is Working");
code(`curl http://localhost:3000/api/v1/health\n# Expected: {"status":"ok","supabase":{"reachable":true,...}}`);
note("If you see a 500 error mentioning SUPABASE_SERVICE_ROLE_KEY, double-check your .env.local file.");

h2("Step 6 — Promoting Yourself to Admin (Optional)");
body("Open the Supabase dashboard → SQL Editor and run:");
code(
`-- Find your user ID
SELECT id, email FROM auth.users;

-- Promote yourself
UPDATE profiles SET role = 'admin'
WHERE user_id = 'paste-your-uuid-here';`
);
body("Then sign in and visit http://localhost:3000/admin");

// ── Section 9: Testing ────────────────────────────────────────────────────────
h1("9. Testing");

h2("Running Tests");
code(
`npm test              # Run all 65 tests once
npm run test:watch    # Re-runs on every file save`
);

h2("What's Tested");
table(
  ["Category", "Files", "Approx. Count"],
  [
    ["API route handlers", "api/__tests__/*.test.ts", "~40 tests"],
    ["React components", "providers/__tests__/*.tsx, admin/__tests__/*.tsx", "~15 tests"],
    ["Repository / data layer", "lib/__tests__/repository.test.ts", "~10 tests"],
  ]
);

h2("How the Test Setup Works");
body("Tests run in a simulated browser environment (jsdom) — no real browser needed. All HTTP calls are intercepted by MSW (Mock Service Worker), which returns fixture data instead of hitting a real server. Supabase is fully mocked so tests don't need a database connection.");
code(
`Test runs
  ↓ renders React component
  ↓ component calls fetch() or supabase.*
  ↓ MSW intercepts → returns fixture JSON
  ↓ assertion checks the rendered output`
);

// ── Section 10: i18n ──────────────────────────────────────────────────────────
h1("10. Internationalisation (EN/ZH)");

h2("How It Works");
body("All visible text is stored in a flat dictionary at src/i18n/strings.ts. Every key has both an English and a Chinese value:");
code(
`"product.addToCart": { en: "Add to Cart", zh: "加入购物车" },
"nav.shop":          { en: "Shop",         zh: "商店" },`
);
body("Components access strings via the useLanguage() hook:");
code(
`const { t, locale } = useLanguage();
<button>{t("product.addToCart")}</button>
// Renders "Add to Cart" (EN) or "加入购物车" (ZH) depending on locale`
);
body("The toggle pill in the navbar switches locales instantly. The preference is saved in localStorage so it persists between visits.");

h2("Adding New Text");
bullet("Add a new key to src/i18n/strings.ts with both en and zh values");
bullet("Use t(\"your.new.key\") in your component");
bullet("If the key is missing, a warning is logged in development mode");
bullet("Price formatting adapts to locale: $19.99 (EN) vs ¥19.99 (ZH)");

// ── Section 11: Limitations ───────────────────────────────────────────────────
h1("11. Known Limitations & Roadmap");

body("The project is an MVP — it works end-to-end, but some features are intentionally incomplete:");

table(
  ["Feature", "Status", "Notes"],
  [
    ["Search", "Not implemented", "Search bar is visible but does nothing"],
    ["Saved Items (Wishlist)", "Not implemented", "Link exists in the account menu"],
    ["WeChat OAuth", "Disabled", "Code exists; set NEXT_PUBLIC_WECHAT_ENABLED=true when ready"],
    ["Product image upload", "URL only", "Admin form accepts a URL; no file picker"],
    ["Email notifications", "Not implemented", "No order confirmation email sent"],
    ["Admin role promotion UI", "Not implemented", "Requires manual SQL (see §8)"],
    ["Payment processing", "Visual only", "Checkout form does not charge anyone"],
    ["Pagination", "Not implemented", "All data loads at once (fine for MVP scale)"],
  ]
);

h2("Seed Data Note");
note("The static data file (src/data/products.ts) has 74 products, but only 36 are seeded to the database. Products not in the database will return a 409 error at checkout. Always run npm run seed after setting up a new Supabase project.");

// ── Appendix ──────────────────────────────────────────────────────────────────
h1("Appendix — Useful Commands & Environment Variables");

h2("All Available Commands");
table(
  ["Command", "What It Does"],
  [
    ["npm run dev", "Start local development server at http://localhost:3000"],
    ["npm test", "Run all 65 tests once"],
    ["npm run test:watch", "Run tests in watch mode (re-runs on save)"],
    ["npm run lint", "Run ESLint across the codebase"],
    ["npx tsc --noEmit", "TypeScript type-check (no output files generated)"],
    ["npm run seed", "Seed categories and products into Supabase"],
    ["npm run build", "Build for production"],
    ["npm start", "Start the production server"],
  ]
);

h2("Environment Variables Reference");
table(
  ["Variable", "Required", "Where to Find It"],
  [
    ["NEXT_PUBLIC_SUPABASE_URL", "Yes", "Supabase → Settings → API → Project URL"],
    ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "Yes", "Supabase → Settings → API → anon public key"],
    ["SUPABASE_SERVICE_ROLE_KEY", "Yes (server only)", "Supabase → Settings → API → service_role key"],
    ["NEXT_PUBLIC_WECHAT_ENABLED", "No", "Set to true only when WeChat OAuth is fully configured"],
  ]
);
note("SECURITY: SUPABASE_SERVICE_ROLE_KEY bypasses Row-Level Security — it is server-side only and must NEVER be exposed to the browser. Variables prefixed with NEXT_PUBLIC_ are visible in the browser bundle — never put secrets there.");

// ── Footer on every page ─────────────────────────────────────────────────────
const totalPages = doc.bufferedPageRange().count;
for (let i = 0; i < totalPages; i++) {
  doc.switchToPage(i);
  if (i === 0) continue; // skip cover
  doc.moveTo(50, doc.page.height - 40).lineTo(PW - 50, doc.page.height - 40)
     .strokeColor(C.border).lineWidth(0.5).stroke();
  doc.fillColor(C.muted).fontSize(8).font("Helvetica")
     .text("Tuangou Developer Onboarding Guide  ·  v0.1.0  ·  June 2026", 50, doc.page.height - 30, { align: "left", width: COL - 40 });
  doc.fillColor(C.muted).fontSize(8).font("Helvetica")
     .text(`Page ${i} of ${totalPages - 1}`, 50, doc.page.height - 30, { align: "right", width: COL });
}

doc.end();

stream.on("finish", () => {
  console.log(`✓ PDF written to ${OUTPUT}`);
});
stream.on("error", (err) => {
  console.error("PDF write error:", err);
  process.exit(1);
});
