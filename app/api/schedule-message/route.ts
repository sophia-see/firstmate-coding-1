import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(req: Request) {
  const { text, webhookUrl, delay } = await req.json();

  if (!text || !webhookUrl || delay === undefined) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  const messageId = `message:${Date.now()}`;
  const sendAt = Date.now() + delay * 1000;

  await redis.set(messageId, JSON.stringify({ text, webhookUrl, sendAt }), { ex: delay + 60 });

  // Schedule the QStash request
  await fetch("https://qstash.upstash.io/v1/publish", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_QSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
    url: `${process.env.PUBLIC_NEXT_URL}/api/process-messages`,
      notBefore: sendAt, // QStash will trigger this after delay
      body: JSON.stringify({ messageId }),
    }),
  });

  return new Response(JSON.stringify({ message: "Scheduled successfully" }), { status: 200 });
}