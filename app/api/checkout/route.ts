import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function escapeHtml(str: string | number | undefined | null) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatPrice(p: number) {
  return Math.round(p || 0)
    .toLocaleString("en-US")
    .replace(/,/g, " ");
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Global navbat: bir vaqtning o'zida bir nechta mijoz buyurtma berganda
// xabarlar va rasmlar Telegram'ga qat'iy ketma-ket, aralashmasdan tushishini ta'minlaydi
let globalTelegramQueue: Promise<void> = Promise.resolve();

function enqueueTelegramTask(task: () => Promise<void>): Promise<void> {
  const next = globalTelegramQueue.then(async () => {
    try {
      await task();
      await sleep(300); // Har bir buyurtma orasida Telegram limitlari uchun tanaffus
    } catch (e) {
      console.error("Telegram queue execution error:", e);
    }
  });
  globalTelegramQueue = next;
  return next;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const token = process.env.TELEGRAM_BOT_TOKEN || "8947625307:AAH5kaJPuP85lejCYxhc0bu0-pelpaQOGXo";
    const channelId = process.env.TELEGRAM_CHANNEL_ID || "-1004401871821";
    const admin1 = process.env.TELEGRAM_ADMIN_ID;
    const admin2 = process.env.TELEGRAM_ADMIN_ID_2;

    const orderId =
      data.orderId ||
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `o_${Date.now()}`);
    const orderNumber =
      data.orderNumber || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const items = data.items || [];

    // Har bir buyurtmaga unikal rangli nishon (badge)
    const BADGES = ["🟢", "🔵", "🟣", "🟠", "💎", "⭐", "🔶"];
    const badgeIndex = Math.abs(
      orderNumber.split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0)
    ) % BADGES.length;
    const badge = BADGES[badgeIndex];

    // 1. Supabase-ga server-side buyurtmani saqlash (zaxira va kafolat)
    try {
      const itemsToSave = items.map((it: any) => ({
        id: it.id || it.product_id || "",
        product_id: it.id || it.product_id || "",
        name: it.name || it.product_name || "Mahsulot",
        product_name: it.name || it.product_name || "Mahsulot",
        price: Number(it.price || 0),
        quantity: Number(it.quantity || 1),
        image: it.image || it.product_image || null,
        product_image: it.image || it.product_image || null,
        user_id: data.userId || null,
        note: data.note || null,
      }));

      const { error: dbError } = await supabase.from("orders").upsert({
        id: orderId,
        order_number: orderNumber,
        customer_name: data.fullName || "Mijoz",
        phone: data.phone || "",
        address: data.address || "",
        total_amount: Number(data.total || 0),
        status: "new",
        items: itemsToSave,
        created_at: new Date().toISOString(),
      });

      if (dbError) {
        console.error("Supabase upsert error in checkout route:", dbError);
      }
    } catch (dbErr) {
      console.error("Supabase database exception in checkout route:", dbErr);
    }

    if (!token || token.startsWith("YOUR_")) {
      console.warn("TELEGRAM_BOT_TOKEN not configured.");
      return NextResponse.json({ success: true, orderId, orderNumber });
    }

    let rawOrigin =
      req.headers.get("origin") ||
      req.headers.get("referer") ||
      "https://uzoelektro.uz";

    try {
      const parsed = new URL(rawOrigin);
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        rawOrigin = "https://uzoelektro.uz";
      } else {
        rawOrigin = parsed.origin;
      }
    } catch {
      rawOrigin = "https://uzoelektro.uz";
    }

    const cleanOrigin = rawOrigin.replace(/\/$/, "");

    function getAbsoluteImageUrl(img: string | null | undefined): string | null {
      if (!img) return null;
      const trimmed = img.trim();
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
      }
      const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
      return `${cleanOrigin}${cleanPath}`;
    }

    // Har bir mahsulotni tayyorlash: o'zining rasmlari (1-3 ta) va o'zining single linki
    const preparedItems = items.map((item: any) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.price) || 0;
      const itemTotal = price * qty;

      let link = item.productUrl;
      if (!link && item.slug) {
        link = `${cleanOrigin}/products/${encodeURIComponent(item.slug)}`;
      } else if (!link && item.id) {
        link = `${cleanOrigin}/products/${encodeURIComponent(item.id)}`;
      }
      if (!link) {
        link = cleanOrigin;
      }

      // Faqat shu mahsulotning rasmlari (1 tadan ko'pi bilan 3 tagacha)
      const itemImgs: string[] = [];
      if (Array.isArray(item.images) && item.images.length > 0) {
        for (const im of item.images) {
          const rawUrl = typeof im === "string" ? im : im?.url;
          const abs = getAbsoluteImageUrl(rawUrl);
          if (abs && !itemImgs.includes(abs)) itemImgs.push(abs);
        }
      }
      if (itemImgs.length === 0 && (item.image || item.product_image)) {
        const abs = getAbsoluteImageUrl(item.image || item.product_image);
        if (abs && !itemImgs.includes(abs)) itemImgs.push(abs);
      }

      const limitedImages = itemImgs.slice(0, 3);

      return {
        name: item.name || item.product_name || "Mahsulot",
        quantity: qty,
        price,
        total: itemTotal,
        link,
        images: limitedImages,
      };
    });

    const totalItemCount = preparedItems.reduce((acc: number, it: any) => acc + it.quantity, 0);

    // 1. Asosiy kvitansiya matni (Header)
    const headerText =
      `╔══════════════════════════════════════╗\n` +
      `  ${badge} <b>YANGI BUYURTMA: #${escapeHtml(orderNumber)}</b>\n` +
      `╚══════════════════════════════════════╝\n\n` +
      `👤 <b>Mijoz:</b> ${escapeHtml(data.fullName)}\n` +
      `📞 <b>Telefon:</b> ${escapeHtml(data.phone)}\n` +
            `📍 <b>Manzil:</b> ${escapeHtml(data.address)}\n` +
      (data.location ? `🗺 <b>Xarita:</b> <a href="https://yandex.uz/maps/?pt=${data.location[1]},${data.location[0]}&z=18&l=map">Xaritada ko'rish</a>\n` : "") +
      (data.note ? `📝 <b>Izoh:</b> ${escapeHtml(data.note)}\n` : "") +
      (data.promoCode
        ? `🎟 <b>Promokod:</b> <code>${escapeHtml(data.promoCode)}</code> (-${formatPrice(data.discount || 0)} so'm)\n`
        : "") +
      `\n📦 <b>Buyurtma tarkibi:</b> ${preparedItems.length} xil mahsulot (${totalItemCount} dona)\n` +
      (data.subtotal ? `💰 <b>Oraliq summa:</b> ${formatPrice(data.subtotal)} so'm\n` : "") +
      (data.discount ? `🎟 <b>Chegirma:</b> -${formatPrice(data.discount)} so'm\n` : "") +
      `🚚 <b>Yetkazib berish:</b> ${data.deliveryFee ? formatPrice(data.deliveryFee) + " so'm" : "Bepul"}\n` +
      `💳 <b>JAMI TO'LOV:</b> <b>${formatPrice(data.total)} so'm</b>\n\n` +
      `──────────────────────────────────────\n` +
      `👇 <b>Har bir mahsulot rasmlari va ma'lumotlari alohida:</b>`;

    // 3. Buyurtma yakuni (Footer)
    const footerText =
      `══════════════════════════════════════\n` +
      `🏁 ${badge} <b>#${escapeHtml(orderNumber)} — Buyurtma to'liq yakunlandi</b>\n` +
      `💳 <b>JAMI: ${formatPrice(data.total)} so'm</b> (${preparedItems.length} xil mahsulot)\n` +
      `🌐 <i>Timeless — The Watch Gallery | Rasmiy veb-sayt</i>\n` +
      `══════════════════════════════════════`;

    // Barcha qabul qiluvchilar: kanal va adminlar
    const recipients = Array.from(
      new Set([channelId, admin1, admin2].filter(Boolean))
    ).filter((id) => typeof id === "string" && !id.startsWith("YOUR_"));

    async function sendOrderToChat(chatId: string) {
      // 1. Asosiy kvitansiyani yuborish
      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: headerText,
            parse_mode: "HTML",
          }),
        });
        await sleep(150);
      } catch (err) {
        console.error(`Header send error to ${chatId}:`, err);
      }

      // 2. Har bir mahsulotni ALOHIDA-ALOHIDA (o'zining 1-3 ta rasmi bilan) yuborish
      for (let idx = 0; idx < preparedItems.length; idx++) {
        const item = preparedItems[idx];
        const itemCaption =
          `${badge} <b>#${escapeHtml(orderNumber)} | ${idx + 1}-MAHSULOT (${idx + 1}/${preparedItems.length})</b>\n\n` +
          `🏷 <b>${escapeHtml(item.name)}</b>\n` +
          `▫️ Xarid soni: <b>${item.quantity} dona</b>\n` +
          `▫️ Donasi narxi: <b>${formatPrice(item.price)} so'm</b>\n` +
          `▫️ Jami summasi: <b>${formatPrice(item.total)} so'm</b>\n` +
          `▫️ Saytdagi sahifasi: <a href="${item.link}">🔗 Havola</a>`;

        const images = item.images;
        let sent = false;

        // A) Agar mahsulotda 2 yoki 3 ta rasm bo'lsa -> sendMediaGroup (albom)
        if (images.length > 1) {
          try {
            const media = images.map((url: string, imgIdx: number) => ({
              type: "photo",
              media: url,
              ...(imgIdx === 0 ? { caption: itemCaption, parse_mode: "HTML" } : {}),
            }));

            const res = await fetch(`https://api.telegram.org/bot${token}/sendMediaGroup`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                media,
              }),
            });
            const resJson = await res.json();
            if (resJson.ok) {
              sent = true;
            } else {
              console.warn(`sendMediaGroup failed for item ${idx + 1}:`, resJson.description);
            }
          } catch (e) {
            console.error(`sendMediaGroup error for item ${idx + 1}:`, e);
          }
        }

        // B) Agar 1 ta rasm bo'lsa yoki mediaGroup xatolik bersa -> sendPhoto
        if (!sent && images.length >= 1) {
          try {
            const photoRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                photo: images[0],
                caption: itemCaption,
                parse_mode: "HTML",
              }),
            });
            const photoJson = await photoRes.json();
            if (photoJson.ok) {
              sent = true;
            } else {
              console.warn(`sendPhoto failed for item ${idx + 1}:`, photoJson.description);
            }
          } catch (e) {
            console.error(`sendPhoto error for item ${idx + 1}:`, e);
          }
        }

        // C) Agar rasm bo'lmasa yoki rasm yuklanmasa -> sendMessage
        if (!sent) {
          try {
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: itemCaption,
                parse_mode: "HTML",
              }),
            });
          } catch (e) {
            console.error(`sendMessage error for item ${idx + 1}:`, e);
          }
        }

        await sleep(150);
      }

      // 3. Agar 1 tadan ko'p mahsulot bo'lsa, yakunlovchi chegarani yuborish
      if (preparedItems.length > 1) {
        try {
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: footerText,
              parse_mode: "HTML",
            }),
          });
        } catch (e) {
          console.error(`Footer send error to ${chatId}:`, e);
        }
      }
    }

    // Navbat orqali ketma-ket yuborish: mijozlar buyurtmasi bir-biriga hecham aralashmaydi
    if (recipients.length > 0) {
      await enqueueTelegramTask(async () => {
        await Promise.allSettled(recipients.map((chatId) => sendOrderToChat(chatId as string)));
      });
    }

    return NextResponse.json({ success: true, orderId, orderNumber });
  } catch (err) {
    console.error("Checkout route error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}



