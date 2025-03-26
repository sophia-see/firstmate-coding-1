import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(req: Request) {
  const { messageId } = await req.json();
  if (!messageId) return new Response(JSON.stringify({ error: "Missing message ID" }), { status: 400 });

  const message = await redis.get<string>(messageId);
  if (!message) return new Response(JSON.stringify({ error: "Message not found" }), { status: 404 });

  const { text, webhookUrl } = JSON.parse(message);

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `From Sophia See's Slack Bot: ${text}` }),
    });

    console.log(`✅ Message sent: ${text}`);
    await redis.del(messageId); // Clean up
  } catch (error) {
    console.error("❌ Error sending message:", error);
  }

  return new Response(JSON.stringify({ message: "Message processed" }), { status: 200 });
}
