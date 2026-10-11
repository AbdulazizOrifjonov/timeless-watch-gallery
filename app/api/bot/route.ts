import { bot } from "../../../telegram-bot/bot";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await bot.handleUpdate(body);
    return new Response("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Error", { status: 500 });
  }
}
