"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { getCookie, setCookie } from "@/lib/cookies";
import { HAS_SEEN_DIALOG } from "@/constants";
import { SystemRulesEditable } from "./SystemRulesEditable";
import { Button } from "./ui/button";

export interface WelcomeDialogProps {
  isLoadingSystemRules: boolean;
  systemRules: string | undefined;
  setSystemRulesAndSave: (newSystemRules: string) => Promise<void>;
  setSystemRules: (newSystemRules: string) => void;
}

export function WelcomeDialog(props: WelcomeDialogProps) {
  const {
    isLoadingSystemRules,
    systemRules,
    setSystemRulesAndSave,
    setSystemRules,
  } = props;
  const [open, setOpen] = useState(false);

  const handleClose = (open: boolean) => {
    if (!open) {
      if (process.env.NODE_ENV !== "development") {
        setCookie(HAS_SEEN_DIALOG, "true");
      }
    }
    setOpen(open);
    void setSystemRulesAndSave(systemRules ?? "");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasSeenDialog = getCookie(HAS_SEEN_DIALOG);
    if (!hasSeenDialog) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-8 bg-white rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-light text-gray-800">
            Welcome to LangChain&apos;s Content Writer
          </DialogTitle>
          <DialogDescription className="mt-2 text-md font-light text-gray-600">
            Your intelligent companion for crafting engaging content
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-6">
          <p className="text-sm font-light text-gray-700">
            LangChain&apos;s Content Writer learns from your interactions to
            help you compose better content. It builds a personalized knowledge
            base through two key actions:
          </p>
          <ul className="list-disc list-inside text-sm font-light text-gray-700 space-y-2">
            <li>When you copy any AI-generated message</li>
            <li>When you edit and save any AI-generated message</li>
          </ul>
          <p className="text-sm font-light text-gray-700">
            When these actions are performed, the agent will generate rules
            based on your feedback and the content generated.
          </p>
          {!isLoadingSystemRules && systemRules && (
            <SystemRulesEditable
              setOpen={setOpen}
              setSystemRulesAndSave={setSystemRulesAndSave}
              systemRules={systemRules}
              setSystemRules={setSystemRules}
            />
          )}
        </div>
        <div className="mt-8 flex justify-end">
          <Button onClick={() => handleClose(false)}>Get Started</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
