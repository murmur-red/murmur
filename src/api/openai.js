export async function POST(req) {
  return new Response(
    JSON.stringify({ response: "🤖 GPT‑4 says: This is a mock reply to your prompt." }),
    { status: 200 }
  )
}