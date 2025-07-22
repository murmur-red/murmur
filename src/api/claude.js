export async function POST(req) {
  return new Response(
    JSON.stringify({ response: "🧠 Claude says: Here's a safe and aligned opinion on that." }),
    { status: 200 }
  )
}