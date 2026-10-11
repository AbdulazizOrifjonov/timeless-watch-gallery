-- =============================================
-- UZO ELEKTRO MARKET — Supabase SQL Schema
-- =============================================

-- PROFILES
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  phone       text,
  address     text,
  role        text default 'customer' check (role in ('customer','moderator','content_admin','super_admin')),
  avatar_url  text,
  created_at  timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users read own profile"  on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

-- CATEGORIES
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  is_active   boolean default true,
  created_at  timestamptz default now()
);
alter table categories enable row level security;
create policy "Public read categories" on categories for select using (true);
create policy "Admin manage categories" on categories for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('super_admin','moderator','content_admin'))
);

-- PRODUCTS
create table if not exists products (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  description     text,
  price           numeric not null default 0,
  old_price       numeric,
  discount        integer,
  category_id     uuid references categories(id),
  brand           text,
  stock           integer default 0,
  sku             text,
  rating          numeric default 0,
  reviews_count   integer default 0,
  image           text,
  specifications  jsonb,
  colors          text[],
  mechanism       text,
  is_active       boolean default true,
  is_new          boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
alter table products enable row level security;
create policy "Public read active products" on products for select using (is_active = true);
create policy "Admin manage products" on products for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('super_admin','moderator','content_admin'))
);

-- PRODUCT IMAGES
create table if not exists product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid references products(id) on delete cascade,
  url         text not null,
  sort_order  integer default 0
);
alter table product_images enable row level security;
create policy "Public read product images" on product_images for select using (true);
create policy "Admin manage product images" on product_images for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('super_admin','moderator','content_admin'))
);

-- SLIDERS
create table if not exists sliders (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  subtitle    text,
  image_url   text not null,
  button_text text,
  link        text,
  sort_order  integer default 0,
  is_active   boolean default true,
  created_at  timestamptz default now()
);
alter table sliders enable row level security;
create policy "Public read active sliders" on sliders for select using (is_active = true);
create policy "Admin manage sliders" on sliders for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('super_admin','moderator','content_admin'))
);

-- ORDERS
create table if not exists orders (
  id           uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id      uuid references profiles(id),
  full_name    text not null,
  phone        text not null,
  address      text not null,
  note         text,
  subtotal     numeric default 0,
  delivery_fee numeric default 0,
  discount     numeric default 0,
  total        numeric default 0,
  status       text default 'new' check (status in ('new','processing','shipped','delivered','cancelled')),
  created_at   timestamptz default now()
);
alter table orders enable row level security;
create policy "Users read own orders" on orders for select using (auth.uid() = user_id);
create policy "Anyone can create order" on orders for insert with check (true);
create policy "Admin read all orders" on orders for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('super_admin','moderator'))
);
create policy "Admin update orders" on orders for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('super_admin','moderator'))
);

-- ORDER ITEMS
create table if not exists order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid references orders(id) on delete cascade,
  product_id    uuid references products(id),
  product_name  text not null,
  product_image text,
  price         numeric not null,
  quantity      integer not null default 1
);
alter table order_items enable row level security;
create policy "Users read own order items" on order_items for select using (
  exists (select 1 from orders where id = order_id and user_id = auth.uid())
);
create policy "Anyone insert order items" on order_items for insert with check (true);
create policy "Admin read all order items" on order_items for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('super_admin','moderator'))
);

-- WISHLISTS
create table if not exists wishlists (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade unique
);
create table if not exists wishlist_items (
  id          uuid primary key default gen_random_uuid(),
  wishlist_id uuid references wishlists(id) on delete cascade,
  product_id  uuid references products(id) on delete cascade,
  unique(wishlist_id, product_id)
);
alter table wishlists enable row level security;
alter table wishlist_items enable row level security;
create policy "Users manage own wishlist" on wishlists for all using (auth.uid() = user_id);
create policy "Users manage own wishlist items" on wishlist_items for all using (
  exists (select 1 from wishlists where id = wishlist_id and user_id = auth.uid())
);

-- Storage buckets (create in Supabase dashboard or via CLI)
-- product-images (public)
-- category-images (public)
-- slider-images (public)
