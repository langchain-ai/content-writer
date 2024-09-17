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

export function WelcomeDialog() {
  const [open, setOpen] = useState(false);

  const handleClose = (open: boolean) => {
    if (!open) {
      if (process.env.NODE_ENV !== "development") {
        setCookie(HAS_SEEN_DIALOG, "true");
      }
    }
    setOpen(open);
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Welcome to LangChain's Tweet Writer
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-gray-600">
            Your intelligent companion for crafting engaging tweets
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-700">
            LangChain's Tweet Writer learns from your interactions to help you
            compose better tweets. It builds a personalized knowledge base
            through two key actions:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
            <li>When you copy an AI-generated tweet</li>
            <li>When you edit and save an AI-suggested tweet</li>
          </ul>
          <p className="text-sm text-gray-700">
            The more you interact, the smarter and more tailored your experience
            becomes!
          </p>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => handleClose(false)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            Get Started
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
