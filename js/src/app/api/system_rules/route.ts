import { initVercelStore, VercelMemoryStore } from "@/stores/vercel";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };
}

const NAMESPACE = "system_rules";

async function handleSetRules(
  store: VercelMemoryStore,
  fields: { systemRules: string; assistantId: string }
): Promise<void> {
  const key = fields.assistantId;
  const values = {
    systemRules: fields.systemRules,
  };
  const input: Array<[string, string, Record<string, any> | null]> = [
    [NAMESPACE, key, values],
  ];
  await store.put(input);
}

async function handleGetRules(
  store: VercelMemoryStore,
  fields: { assistantId: string }
): Promise<{ systemRules: string | null }> {
  const results = await store.list([NAMESPACE]);
  if (results && results[NAMESPACE] && results[NAMESPACE][fields.assistantId]) {
    return {
      systemRules: results[NAMESPACE][fields.assistantId].systemRules,
    };
  }
  return {
    systemRules: null,
  };
}

async function handleRequest(req: NextRequest, method: string) {
  try {
    const store = initVercelStore();

    if (method === "POST") {
      const { systemRules, assistantId } = await req.json();
      await handleSetRules(store, { systemRules, assistantId });
      return NextResponse.json({ success: true }, { status: 200 });
    } else if (method === "GET") {
      // GET reqs can not have a body, so we need to parse the query string to get the assistantId
      const url = new URL(req.url);
      const assistantId = url.searchParams.get("assistantId");

      if (!assistantId) {
        return NextResponse.json(
          { error: "assistantId is required" },
          { status: 400 }
        );
      }

      const systemRules = await handleGetRules(store, { assistantId });
      return NextResponse.json(systemRules, {
        status: 200,
      });
    } else {
      return new NextResponse(null, { status: 405 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

export const GET = (req: NextRequest) => handleRequest(req, "GET");
export const POST = (req: NextRequest) => handleRequest(req, "POST");

// Add a new OPTIONS handler
export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...getCorsHeaders(),
    },
  });
};
