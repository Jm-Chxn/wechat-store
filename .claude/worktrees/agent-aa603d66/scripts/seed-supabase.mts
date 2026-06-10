// scripts/seed-supabase.mts
//
// Seeds the Supabase `categories` and `products` tables from the same data
// the storefront renders (`src/data/categories.ts` + `src/data/products.ts`).
// Run with:
//
//   node --env-file=.env.local scripts/seed-supabase.mts
//
// Idempotent: re-running is safe because we upsert on the primary keys.
// Designed to fix the "product not found: p_XXX" error at checkout, which
// happens when the storefront falls back to its mock catalog because the
// Supabase `products` table is empty.

import { createClient } from "@supabase/supabase-js";
import { categories } from "../src/data/categories.ts";
import { products } from "../src/data/products.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.\n" +
      "Run me as:\n" +
      "  node --env-file=.env.local scripts/seed-supabase.mts",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const categoryRows = categories.map((c, i) => ({
  slug: c.slug,
  name_en: c.nameEn,
  name_zh: c.nameZh,
  icon_name: c.iconName,
  blurb_en: c.blurbEn ?? null,
  blurb_zh: c.blurbZh ?? null,
  sort_order: (i + 1) * 10,
}));

console.log(`Upserting ${categoryRows.length} categories…`);
const { error: catErr } = await supabase
  .from("categories")
  .upsert(categoryRows, { onConflict: "slug" });
if (catErr) {
  console.error("✗ category upsert failed:", catErr.message);
  process.exit(1);
}
console.log(`✓ categories OK`);

const productRows = products.map((p) => ({
  id: p.id,
  slug: p.slug,
  name_en: p.nameEn,
  name_zh: p.nameZh,
  description_en: p.descriptionEn ?? null,
  description_zh: p.descriptionZh ?? null,
  price_cents: p.price,
  pack_size_en: p.packSizeEn ?? null,
  pack_size_zh: p.packSizeZh ?? null,
  stock_status: p.stockStatus,
  stock_count: p.stockCount,
  is_new: p.isNew,
  // The schema stores `dietary_tags` as a comma-delimited TEXT column; the
  // API mapper splits on `,` when reading. Keep both ends consistent.
  dietary_tags: (p.dietaryTags ?? []).join(","),
  image_url: p.imageUrl ?? null,
  category_slug: p.categorySlug,
}));

console.log(`Upserting ${productRows.length} products…`);
const { error: prodErr, data } = await supabase
  .from("products")
  .upsert(productRows, { onConflict: "id" })
  .select("id");
if (prodErr) {
  console.error("✗ product upsert failed:", prodErr.message);
  process.exit(1);
}

const ids = (data ?? []).map((r) => r.id).sort();
console.log(`✓ products OK — ${ids.length} rows`);
console.log(`  first: ${ids[0]}, last: ${ids[ids.length - 1]}`);

// Sanity-check: confirm the same `p_004` row the checkout request was
// rejecting is now actually present.
const probe = await supabase
  .from("products")
  .select("id, slug, name_en")
  .eq("id", "p_004")
  .single();
if (probe.error) {
  console.error("✗ probe for p_004 failed:", probe.error.message);
  process.exit(1);
}
console.log(`✓ probe: ${probe.data.id} (${probe.data.slug}) — ${probe.data.name_en}`);
console.log("Done.");
