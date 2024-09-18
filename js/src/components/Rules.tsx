"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "./ui/dialog";
import { getCookie } from "@/lib/cookies";
import { USER_ID_COOKIE } from "@/constants";
import { Button } from "./ui/button";

export function Rules() {
  const [open, setOpen] = useState(false);
  const [rules, setRules] = useState<string[]>([]);

  async function getRules(id: string) {
    const response = await fetch("/api/rules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ assistantId: id }),
    });

    const data = await response.json();
    if (data.rules) {
      setRules(data.rules);
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (rules.length) return;

    const userId = getCookie(USER_ID_COOKIE);
    if (userId) {
      void getRules(userId);
    }
  }, []);

  // if (!rules.length) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button onClick={() => setOpen(true)} className="fixed top-4 right-4">
          Show Rules
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl p-6 bg-white rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-semibold text-gray-800">
            Rules
          </DialogTitle>
          <DialogDescription className="mt-2 text-md text-gray-600">
            {rules.length > 0
              ? "Below are the current rules generated by the assistant to be used when generating tweets."
              : "No rules have been generated yet. Follow the steps below to generate rules."}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6">
          {rules.length > 0 ? (
            <>
              <h2 className="text-xl font-medium text-gray-700">Rules:</h2>
              <ul className="mt-4 list-disc list-inside space-y-2">
                {rules.map((rule, index) => (
                  <li key={index} className="text-gray-600">
                    {rule}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">To generate rules:</p>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Ask the assistant to generate a tweet</li>
                <li>Revise & save, or copy the generated tweet</li>
                <li>This will trigger rule generation</li>
              </ol>
              <p className="text-gray-600">
                Once rules are generated, they will appear here.{" "}
                <p className="text-gray-500 text-sm">
                  (You may need to refresh the page first)
                </p>{" "}
              </p>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => setOpen(false)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded shadow transition"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}