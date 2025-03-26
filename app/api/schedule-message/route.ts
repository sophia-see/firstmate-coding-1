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

  // Send response immediately, then execute the delay in the background
  setTimeout(async () => {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `From Sophia See's Slack Bot: ${text}` }),
      });

      console.log("Slack message sent:", await response.json());
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }, delayMs);

  // Respond immediately to avoid timeout
  return NextResponse.json({ status: 200, message: "Message scheduled successfully" });
}
