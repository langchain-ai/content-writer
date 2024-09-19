"use client";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { useEffect } from "react";
import { ASSISTANT_ID_COOKIE } from "@/constants";
import { getCookie, setCookie } from "@/lib/cookies";
import { useRules } from "@/hooks/useRules";
import { Rules } from "@/components/RulesDialog";
import { ContentComposerChatInterface } from "@/components/ContentComposer";
import { useGraph } from "@/hooks/useGraph";

export default function Home() {
  const { createAssistant, sendMessage, assistantId, setAssistantId } =
    useGraph();
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
        systemRules={systemRules}
        sendMessage={sendMessage}
      />
      <WelcomeDialog
        setSystemRules={setSystemRules}
        setSystemRulesAndSave={setSystemRulesAndSave}
        isLoadingSystemRules={isLoadingSystemRules}
        systemRules={systemRules}
      />
      <Rules
        setSystemRules={setSystemRules}
        setSystemRulesAndSave={setSystemRulesAndSave}
        isLoadingSystemRules={isLoadingSystemRules}
        systemRules={systemRules}
        userRules={userRules}
      />
    </main>
  );
}
