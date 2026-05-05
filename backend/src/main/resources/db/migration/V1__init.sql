-- =============================================================================
-- V1__init.sql -- tuangou shop schema (Supabase Postgres `public` schema)
-- =============================================================================
-- Notes:
--   * `auth.users` is the Supabase Auth managed table; `profiles` is our
--     extension and is auto-populated via the `on_auth_user_created` trigger.
--   * RLS is enabled on every public table as defense-in-depth. The Spring
--     backend connects with the service-role and bypasses RLS, but the
--     policies still need to make sense for a future direct-from-browser read.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users) ---------------------------------------------
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id       UUID PRIMARY KEY,
    nickname      TEXT,
    avatar_url    TEXT,
    locale        TEXT NOT NULL DEFAULT 'en',
    role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at  TIMESTAMPTZ
);

-- ---------------------------------------------------------------------------
-- addresses (per-user shipping/pickup destinations) -------------------------
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.addresses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL,
    label       TEXT,
    line1       TEXT NOT NULL,
    line2       TEXT,
    community   TEXT,
    city        TEXT,
    postal_code TEXT,
    is_default  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS addresses_user_idx ON public.addresses (user_id);

-- ---------------------------------------------------------------------------
-- categories (the 8 storefront groups) --------------------------------------
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    slug         TEXT PRIMARY KEY,
    name_en      TEXT NOT NULL,
    name_zh      TEXT NOT NULL,
    icon_name    TEXT NOT NULL,
    blurb_en     TEXT,
    blurb_zh     TEXT,
    sort_order   INTEGER NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- products ------------------------------------------------------------------
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id              TEXT PRIMARY KEY,
    slug            TEXT NOT NULL UNIQUE,
    name_en         TEXT NOT NULL,
    name_zh         TEXT NOT NULL,
    description_en  TEXT,
    description_zh  TEXT,
    price_cents     INTEGER NOT NULL CHECK (price_cents >= 0),
    pack_size_en    TEXT,
    pack_size_zh    TEXT,
    stock_status    TEXT NOT NULL DEFAULT 'IN_STOCK'
                       CHECK (stock_status IN ('IN_STOCK', 'LIMITED', 'OUT_OF_STOCK')),
    stock_count     INTEGER NOT NULL DEFAULT 0,
    is_new          BOOLEAN NOT NULL DEFAULT FALSE,
    dietary_tags    TEXT NOT NULL DEFAULT '',
    image_url       TEXT,
    category_slug   TEXT NOT NULL REFERENCES public.categories(slug),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products (category_slug);
CREATE INDEX IF NOT EXISTS products_slug_idx ON public.products (slug);

-- ---------------------------------------------------------------------------
-- carts + cart_items (1 cart per user) --------------------------------------
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.carts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id     UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id  TEXT NOT NULL REFERENCES public.products(id),
    quantity    INTEGER NOT NULL CHECK (quantity > 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (cart_id, product_id)
);
CREATE INDEX IF NOT EXISTS cart_items_cart_idx ON public.cart_items (cart_id);

-- ---------------------------------------------------------------------------
-- orders + order_items ------------------------------------------------------
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id                    TEXT PRIMARY KEY,
    user_id               UUID,
    guest_name            TEXT,
    subtotal_cents        INTEGER NOT NULL,
    delivery_fee_cents    INTEGER NOT NULL DEFAULT 0,
    total_cents           INTEGER NOT NULL,
    status                TEXT NOT NULL DEFAULT 'CONFIRMED'
                            CHECK (status IN ('CONFIRMED','PROCESSING','COMPLETED','CANCELLED')),
    pickup_community_en   TEXT,
    pickup_community_zh   TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS orders_user_idx ON public.orders (user_id);

CREATE TABLE IF NOT EXISTS public.order_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id  TEXT NOT NULL,
    name_en     TEXT NOT NULL,
    name_zh     TEXT NOT NULL,
    image_url   TEXT,
    unit_price_cents INTEGER NOT NULL,
    quantity    INTEGER NOT NULL CHECK (quantity > 0)
);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- activities (event log: SIGN_IN, ADD_TO_CART, PLACE_ORDER, etc.) ------------
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activities (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type        TEXT NOT NULL,
    user_id     UUID,
    anon_id     TEXT,
    meta        JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS activities_user_idx ON public.activities (user_id);
CREATE INDEX IF NOT EXISTS activities_type_idx ON public.activities (type);
CREATE INDEX IF NOT EXISTS activities_created_idx ON public.activities (created_at DESC);

-- ---------------------------------------------------------------------------
-- Row-Level Security --------------------------------------------------------
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities  ENABLE ROW LEVEL SECURITY;

-- Public read of catalog (`authenticated` is a Supabase built-in role; we use
-- `pg_authid` membership check via to_regrole to avoid errors in non-Supabase
-- environments where the role does not exist).
DO $$
BEGIN
  IF to_regrole('authenticated') IS NOT NULL THEN
    EXECUTE 'CREATE POLICY categories_select_authenticated ON public.categories
             FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY products_select_authenticated ON public.products
             FOR SELECT TO authenticated USING (true)';
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- Trigger: auto-create a profile row on auth.users insert -------------------
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('auth.users') IS NOT NULL THEN
    EXECUTE $f$
      CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
      RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $body$
      BEGIN
        INSERT INTO public.profiles (user_id, nickname, avatar_url, role)
        VALUES (NEW.id,
                COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
                NEW.raw_user_meta_data->>'avatar_url',
                'user')
        ON CONFLICT (user_id) DO NOTHING;
        RETURN NEW;
      END;
      $body$;
    $f$;

    EXECUTE 'DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users';
    EXECUTE 'CREATE TRIGGER on_auth_user_created
             AFTER INSERT ON auth.users
             FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user()';
  END IF;
END
$$;
