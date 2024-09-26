import { useEffect, useState } from "react";
import { createClient } from "./utils";
import { getCookie, setCookie } from "@/lib/cookies";
import { ASSISTANT_ID_COOKIE, USER_TIED_TO_ASSISTANT } from "@/constants";
import { useToast } from "./use-toast";

export interface GraphInput {
  messages: Record<string, any>[];
  hasAcceptedText: boolean;
  contentGenerated: boolean;
  systemRules: string | undefined;
}

export interface UserRules {
  styleRules?: string[];
  contentRules?: string[];
}

export interface UseGraphInput {
  userId: string | undefined;
  refreshAssistants: () => Promise<void>;
}

export function useGraph(input: UseGraphInput) {
  const { toast } = useToast();
  const [threadId, setThreadId] = useState<string>();
  const [assistantId, setAssistantId] = useState<string>();
  const [isGetAssistantsLoading, setIsGetAssistantsLoading] = useState(false);
  const [isLoadingUserRules, setIsLoadingUserRules] = useState(false);
  const [userRules, setUserRules] = useState<UserRules | undefined>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (assistantId) return;
    if (!process.env.NEXT_PUBLIC_LANGGRAPH_GRAPH_ID) {
      throw new Error("Graph ID is required");
    }

    const assistantIdCookie = getCookie(ASSISTANT_ID_COOKIE);

    if (assistantIdCookie) {
      setAssistantId(assistantIdCookie);
    } else if (input.userId) {
      createAssistant(
        process.env.NEXT_PUBLIC_LANGGRAPH_GRAPH_ID,
        input.userId
      ).then((assistant) => {
        if (!assistant) {
          throw new Error("Failed to create assistant");
        }
        const newAssistantId = assistant.assistant_id;
        setCookie(ASSISTANT_ID_COOKIE, newAssistantId);
        setAssistantId(newAssistantId);
      });
    }
  }, [input.userId]);

  // TODO: remove after a couple days when all existing users have been updated.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!input.userId) return;
    void ensureAssistantIsTiedToUser(input.userId);
  }, [assistantId, input.userId]);

  useEffect(() => {
    if (!assistantId) return;

    const fetchRules = async () => {
      if (!userRules) {
        await getUserRules();
      }
    };

    void fetchRules();
  }, [assistantId]);

  const createAssistant = async (
    graphId: string,
    userId: string,
    extra?: {
      assistantName?: string;
      assistantDescription?: string;
      overrideExisting?: boolean;
    }
  ) => {
    if (assistantId && !extra?.overrideExisting) return;
    const client = createClient();
    const metadata = {
      userId,
      assistantName: extra?.assistantName,
      assistantDescription: extra?.assistantDescription,
    };

    const assistant = await client.assistants.create({ graphId, metadata });
    setAssistantId(assistant.assistant_id);
    setCookie(ASSISTANT_ID_COOKIE, assistant.assistant_id);
    return assistant;
  };

  const createThread = async () => {
    const client = createClient();
    const thread = await client.threads.create();
    setThreadId(thread.thread_id);
    return thread;
  };

  const streamMessage = async (params: GraphInput) => {
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
    const input = { messages, contentGenerated, systemRules };
    const config = { configurable: { systemRules, hasAcceptedText } };
    return client.runs.stream(tmpThreadId, assistantId, {
      input,
      config,
      streamMode: "events",
    });
  };

  const sendMessage = async (params: GraphInput) => {
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
    const requestInput = { messages, contentGenerated };
    const config = { configurable: { systemRules, hasAcceptedText } };
    const update = await client.runs.wait(tmpThreadId, assistantId, {
      input: requestInput,
      config,
      streamMode: "events",
    });

    if (hasAcceptedText) {
      // Do not await so it is not blocking
      getUserRules().catch((_) => {
        toast({
          title: "Failed to re-fetch user rules.",
          description: "Please refresh the page to see the updated rules.",
        });
      });
    }

    return update;
  };

  const getAssistantsByUserId = async (userId: string) => {
    setIsGetAssistantsLoading(true);
    const client = createClient();
    const query = {
      metadata: { userId },
    };
    const results = await client.assistants.search(query);
    setIsGetAssistantsLoading(false);
    return results;
  };

  const updateAssistant = (assistantId: string) => {
    setAssistantId(assistantId);
    setCookie(ASSISTANT_ID_COOKIE, assistantId);
    void input.refreshAssistants();
  };

  const updateAssistantMetadata = async (
    assistantId: string,
    fields: {
      metadata: Record<string, any>;
    }
  ) => {
    const client = createClient();
    const updatedAssistant = await client.assistants.update(
      assistantId,
      fields
    );
    void input.refreshAssistants();
    return updatedAssistant;
  };

  const ensureAssistantIsTiedToUser = async (userId: string) => {
    if (!assistantId || getCookie(USER_TIED_TO_ASSISTANT) === "true") return;

    const client = createClient();
    const currentAssistant = await client.assistants.get(assistantId);
    if (
      currentAssistant.metadata &&
      "userId" in currentAssistant.metadata &&
      currentAssistant.metadata.userId === userId
    ) {
      setCookie(USER_TIED_TO_ASSISTANT, "true");
      return;
    }
    // Update assistant metadata to include userId
    await updateAssistantMetadata(assistantId, {
      metadata: {
        ...currentAssistant.metadata,
        userId,
        version: currentAssistant.version,
      },
    });
    setCookie(USER_TIED_TO_ASSISTANT, "true");
  };

  const getUserRules = async () => {
    if (!assistantId || assistantId === "") return;
    setIsLoadingUserRules(true);
    const client = createClient();

    try {
      const response = await client.runs.wait(null, assistantId, {
        input: {},
        config: { configurable: { onlyGetRules: true } },
      });

      const { rules } = response as Record<string, any>;
      if (rules?.styleRules?.length || rules?.contentRules?.length) {
        setUserRules(rules);
      }
    } finally {
      setIsLoadingUserRules(false);
    }
  };

  return {
    assistantId,
    setAssistantId: updateAssistant,
    streamMessage,
    sendMessage,
    createAssistant,
    isGetAssistantsLoading,
    getAssistantsByUserId,
    updateAssistantMetadata,
    userRules,
    isLoadingUserRules,
  };
}
