import * as dotenv from "dotenv";
dotenv.config();

import { Telegraf, Context } from "telegraf";
import { message } from "telegraf/filters";
import { parseProductText, ParsedProduct } from "./aiParser";
import { insertProduct, uploadImageToSupabase } from "./supabaseClient";
import { createClient } from "@supabase/supabase-js";

const token = process.env.TELEGRAM_BOT_TOKEN || "";
const adminId = process.env.TELEGRAM_ADMIN_ID || "";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key-here"
);

export const bot = new Telegraf(token);

interface PendingProduct {
  mediaGroupId: string;
  messageId: number;
  text: string;
  photoIds: string[];
  photoUniqueId?: string;
  parsed: ParsedProduct | null;
  timer?: any;
}

const pendingGroups = new Map<string, PendingProduct>();

bot.use(async (ctx, next) => {
  // If it's a channel post
  if (ctx.channelPost) {
    return next();
  }

  if (ctx.from) {
    const allowedAdmins = [
      adminId,
      process.env.TELEGRAM_ADMIN_ID,
      process.env.TELEGRAM_ADMIN_ID_2,
    ].filter(Boolean) as string[];

    const userIdStr = ctx.from.id.toString();
    console.log(`[Telegram Bot] Xabar keldi: User ID ${userIdStr} (@${ctx.from.username || "no_user"})`);

    if (!allowedAdmins.includes(userIdStr)) {
      console.warn(`[Telegram Bot] Ruxsat yo'q: User ID ${userIdStr}`);
      if (ctx.message) {
        await ctx.reply(`⚠️ Kirish taqiqlandi.\nSizning Telegram ID raqamingiz: ${userIdStr}\n\nUshbu ID ni bot adminlari ro'yxatiga qo'shish kerak.`);
      }
      return;
    }
  }
  return next();
});

bot.start((ctx) => ctx.reply("Salom! Menga mahsulot rasmi va ma'lumotlarini yuboring yoki forward qiling. Men ularni avtomatik tarzda analiz qilib, saytga joylayman!"));

// Foydalanuvchi yoki guruhdan yuborilgan rasm
bot.on(message("photo"), async (ctx) => {
  const mediaGroupId = ctx.message.media_group_id || `single_${ctx.message.message_id}`;
  const photos = ctx.message.photo;
  const bestPhoto = photos[photos.length - 1];
  const uniqueId = bestPhoto.file_unique_id;
  const text = ctx.message.caption || "";

  if (pendingGroups.has(mediaGroupId)) {
    const group = pendingGroups.get(mediaGroupId)!;
    group.photoIds.push(bestPhoto.file_id);
    if (!group.photoUniqueId) group.photoUniqueId = uniqueId;
    if (text && !group.text) group.text = text;
    clearTimeout(group.timer);
    group.timer = setTimeout(() => processMediaGroup(ctx, mediaGroupId), 3000);
  } else {
    const group: PendingProduct = {
      mediaGroupId,
      messageId: ctx.message.message_id,
      text: text,
      photoIds: [bestPhoto.file_id],
      photoUniqueId: uniqueId,
      parsed: null,
    };
    group.timer = setTimeout(() => processMediaGroup(ctx, mediaGroupId), 3000);
    pendingGroups.set(mediaGroupId, group);
  }
});

// Kanalga joylangan rasm (Channel post)
bot.on("channel_post", async (ctx) => {
  const post = ctx.channelPost;
  if (!post || !("photo" in post) || !post.photo) return;
  const mediaGroupId = post.media_group_id || `single_${post.message_id}`;
  const photos = post.photo;
  const bestPhoto = photos[photos.length - 1];
  const uniqueId = bestPhoto.file_unique_id;
  const text = post.caption || "";

  if (pendingGroups.has(mediaGroupId)) {
    const group = pendingGroups.get(mediaGroupId)!;
    group.photoIds.push(bestPhoto.file_id);
    if (!group.photoUniqueId) group.photoUniqueId = uniqueId;
    if (text && !group.text) group.text = text;
    clearTimeout(group.timer);
    group.timer = setTimeout(() => processMediaGroup(ctx, mediaGroupId), 3000);
  } else {
    const group: PendingProduct = {
      mediaGroupId,
      messageId: post.message_id,
      text: text,
      photoIds: [bestPhoto.file_id],
      photoUniqueId: uniqueId,
      parsed: null,
    };
    group.timer = setTimeout(() => processMediaGroup(ctx, mediaGroupId), 3000);
    pendingGroups.set(mediaGroupId, group);
  }
});

// Oddiy matn kelsa (rasmdan keyin yuborilgan bo'lsa), uni rasmga biriktiramiz
bot.on(message("text"), async (ctx) => {
  const text = ctx.message.text;
  
  // Eng so'nggi yaratilgan guruhni topamiz
  let latestGroupId: string | null = null;
  let latestGroup: PendingProduct | null = null;
  
  for (const [id, group] of pendingGroups.entries()) {
    if (!latestGroup || group.messageId > latestGroup.messageId) {
      latestGroupId = id;
      latestGroup = group;
    }
  }

  if (latestGroup && latestGroupId) {
    if (!latestGroup.text) latestGroup.text = text;
    else latestGroup.text += "\n" + text;
    
    // Taymerni yangilaymiz
    clearTimeout(latestGroup.timer);
    latestGroup.timer = setTimeout(() => processMediaGroup(ctx, latestGroupId as string), 3000);
  } else {
    await ctx.reply("Iltimos, oldin rasm yuboring, yoki rasmni o'ziga izoh (caption) qilib yozing.");
  }
});

async function processMediaGroup(ctx: Context, mediaGroupId: string) {
  const group = pendingGroups.get(mediaGroupId);
  if (!group) return;
  pendingGroups.delete(mediaGroupId);
  
  if (!group.text.trim() || group.photoIds.length === 0) {
    await ctx.reply("❌ Xatolik: Matn yoki rasm yetishmayapti. O'tkazib yuborildi.");
    return;
  }

    let statusMsg;
  try {
    statusMsg = await ctx.reply("🔄 Analiz qilinmoqda...");
  } catch (e) {
    console.log("Failed to send statusMsg, probably rate limited. Proceeding anyway...");
  }

  try {
    const parsed = await parseProductText(group.text);
    if (!parsed || !parsed.name) {
      if (statusMsg) await ctx.telegram.editMessageText(ctx.chat?.id, statusMsg.message_id, undefined, "❌ AI matnni tushunmadi.");
      return;
    }

    // Ensure price is valid
    let finalPrice = parsed.price;
    if (!finalPrice || finalPrice <= 0) {
      finalPrice = 100; // safe default if absolutely no price in text
    }

    const photoSku = group.photoUniqueId ? `TG-${group.photoUniqueId}` : `BOT-${group.messageId}`;

    // 1. Check if the EXACT SAME photo was already uploaded
    if (group.photoUniqueId) {
      const { data: dupPhoto } = await supabase.from('products').select('id').eq('sku', photoSku).limit(1);
      if (dupPhoto && dupPhoto.length > 0) {
        if (statusMsg) await ctx.telegram.editMessageText(ctx.chat?.id, statusMsg.message_id, undefined, `⚠️ **Dublikat:** Bu mahsulot fotosurati avval saytga qo'shilgan, o'tkazib yuborildi.`, { parse_mode: "Markdown" });
        return;
      }
    }

    // 2. Check if identical name AND identical price already exist
    const { data: dupNamePrice } = await supabase
      .from('products')
      .select('id')
      .ilike('name', parsed.name.trim())
      .eq('price', finalPrice)
      .limit(1);
    if (dupNamePrice && dupNamePrice.length > 0) {
      const formattedPrice = finalPrice < 100000 ? "$" + finalPrice.toLocaleString("ru-RU") : finalPrice.toLocaleString("ru-RU") + " so'm";
      if (statusMsg) await ctx.telegram.editMessageText(ctx.chat?.id, statusMsg.message_id, undefined, `⚠️ **Dublikat:** ${parsed.name} (${formattedPrice}) avval qo'shilgan, o'tkazib yuborildi.`, { parse_mode: "Markdown" });
      return;
    }

    if (statusMsg) await ctx.telegram.editMessageText(ctx.chat?.id, statusMsg.message_id, undefined, `⏳ Rasmlar yuklanmoqda... (${parsed.name})`, { parse_mode: "Markdown" });

    const uploadedUrls: string[] = [];
    for (let i = 0; i < group.photoIds.length; i++) {
      const fileLink = await ctx.telegram.getFileLink(group.photoIds[i]);
      const filename = `${Date.now()}_${i}.jpg`;
      const publicUrl = await uploadImageToSupabase(fileLink.toString(), filename);
      if (publicUrl) uploadedUrls.push(publicUrl);
    }

    // Auto assign category for tools
    let catId = "cat-bolgarkalar"; 
    const lowerText = (parsed.name + " " + group.text).toLowerCase();
    
    if (lowerText.includes("drel") || lowerText.includes("shurup") || lowerText.includes("дрель") || lowerText.includes("шуруп") || lowerText.includes("гайковерт") || lowerText.includes("gayk")) {
      catId = "cat-drellar-shurupovyortlar";
    } else if (lowerText.includes("perforat") || lowerText.includes("otboy") || lowerText.includes("перфоратор") || lowerText.includes("отбой")) {
      catId = "cat-perforatorlar";
    } else if (lowerText.includes("svarka") || lowerText.includes("payvand") || lowerText.includes("сварка") || lowerText.includes("инвертор") || lowerText.includes("mma") || lowerText.includes("mig")) {
      catId = "cat-svarka";
    } else if (lowerText.includes("lazer") || lowerText.includes("uraven") || lowerText.includes("uroven") || lowerText.includes("лазер") || lowerText.includes("уровень") || lowerText.includes("ruletka") || lowerText.includes("рулетка")) {
      catId = "cat-lazer-olchov";
    } else if (lowerText.includes("aksessuar") || lowerText.includes("disk") || lowerText.includes("диск") || lowerText.includes("sverlo") || lowerText.includes("сверло") || lowerText.includes("nabor")) {
      catId = "cat-aksessuarlar";
    } else if (lowerText.includes("bolgarka") || lowerText.includes("болгарка") || lowerText.includes("ugl") || lowerText.includes("ушм")) {
      catId = "cat-bolgarkalar";
    }

    // Extract brand from name and text
    let finalBrand: string | null = null;
    const knownBrands = [
      "DeWalt", "Bosch", "Makita", "Total", "Ingco", "Crown", "Resanta", 
      "Hilti", "Milwaukee", "Edon", "Hilda", "PIT", "DWT", "Bort", "Sturm",
      "Metabo", "Stanley", "Black & Decker", "Kress"
    ];
    for (const b of knownBrands) {
      if (lowerText.includes(b.toLowerCase())) {
        finalBrand = b;
        break;
      }
    }

    const productId = await insertProduct(
      parsed.name,
      parsed.description,
      finalPrice,
      parsed.characteristics,
      uploadedUrls,
      photoSku,
      catId,
      finalBrand
    );

    const formattedPrice = finalPrice < 100000 ? "$" + finalPrice.toLocaleString("ru-RU") : finalPrice.toLocaleString("ru-RU") + " so'm";
    if (statusMsg) {
      await ctx.telegram.editMessageText(ctx.chat?.id, statusMsg.message_id, undefined, `✅ **Qo'shildi:** ${parsed.name}\n💰 **Narx:** ${formattedPrice}\n🏷 **Brend:** ${finalBrand || "Mavjud emas"}`, { parse_mode: "Markdown" }).catch(() => {});
    }

  } catch (err: any) {
    console.error("Xatolik:", err?.message || err);
    if (statusMsg) {
      await ctx.telegram.editMessageText(ctx.chat?.id, statusMsg.message_id, undefined, "❌ Xatolik yuz berdi.").catch(() => {});
    }
  }
}

