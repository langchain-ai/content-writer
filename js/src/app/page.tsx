"use client";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { useEffect, useState } from "react";
import { ASSISTANT_ID_COOKIE } from "@/constants";
import { getCookie, setCookie } from "@/lib/cookies";
import { v4 as uuidv4 } from "uuid";
import { useRules } from "@/hooks/useRules";
import { Rules } from "@/components/RulesDialog";
import { ContentComposerChatInterface } from "@/components/ContentComposer";

export default function Home() {
  const [assistantId, setAssistantId] = useState(
    process.env.NEXT_PUBLIC_ASSISTANT_ID ?? ""
  );
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

    // The assistant ID can not be found in the env vars, so create a new one.
    const assistantIdCookie = getCookie(ASSISTANT_ID_COOKIE);
    if (!assistantIdCookie) {
      const newUserId = uuidv4();
      setCookie(ASSISTANT_ID_COOKIE, newUserId);
      setAssistantId(newUserId);
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
        assistantId={assistantId}
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
