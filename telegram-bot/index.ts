import * as dotenv from "dotenv";
dotenv.config();

import { bot } from "./bot";

console.log("UZO ELEKTRO MARKET Telegram Bot ishga tushmoqda (Polling mode)...");

bot
  .launch(() => {
    console.log("==================================================");
    console.log("✅ UZO ELEKTRO MARKET Telegram Bot muvaffaqiyatli ulandi!");
    console.log("📥 Yangi mahsulotlar va xabarlarni kutmoqda...");
    console.log("==================================================");
  })
  .catch((err) => {
    console.error("❌ Botni ishga tushirishda xatolik yuz berdi:", err);
  });

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

