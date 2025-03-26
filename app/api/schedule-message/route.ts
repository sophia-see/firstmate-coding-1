import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { webhookUrl, text, delay } = await req.json();

    if (!webhookUrl || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const upstashDelay = Math.floor(Date.now() / 1000) + delay;

    console.log({ upstashDelay})

    const response = await fetch("https://qstash.upstash.io/v2/publish/" + process.env.SCHED_SEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
        "Upstash-Not-Before": upstashDelay, // Delay in seconds
        "Upstash-Retries": "0",
      },
      body: JSON.stringify({ 
          webhookUrl, 
          text 
      })
    });

    console.log({response})

    if (!response.ok) {
      const errorText = await response.text();
      console.error("QStash Error:", errorText);
      return NextResponse.json({ error: "QStash request failed", details: errorText }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
