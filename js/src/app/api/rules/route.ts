import { buildGraph } from "@/agent";
import { VercelMemoryStore } from "@/stores/vercel";
import {
  Annotation,
  END,
  SharedValue,
  START,
  StateGraph,
} from "@langchain/langgraph";
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

const buildGetRulesGraph = (store: VercelMemoryStore) => {
  const GraphAnnotation = Annotation.Root({
    userRules: SharedValue.on("assistant_id"),
    rules: Annotation<string[]>(),
  });

  const getRules = (
    state: typeof GraphAnnotation.State
  ): Partial<typeof GraphAnnotation.State> => {
    console.log("state", state);
    if (!state.userRules || !state.userRules.rules) {
      return {
        rules: [],
      };
    }
    return {
      rules: state.userRules.rules as string[],
    };
  };

  const workflow = new StateGraph(GraphAnnotation)
    .addNode("getRules", getRules)
    .addEdge(START, "getRules")
    .addEdge("getRules", END);

  return workflow.compile({ store });
};

export async function POST(req: NextRequest) {
  const reqJson = await req.json();
  const { assistantId } = reqJson;

  // Unlike in the studio, we need to pass a store here since it's not set by default.
  const store = new VercelMemoryStore({
    client: vercelKvClient(),
  });
  const graph = buildGetRulesGraph(store);

  const config = { configurable: { assistant_id: assistantId } };

  const result = await graph.invoke({}, config);
  return new NextResponse(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
