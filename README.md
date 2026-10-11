# ⚡ UZO ELEKTRO MARKET

Professional elektr asboblari va qurilish jihozlari uchun to'liq e-commerce do'koni — **Next.js + TypeScript + Tailwind CSS**.

---

## ⚡ Tez boshlash

```bash
git clone ...
cd grand-watch-shop
npm install
npm run dev
```

Brauzerda `http://localhost:3000` ni oching.

---

## 🔐 Admin paneliga kirish

`http://localhost:3000/admin`

| Telefon / Email | Parol |
|---|---|
| Admin telefon raqami (`.env` dagi) | `.env` dagi `NEXT_PUBLIC_ADMIN_PASSWORD` |

---

## 📁 Sahifalar

| Sahifa | URL |
|--------|-----|
| Bosh sahifa | `/` |
| Katalog | `/products` |
| Mahsulot | `/products/[slug]` |
| Kategoriya | `/categories/[slug]` |
| Qidiruv | `/search?q=...` |
| Savatcha | `/cart` |
| Sevimlilar | `/wishlist` |
| Checkout | `/checkout` |
| Login | `/login` |
| Ro'yxatdan o'tish | `/register` |
| Profil | `/profile` |
| Buyurtmalar | `/orders` |
| Admin | `/admin` |

---

## 🛠️ Supabase ulash (ixtiyoriy)

1. [supabase.com](https://supabase.com) da loyiha yarating
2. `supabase/schema.sql` ni SQL Editor da ishga tushiring
3. `.env.local` faylini to'ldiring:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

4. Storage buckets yarating: `product-images`, `category-images`, `slider-images`

---

## 🏗️ Texnologiyalar

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (ixtiyoriy: auth, db, storage)
- **localStorage** (asosiy: cart, wishlist, products, orders, admins)
- **Recharts** (admin grafiklari)
- **Lucide React** (ikonlar)

---

## 🚀 Vercel deploy

```bash
npm run build  # local test
```

Vercel ga deploy: GitHub ga push → Vercel import → deploy.

Environment variables ni Vercel dashboard da kiriting.

---

## 📞 Aloqa

UZO ELEKTRO MARKET © 2025
