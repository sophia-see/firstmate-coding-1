import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { webhookUrl, text } = await request.json();

  if (!webhookUrl || !text) {
    return NextResponse.json({ message: "Webhook error", error: "Missing fields" });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `From Sophia See's Slack Bot: ${text}`,
      }),
    });

    console.log("Message sent:", await response.json());
    return NextResponse.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ message: "Error sending message" }, { status: 500 });
  }
}
