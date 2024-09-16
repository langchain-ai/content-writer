"use client";

import React, { useState, useEffect } from "react";
import {
  AppendMessage,
  AssistantRuntimeProvider,
  useExternalStoreRuntime,
} from "@assistant-ui/react";
import { v4 as uuidv4 } from "uuid";
import { MyThread } from "./Primitives";
import { USER_ID_COOKIE } from "@/constants";
import { getCookie, setCookie } from "@/lib/cookies";
import { processStream } from "@/lib/process_event";
import { useExternalMessageConverter } from "@assistant-ui/react";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
  convertLangchainMessages,
  convertToOpenAIFormat,
} from "@/lib/convert_messages";

export function TweetComposer(): React.ReactElement {
  const [userId, setUserId] = useState("");
  // Only messages which are rendered in the UI. This mainly excludes revised messages.
  const [renderedMessages, setRenderedMessages] = useState<BaseMessage[]>([]);
  // Messages which contain revisions are not rendered.
  const [allMessages, setAllMessages] = useState<BaseMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  async function onNew(message: AppendMessage): Promise<void> {
    if (message.content[0]?.type !== "text") {
      throw new Error("Only text messages are supported");
    }
    setIsRunning(true);

    try {
      const humanMessage = new HumanMessage({
        content: message.content[0].text,
        id: uuidv4(),
      });
      const currentConversation = [...allMessages, humanMessage];

      setRenderedMessages(currentConversation);
      setAllMessages((prevMessages) => [...prevMessages, humanMessage]);

      const response = await fetch("/api/graph", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: currentConversation.map(convertToOpenAIFormat),
          userId,
          hasAcceptedText: false,
        }),
      });

      const fullMessage = await processStream(response, setRenderedMessages);
      console.log("fullMessage", fullMessage);
      setAllMessages((prevMessages) => [...prevMessages, fullMessage]);
    } catch (error) {
      console.error("Error running message:", error);
    } finally {
      setIsRunning(false);
    }
  }

  /**
   * Handle updating the state values for `renderedMessages` as well as
   * `allMessages` when a message is edited. Then, trigger a new request
   * passing `hasAcceptedText` as true to the API so that rules are generated.
   * Since we're only making the request to generate rules, we don't need to
   * update the rendered messages with the response.
   */
  const onEdit = async (message: AppendMessage): Promise<void> => {
    if (message.content[0]?.type !== "text") {
      throw new Error("Only text messages are supported");
    }
    // Create a new assistant message with the revision
    const newMessage = new AIMessage({
      content: message.content[0].text,
      id: uuidv4(),
    });
    const revisedMessage = new AIMessage({
      id: newMessage.id,
      content: `REVISED MESSAGE:\n${newMessage.content}`,
    });

    const indexOfMessage = Number(message.parentId) + 1;

    // Updates the rendered message with the revised message
    setRenderedMessages((prevMessages) => [
      ...prevMessages.slice(0, indexOfMessage),
      newMessage,
      ...prevMessages.slice(indexOfMessage + 1),
    ]);

    const currentConversation: BaseMessage[] = [];
    // Insert the revised message directly after the original in the conversation history
    setAllMessages((prevMessages) => {
      const newMsgs = [
        ...prevMessages.slice(0, indexOfMessage),
        revisedMessage,
        ...prevMessages.slice(indexOfMessage),
      ];
      // Update the current conversation with the all messages including the revised message
      currentConversation.push(...newMsgs);
      return newMsgs;
    });

    try {
      await fetch("/api/graph", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: currentConversation.map(convertToOpenAIFormat),
          userId,
          hasAcceptedText: true,
        }),
      });
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const threadMessages = useExternalMessageConverter<BaseMessage>({
    callback: convertLangchainMessages,
    messages: renderedMessages,
    isRunning,
  });

  const runtime = useExternalStoreRuntime({
    messages: threadMessages,
    isRunning,
    onNew,
    onEdit,
  });

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

  useEffect(() => {
    console.log("renderedMessages", renderedMessages);
  }, [renderedMessages]);

  return (
    <div className="h-full">
      <AssistantRuntimeProvider runtime={runtime}>
        <MyThread
          onCopy={async () => {
            await fetch("/api/graph", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messages: allMessages.map(convertToOpenAIFormat),
                userId,
                hasAcceptedText: true,
              }),
            });
          }}
        />
      </AssistantRuntimeProvider>
    </div>
  );
}
