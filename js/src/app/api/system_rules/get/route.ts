import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const assistantId = searchParams.get('assistantId');

  if (!userId || !assistantId) {
    return new NextResponse(JSON.stringify({ error: "Missing userId or assistantId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Use Supabase to get the user's system rules for the given assistant

  return new NextResponse(JSON.stringify({}), {
    headers: { "Content-Type": "application/json" },
  });
}