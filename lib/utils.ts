export function formatSom(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " so'm";
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function calcDiscount(price: number, oldPrice?: number | null) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function getProductPublicUrl(slug: string): string {
  const safeSlug = encodeURIComponent(slug);
  const prodDomain = "https://grand-shop-beryl.vercel.app";
  if (typeof window !== "undefined" && window.location.origin) {
    const origin = window.location.origin;
    // Localhost yoki oddiy http bo'lsa Telegram uni ko'k bosiladigan link qilmaydi.
    // Shuning uchun Telegramda bosiladigan (clickable) havola bo'lishi uchun haqiqiy HTTPS domen yuboriladi.
    if (origin.includes("localhost") || origin.includes("127.0.0.1") || !origin.startsWith("https://")) {
      return `${prodDomain}/products/${safeSlug}`;
    }
    return `${origin}/products/${safeSlug}`;
  }
  return `${prodDomain}/products/${safeSlug}`;
}
