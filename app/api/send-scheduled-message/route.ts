import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();

export async function GET() {
  const now = Date.now();
  const keys = await redis.keys("message:*");

  for (const key of keys) {
    const message = await redis.get<string>(key);
    if (!message) continue;

    const { webhookUrl, text, sendAt } = JSON.parse(message);

    if (now >= sendAt) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: `From Sophia See's Slack Bot: ${text}` }),
        });

        console.log(`✅ Message sent: ${text}`);
        await redis.del(key); // Remove message after sending
      } catch (error) {
        console.error("❌ Error sending message:", error);
      }
    }
  }

  return NextResponse.json({ status: 200, message: "Checked scheduled messages" });
}
