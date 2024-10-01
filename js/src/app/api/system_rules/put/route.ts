import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { assistantId, userId, systemRules } = await req.json();

  if (!userId || !assistantId || !systemRules || !systemRules.length) {
    return new NextResponse(JSON.stringify({ error: "Missing userId, assistantId, or an array of systemRules." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Call Supabase to set the user rules.

  return new NextResponse(JSON.stringify({}), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
