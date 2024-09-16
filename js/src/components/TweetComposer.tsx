"use client";

import React, { useState, useEffect } from "react";
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
} from "@assistant-ui/react";
import { v4 as uuidv4 } from "uuid";
import { MyThread } from "./Primitives";
import { USER_ID_COOKIE } from "@/constants";
import { getCookie, setCookie } from "@/lib/cookies";
import { CustomAdapter } from "@/lib/adapter";

export function TweetComposer(): React.ReactElement {
  const [hasAcceptedText, setHasAcceptedText] = useState(false);
  const [userId, setUserId] = useState("");
  const runtime = useLocalRuntime(CustomAdapter);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (userId) return;

    const userIdCookie = getCookie(USER_ID_COOKIE);
    if (!userIdCookie) {
      const newUserId = uuidv4();
      setCookie(USER_ID_COOKIE, newUserId);
      setUserId(newUserId);
    } else {
      setUserId(userIdCookie);
    }
  }, []);

  // Update the additional fields when the user accepts the text, or userId changes.
  useEffect(() => {
    CustomAdapter.setAdditionalFields({ hasAcceptedText, userId });
  }, [hasAcceptedText, userId]);

  return (
    <div className="h-full">
      <AssistantRuntimeProvider runtime={runtime}>
        <MyThread
          onCopy={() => setHasAcceptedText(true)}
          onEdit={() => {
            // update w/ new user message containing revision
            setHasAcceptedText(true);
          }}
        />
      </AssistantRuntimeProvider>
    </div>
  );
}
