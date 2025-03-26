export async function POST(req: Request) {
  const { url:webhookUrl, text, delay } = await req.json();

  const response = await fetch("https://qstash.upstash.io/v2/publish", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: `${process.env.PUBLIC_NEXT_URL}/api/process-messages`, // Backend endpoint
      body: JSON.stringify({ webhookUrl, text }),
      delay: delay * 1000, // Delay in milliseconds
    }),
  });
  
  const result = await response.json();
  console.log("Scheduled message:", result);

  return new Response(JSON.stringify({ message: "Scheduled successfully" }), { status: 200 });
}