export async function POST(req) {
  return new Response(
    JSON.stringify({ response: "🌐 Gemini says: Let’s visualize this together!" }),
    { status: 200 }
  )
}