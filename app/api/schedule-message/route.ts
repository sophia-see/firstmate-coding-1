import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();

export async function POST(request: Request) {
  const body = await request.json();
  const { url: webhookUrl, text, delay } = body;

  if (!webhookUrl || !text || !delay) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  const messageId = `message:${Date.now()}`;
  const sendAt = Date.now() + delay * 1000;

  // Store message in Redis with a timestamp
  await redis.set(messageId, JSON.stringify({ webhookUrl, text, sendAt }));

  return NextResponse.json({ status: 200, message: "Message scheduled successfully" });
}
