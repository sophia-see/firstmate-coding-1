import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.text();

  const data = JSON.parse(body)
  console.log({ data })
  const { url: webhookUrl, text, delay } = data;

  // seconds to ms
  const delayMs = delay * 1000;

  setTimeout(async() => {
    try {
  
      if (!webhookUrl || !text) {
        return NextResponse.json({ message: 'Webhook error', error: "Missing required fields" })
      }
  
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: `From Sophia See's Slack Bot: ${text}`,
        }),
      });
  
      console.log({ response })
  
      return NextResponse.json({ status: 200, data: response })
    } catch (error: unknown) {
      console.log({ error })
      return NextResponse.json({ status: 404, error: "Error" })
    }
  }, delayMs ?? 0)
}
