"use client";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { useEffect } from "react";
import { ASSISTANT_ID_COOKIE } from "@/constants";
import { getCookie, setCookie } from "@/lib/cookies";
import { useRules } from "@/hooks/useRules";
import { GeneratedRulesDialog } from "@/components/GeneratedRulesDialog";
import { ContentComposerChatInterface } from "@/components/ContentComposer";
import { useGraph } from "@/hooks/useGraph";
import { SystemRulesDialog } from "@/components/SystemRulesDialog";
import { useUser } from "@/hooks/useUser";

export default function Home() {
  const { userId } = useUser();
  const {
    createAssistant,
    sendMessage,
    streamMessage,
    assistantId,
    setAssistantId,
  } = useGraph({ userId });
  const {
    setSystemRules,
    systemRules,
    setSystemRulesAndSave,
    getSystemRules,
    isLoadingSystemRules,
    getUserRules,
    userRules,
  } = useRules(assistantId);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (assistantId) return;
    if (!process.env.NEXT_PUBLIC_LANGGRAPH_GRAPH_ID) {
      throw new Error("Missing NEXT_PUBLIC_LANGGRAPH_GRAPH_ID");
    }

    // The assistant ID can not be found in the env vars, so create a new one.
    const assistantIdCookie = getCookie(ASSISTANT_ID_COOKIE);
    if (!assistantIdCookie) {
      createAssistant(process.env.NEXT_PUBLIC_LANGGRAPH_GRAPH_ID).then(
        (assistant) => {
          if (!assistant && !assistantId) {
            throw new Error("Failed to create assistant");
          }
          if (!assistant) return;
          const newAssistantId = assistant.assistant_id;
          setCookie(ASSISTANT_ID_COOKIE, newAssistantId);
        }
      );
    } else {
      setAssistantId(assistantIdCookie);
    }
  }, [assistantId]);

  useEffect(() => {
    if (!assistantId) return;

    if (!systemRules) {
      void getSystemRules();
    }
    if (!userRules) {
      void getUserRules();
    }
  }, [assistantId]);

  return (
    <main className="h-screen">
      <ContentComposerChatInterface
        createAssistant={createAssistant}
        systemRules={systemRules}
        sendMessage={sendMessage}
        streamMessage={streamMessage}
      />
      <WelcomeDialog
        setSystemRules={setSystemRules}
        setSystemRulesAndSave={setSystemRulesAndSave}
        isLoadingSystemRules={isLoadingSystemRules}
        systemRules={systemRules}
      />
      <GeneratedRulesDialog userRules={userRules} />
      <SystemRulesDialog
        setSystemRules={setSystemRules}
        setSystemRulesAndSave={setSystemRulesAndSave}
        isLoadingSystemRules={isLoadingSystemRules}
        systemRules={systemRules}
      />
    </main>
  );
}
