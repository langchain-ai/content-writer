import { DEFAULT_SYSTEM_RULES } from "@/constants";
import { useState, useCallback } from "react";

export interface UserRules {
  styleRules?: string[];
  contentRules?: string[];
}

const DEFAULT_SYSTEM_RULES_STRING = `- ${DEFAULT_SYSTEM_RULES.join("\n- ")}`;

export function useRules(assistantId: string | undefined) {
  const [systemRules, setSystemRules] = useState<string>();
  const [userRules, setUserRules] = useState<UserRules | undefined>();
  const [isLoadingSystemRules, setIsLoadingSystemRules] = useState(false);
  const [isSavingSystemRules, setIsSavingSystemRules] = useState(false);
  const [isLoadingUserRules, setIsLoadingUserRules] = useState(false);

  const getSystemRules = useCallback(async () => {
    if (!assistantId || assistantId === "") {
      return;
    }
    setIsLoadingSystemRules(true);
    try {
      const queryParams = new URLSearchParams({ assistantId });
      const fullUrl = `/api/system_rules?${queryParams.toString()}`;
      const response = await fetch(fullUrl);

      if (!response.ok) {
        setSystemRules(DEFAULT_SYSTEM_RULES_STRING);
      }

      const data = await response.json();
      if (data?.systemRules) {
        setSystemRules(data.systemRules);
      } else {
        setSystemRules(DEFAULT_SYSTEM_RULES_STRING);
      }
    } finally {
      setIsLoadingSystemRules(false);
    }
  }, [assistantId]);

  const setSystemRulesAndSave = useCallback(
    async (newSystemRules: string) => {
      if (!assistantId || assistantId === "") return;

      setIsSavingSystemRules(true);
      try {
        setSystemRules(newSystemRules);
        await fetch("/api/system_rules", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ assistantId, systemRules: newSystemRules }),
        });
      } finally {
        setIsSavingSystemRules(false);
      }
    },
    [assistantId]
  );

  const getUserRules = useCallback(async () => {
    if (!assistantId || assistantId === "") return;

    setIsLoadingUserRules(true);
    try {
      const response = await fetch("/api/rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assistantId }),
      });

      const data = await response.json();
      if (data?.styleRules?.length || data?.contentRules?.length) {
        setUserRules(data);
      }
    } finally {
      setIsLoadingUserRules(false);
    }
  }, [assistantId]);

  return {
    getSystemRules,
    setSystemRules,
    setSystemRulesAndSave,
    getUserRules,
    systemRules,
    userRules,
    isLoadingSystemRules,
    isSavingSystemRules,
    isLoadingUserRules,
  };
}
