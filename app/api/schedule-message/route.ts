import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.text();
  const data = JSON.parse(body);
  console.log({ data });

  const { url: webhookUrl, text, delay } = data;
  const delayMs = delay * 1000;

  if (!webhookUrl || !text) {
    return NextResponse.json({ message: "Webhook error", error: "Missing required fields" });
  }

  // Ensure the API waits for the async operation
  new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: `From Sophia See's Slack Bot: ${text}` }),
        });

        console.log("Slack message sent:", await response.json());
        resolve(null);
      } catch (error) {
        console.error("Error sending message:", error);
        resolve(null);
      }
    }, delayMs);
  });

  return NextResponse.json({ status: 200, message: "Message scheduled successfully" });
}
