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
-- UZO ELEKTRO MARKET SEED DATA (Clean User Data)

DELETE FROM product_images;
DELETE FROM products;
INSERT INTO categories (id, name, slug, description, image_url, is_active) VALUES ('d6971497-de38-c496-2c13-c80e7c4cba03', 'Erkaklar soatlari', 'erkaklar-soatlari', 'Premium erkaklar qo''l soatlari — xrom, po''lat, charm va oltin qoplamali nufuzli modellar', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, description, image_url, is_active) VALUES ('63e89563-ed97-e3dd-90e2-8fb4d29f36e7', 'Ayollar soatlari', 'ayollar-soatlari', 'Nafis va hashamatli ayollar soatlari — yaltiroq toshlar va nafis bilaguzuklar bilan', 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?q=80&w=800&auto=format&fit=crop', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, description, image_url, is_active) VALUES ('118dee4b-db4d-e74d-7eeb-2264e986b373', 'Mexanik & Avtomatik', 'mexanik-soatlar', 'Avtomatik zaryadlanuvchi va ochiq skelet mexanizmli elit soatlar', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, description, image_url, is_active) VALUES ('84d75ece-80cd-79e1-e6d8-058603151218', 'Kvars soatlari', 'kvars-soatlari', 'Batareya asosida ishlaydigan yuqori aniqlikdagi zamonaviy qo''l soatlari', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, description, image_url, is_active) VALUES ('5d0c6b4d-072b-e8cc-e434-809c655695be', 'Shveytsariya soatlari (Swiss Made)', 'shveytsariya-soatlari', 'Dunyoga mashhur Swiss Made rasmiy sertifikatiga ega afsonaviy brendlar', 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800&auto=format&fit=crop', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO categories (id, name, slug, description, image_url, is_active) VALUES ('d56611a2-145f-66a5-9055-35487ba4d3be', 'Tasmalari va Aksessuarlar', 'aksessuarlar', 'Tabiiy charm tasmalar, po''lat bilaguzuklar va soat saqlovchi premium qutilar', 'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?q=80&w=800&auto=format&fit=crop', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, slug, description, price, old_price, discount, category_id, brand, stock, sku, rating, reviews_count, image, is_active, is_featured, is_new, specifications) VALUES ('8393ae41-ba08-9c36-f48a-995977927c29', 'Rolex Submariner Date 41mm Oystersteel', 'rolex-submariner-date-41mm', 'Rolex Submariner Date — soatsozlik olamidagi afsona. 41mm Oystersteel zanglamas korpus, qora Cerachrom keramik bezel va qora siferblat. Kalibr 3235 avtomatik mexanizm, 70 soatlik quvvat zaxirasi va 300 metrgacha suvga chidamlilik. To''liq original komplektatsiya, rasmiy xalqaro kafolat kartasi bilan.', 145000000, 160000000, 9, 'd6971497-de38-c496-2c13-c80e7c4cba03', 'Rolex', 2, 'RLX-126610LN', 5, 28, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop', true, false, true, '{"Korpus o''lchami":"41 mm","Korpus materiali":"Oystersteel (904L zanglamas po''lat)","Mexanizm":"Rolex Calibre 3235 (Avtomatik)","Shisha turi":"Qirrali Sapfir kristal","Suvga chidamlilik":"300 metr / 1000 fut","Kafolat":"5 yil rasmiy xalqaro"}'::jsonb) ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, slug, description, price, old_price, discount, category_id, brand, stock, sku, rating, reviews_count, image, is_active, is_featured, is_new, specifications) VALUES ('f2122729-4b8f-1500-12f0-fbb48a10dfea', 'Patek Philippe Nautilus 5711/1A Blue Dial', 'patek-philippe-nautilus-5711-blue', 'Patek Philippe Nautilus — hashamatli sport klassikasining eng oliy cho''qqisi. Gerald Genta tomonidan yaratilgan 40mm porloq po''lat korpus va gorizontal naqshli moviy siferblat. Kalibr 26-330 S C nozik avtomatik mexanizmi va shaffof sapfir orqa qopqoq.', 380000000, 410000000, 7, '5d0c6b4d-072b-e8cc-e434-809c655695be', 'Patek Philippe', 1, 'PP-5711-1A', 5, 14, 'https://images.unsplash.com/photo-1547996160-71dfa6309697?q=80&w=800&auto=format&fit=crop', true, false, true, '{"Korpus o''lchami":"40 mm","Korpus":"Zanglamas po''lat","Mexanizm":"Caliber 26-330 S C (Avtomatik)","Zaxira":"45 soat","Suvga chidamlilik":"120 metr"}'::jsonb) ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, slug, description, price, old_price, discount, category_id, brand, stock, sku, rating, reviews_count, image, is_active, is_featured, is_new, specifications) VALUES ('d13f8f54-4658-4a14-5b6d-dbfe024db2bc', 'Cartier Santos de Cartier Large Model', 'cartier-santos-large-model', 'Cartier Santos — aviatsiya tarixidagi ilk erkaklar qo''l soati. O''ziga xos kvadrat korpus, ochiq vintlar va tez almashtiriladigan QuickSwitch tasma tizimi. Po''lat bilaguzuk va qo''shimcha buzoq charmidan tasma bilan taqdim etiladi.', 92000000, 98000000, 6, 'd6971497-de38-c496-2c13-c80e7c4cba03', 'Cartier', 3, 'CRT-WSSA0018', 4.9, 19, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop', true, false, true, '{"Korpus o''lchami":"39.8 mm x 47.5 mm","Mexanizm":"1847 MC Avtomatik","Material":"Yuqori sifatli po''lat","Tasma":"SmartLink po''lat + Charm","Suvga chidamlilik":"100 metr"}'::jsonb) ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, slug, description, price, old_price, discount, category_id, brand, stock, sku, rating, reviews_count, image, is_active, is_featured, is_new, specifications) VALUES ('49eabd0c-bde4-8784-9603-753812309277', 'Omega Seamaster Diver 300M Co-Axial Master', 'omega-seamaster-diver-300m', 'Omega Seamaster 300M — Jeyms Bond tanlagan soat. Lazer bilan o''yilgan to''lqinsimon keramika siferblat, Co-Axial Master Chronometer 8800 antimagnit mexanizm. 15,000 Gaussgacha magnit maydonga chidamli METAS sertifikati.', 75000000, 82000000, 8, '118dee4b-db4d-e74d-7eeb-2264e986b373', 'Omega', 4, 'OMG-21030422001001', 4.9, 22, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop', true, false, false, '{"Korpus":"42 mm Zanglamas po''lat","Bezel":"Qora keramik","Mexanizm":"Omega 8800 Co-Axial","Quvvat zaxirasi":"55 soat","Suvga chidamlilik":"300 metr"}'::jsonb) ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, slug, description, price, old_price, discount, category_id, brand, stock, sku, rating, reviews_count, image, is_active, is_featured, is_new, specifications) VALUES ('184bb580-53a8-f151-afdf-730f0ccfbaec', 'Tissot PRX Powermatic 80 Blue Dial 40mm', 'tissot-prx-powermatic-80-blue', 'Tissot PRX Powermatic 80 — 1978-yilgi klassik dizaynning zamonaviy qayta tug''ilishi. Integratsiyalashgan po''lat bilaguzuk, gofrlangan to''rtburchak naqshli siferblat va 80 soatlik ulkan quvvat zaxirasiga ega Nivachron mexanizmi.', 9800000, 11500000, 15, '5d0c6b4d-072b-e8cc-e434-809c655695be', 'Tissot', 7, 'TIS-T1374071104100', 4.8, 35, 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800&auto=format&fit=crop', true, false, true, '{"Korpus":"40 mm Po''lat 316L","Mexanizm":"Powermatic 80.111 (Swiss Made)","Quvvat zaxirasi":"80 soat","Shisha":"Antirefleks sapfir","Suvga chidamlilik":"100 metr"}'::jsonb) ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, slug, description, price, old_price, discount, category_id, brand, stock, sku, rating, reviews_count, image, is_active, is_featured, is_new, specifications) VALUES ('ab87b4a5-6d64-45e5-16d4-5da6248eac32', 'Cartier Ballon Bleu de Cartier 33mm (Ayollar)', 'cartier-ballon-bleu-33mm-ladies', 'Cartier Ballon Bleu — ayollik va noziklik timsoli. Dumaloq korpusga joylashtirilgan ko''k sapfir kaboshon toji, Rim raqamlari va ko''k po''lat strelkalar. Kundalik kiyish uchun ham, oqshom liboslari uchun ham tengsiz go''zallik.', 78000000, 85000000, 8, '63e89563-ed97-e3dd-90e2-8fb4d29f36e7', 'Cartier', 3, 'CRT-WSBB0044', 5, 17, 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?q=80&w=800&auto=format&fit=crop', true, false, true, '{"Korpus o''lchami":"33 mm","Korpus":"Zanglamas po''lat","Mexanizm":"Avtomatik Kalibr Cartier","Qoplama":"Sapfir shisha","Suvga chidamlilik":"30 metr"}'::jsonb) ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, slug, description, price, old_price, discount, category_id, brand, stock, sku, rating, reviews_count, image, is_active, is_featured, is_new, specifications) VALUES ('5d35ec26-33b0-4db8-d554-f17b63d9c4bc', 'Seiko Presage Cocktail Time Automatic', 'seiko-presage-cocktail-time', 'Seiko Presage Cocktail Time — yapon san''ati va barmenlik san''atining uyg''unligi. Nur taratuvchi quyosh nuri naqshli go''zal siferblat, Hardlex gumbazsimon shisha va Seiko 4R35 ishonchli avtomatik mexanizmi.', 6200000, 7200000, 14, '84d75ece-80cd-79e1-e6d8-058603151218', 'Seiko', 6, 'SEI-SRPB43J1', 4.9, 41, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop', true, false, false, '{"Korpus o''lchami":"40.5 mm","Mexanizm":"Seiko 4R35 (23 toshli avtomatik)","Tasma":"Tabiiy yaltiroq qora charm","Suvga chidamlilik":"50 metr"}'::jsonb) ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, slug, description, price, old_price, discount, category_id, brand, stock, sku, rating, reviews_count, image, is_active, is_featured, is_new, specifications) VALUES ('ad673b27-dc14-f2e3-3e07-27ff2dcba60b', 'Casio Edifice Sapphire Solar Chronograph', 'casio-edifice-sapphire-solar', 'Casio Edifice — yapon yuqori aniqligi va avtosport ruhi. Quyosh batareyasi bilan doimiy quvvatlanuvchi Tough Solar tizimi, tirnalishga chidamli sapfir shisha va xronograf funksiyasi.', 2800000, 3300000, 15, '84d75ece-80cd-79e1-e6d8-058603151218', 'Casio Edifice', 12, 'CSO-EFS-S570DB', 4.8, 31, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop', true, false, true, '{"Korpus":"Yupqa 9.7mm po''lat korpus","Quvvat turi":"Tough Solar (Quyosh energiyasi)","Shisha":"Sapfir kristall","Xususiyatlar":"Xronograf, sana, batareya darajasi","Suvga chidamlilik":"100 metr"}'::jsonb) ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, name, slug, description, price, old_price, discount, category_id, brand, stock, sku, rating, reviews_count, image, is_active, is_featured, is_new, specifications) VALUES ('724c3cfa-c62a-8f2f-45e3-528e4c8c9048', 'Premium Alligator charm tasma (20mm / 22mm)', 'premium-alligator-charm-tasma', 'Italiya tabiiy charm uslubidagi sifatli soat tasmasi. Har qanday klassik va sport soatlarini yangilash uchun ajoyib yechim. Zanglamas po''lat qisqich va tez almashtirish pinlari bilan.', 650000, 850000, 23, 'd56611a2-145f-66a5-9055-35487ba4d3be', 'Timeless Gallery', 20, 'TML-STRAP-01', 4.9, 15, 'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?q=80&w=800&auto=format&fit=crop', true, false, true, '{"Kengligi":"20 mm va 22 mm","Material":"Yuqori sifatli tabiiy charm","Qisqich":"316L Po''lat butterfly clasp","Rang":"Klassik qora / To''q jigarrang"}'::jsonb) ON CONFLICT (id) DO NOTHING;
INSERT INTO sliders (id, title, subtitle, image_url, button_text, link, sort_order, is_active) VALUES ('s1', 'Timeless — The Watch Gallery', 'Vaqtni qadrlaydiganlar uchun hashamatli va original soatlar to''plami.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1920&auto=format&fit=crop', 'Kolleksiyani ko''rish', '/products', 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO sliders (id, title, subtitle, image_url, button_text, link, sort_order, is_active) VALUES ('s2', 'Shveytsariya va Yaponiya San''ati', 'Oliy toifadagi mexanika, sapfir shisha va asrlar davomida shakllangan mukammal aniqlik.', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1920&auto=format&fit=crop', 'Mexanik soatlar', '/categories/mexanik-soatlar', 2, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO sliders (id, title, subtitle, image_url, button_text, link, sort_order, is_active) VALUES ('s3', 'Eksklyuziv Erkaklar va Ayollar To''plami', 'Har bir lahzangizga o''zgacha hashamat va joziba baxsh etuvchi dizayn.', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1920&auto=format&fit=crop', 'Barcha modellar', '/products', 3, true) ON CONFLICT (id) DO NOTHING;
