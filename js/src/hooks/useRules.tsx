import { DEFAULT_SYSTEM_RULES } from "@/constants";
import { useState, useCallback, useEffect } from "react";
import { createClient } from "./utils";

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

  useEffect(() => {
    if (!assistantId) return;

    const fetchRules = async () => {
      if (!systemRules) {
        await getSystemRules();
      }
      if (!userRules) {
        await getUserRules();
      }
    };

    void fetchRules();
  }, [assistantId]);

  const getSystemRules = async () => {
    if (!assistantId || assistantId === "") return;
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
  };

  const setSystemRulesAndSave = async (newSystemRules: string) => {
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
  };

  const getUserRules = async () => {
    if (!assistantId || assistantId === "") return;
    setIsLoadingUserRules(true);
    const client = createClient();

    try {
      const response = await client.runs.wait(null, assistantId, {
        input: { onlyGetRules: true },
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
