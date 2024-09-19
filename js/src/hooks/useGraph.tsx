import { Client } from "@langchain/langgraph-sdk";
import { useState } from "react";

const createClient = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";
  return new Client({
    apiUrl,
  });
};

export function useGraph() {
  const [threadId, setThreadId] = useState<string>();
  const [assistantId, setAssistantId] = useState<string>();

  const createAssistant = async (
    graphId: string,
    extra?: { assistantName: string }
  ) => {
    if (assistantId) return;
    const client = createClient();
    const metadata = extra?.assistantName
      ? { assistantName: extra.assistantName }
      : undefined;

    const assistant = await client.assistants.create({ graphId, metadata });
    setAssistantId(assistant.assistant_id);
    return assistant;
  };

  const createThread = async () => {
    const client = createClient();
    const thread = await client.threads.create();
    setThreadId(thread.thread_id);
    return thread;
  };

  const sendMessage = async (params: {
    messages: Record<string, any>[];
    hasAcceptedText: boolean;
    contentGenerated: boolean;
    systemRules: string | undefined;
  }) => {
    const { messages, hasAcceptedText, contentGenerated, systemRules } = params;
    if (!assistantId) {
      throw new Error("Assistant ID is required");
    }
    let tmpThreadId = threadId;
    if (!tmpThreadId) {
      const thread = await createThread();
      // Must assign to a tmp variable as the state update may not be immediate.
      tmpThreadId = thread.thread_id;
    }

    const client = createClient();

    const input = { messages, hasAcceptedText, contentGenerated, systemRules };

    return client.runs.stream(tmpThreadId, assistantId, {
      input,
      streamMode: "events",
    });
  };

  return {
    assistantId,
    setAssistantId,
    sendMessage,
    createAssistant,
  };
}
