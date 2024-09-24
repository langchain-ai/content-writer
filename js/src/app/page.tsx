"use client";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { useEffect, useState } from "react";
import { ASSISTANT_ID_COOKIE } from "@/constants";
import { getCookie, setCookie } from "@/lib/cookies";
import { useRules } from "@/hooks/useRules";
import { GeneratedRulesDialog } from "@/components/GeneratedRulesDialog";
import { ContentComposerChatInterface } from "@/components/ContentComposer";
import { useGraph } from "@/hooks/useGraph";
import { SystemRulesDialog } from "@/components/SystemRulesDialog";
import { useUser } from "@/hooks/useUser";
import { AssistantsDropdown } from "@/components/AssistantsDropdown";

export default function Home() {
  const [refreshAssistants, setRefreshAssistants] = useState<
    () => Promise<void>
  >(() => () => Promise.resolve());
  const { userId } = useUser();
  const {
    createAssistant,
    sendMessage,
    streamMessage,
    assistantId,
    setAssistantId,
    isGetAssistantsLoading,
    getAssistantsByUserId,
    updateAssistantMetadata,
    userRules,
    isLoadingUserRules,
  } = useGraph({ userId, refreshAssistants });
  const {
    setSystemRules,
    systemRules,
    setSystemRulesAndSave,
    isLoadingSystemRules,
  } = useRules(assistantId);

  return (
    <main className="h-screen">
      <AssistantsDropdown
        createAssistant={createAssistant}
        selectedAssistantId={assistantId}
        isGetAssistantsLoading={isGetAssistantsLoading}
        getAssistantsByUserId={getAssistantsByUserId}
        setAssistantId={setAssistantId}
        userId={userId}
        onAssistantUpdate={(callback: () => Promise<void>) =>
          setRefreshAssistants(() => callback)
        }
      />
      <GeneratedRulesDialog
        isLoadingUserRules={isLoadingUserRules}
        userRules={userRules}
      />
      <SystemRulesDialog
        setSystemRules={setSystemRules}
        setSystemRulesAndSave={setSystemRulesAndSave}
        isLoadingSystemRules={isLoadingSystemRules}
        systemRules={systemRules}
      />
      <ContentComposerChatInterface
        createAssistant={createAssistant}
        systemRules={systemRules}
        sendMessage={sendMessage}
        streamMessage={streamMessage}
        userId={userId}
      />
      <WelcomeDialog
        setSystemRules={setSystemRules}
        setSystemRulesAndSave={setSystemRulesAndSave}
        isLoadingSystemRules={isLoadingSystemRules}
        systemRules={systemRules}
        updateAssistantMetadata={updateAssistantMetadata}
        assistantId={assistantId}
      />
    </main>
  );
}
