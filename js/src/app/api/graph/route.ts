import { buildGraph } from "@/agent";
import { VercelMemoryStore } from "@/stores/vercel";
import { createClient } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

const vercelKvClient = () => {
  if (!process.env.KV_REST_API_TOKEN || !process.env.KV_REST_API_URL) {
    throw new Error("Missing Vercel token or URL environment");
  }

  return createClient({
    token: process.env.KV_REST_API_TOKEN,
    url: process.env.KV_REST_API_URL,
  });
};

export async function POST(req: NextRequest) {
  const reqJson = await req.json();
  const { messages, assistantId, hasAcceptedText } = reqJson;

  // Unlike in the studio, we need to pass a store here since it's not set by default.
  const store = new VercelMemoryStore({
    client: vercelKvClient(),
  });
  const graph = buildGraph(store);

  const config = { configurable: { assistant_id: assistantId }, version: "v2" as const };
  const stream = graph.streamEvents({ messages, hasAcceptedText }, config);

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(readableStream, {
    headers: {
      "Content-Type": "application/json",
      "Transfer-Encoding": "chunked",
    },
  });
}
