import { DEFAULT_SYSTEM_RULES } from "@/constants";
import { useState, useEffect } from "react";

const DEFAULT_SYSTEM_RULES_STRING = `- ${DEFAULT_SYSTEM_RULES.join("\n- ")}`;

export function useRules(assistantId: string | undefined) {
  const [systemRules, setSystemRules] = useState<string>();
  const [isLoadingSystemRules, setIsLoadingSystemRules] = useState(false);
  const [isSavingSystemRules, setIsSavingSystemRules] = useState(false);

  useEffect(() => {
    if (!assistantId) return;

    const fetchRules = async () => {
      if (!systemRules) {
        await getSystemRules();
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

  return {
    getSystemRules,
    setSystemRules,
    setSystemRulesAndSave,
    systemRules,
    isLoadingSystemRules,
    isSavingSystemRules,
  };
}
