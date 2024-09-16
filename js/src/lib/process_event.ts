import React from "react";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { StreamEvent } from "@langchain/core/tracers/log_stream";

const isChatModelStream = (streamEvent: StreamEvent): boolean => {
  return !!(
    streamEvent.event === "on_chat_model_stream" &&
    streamEvent.data.chunk &&
    "kwargs" in streamEvent.data.chunk &&
    streamEvent.data.chunk.kwargs
  );
};

function extractMessageId(streamEvent: StreamEvent): string | undefined {
  if (isChatModelStream(streamEvent)) {
    return streamEvent.data.chunk.kwargs.id;
  }
  return undefined;
}

function processEvent(streamEvent: StreamEvent): string | undefined {
  if (isChatModelStream(streamEvent)) {
    return streamEvent.data.chunk.kwargs.content;
  }
  return undefined;
}

export async function processStream(
  response: Response,
  setRenderedMessages: (value: React.SetStateAction<BaseMessage[]>) => void
) {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No reader found in response body");
  }
  const decoder = new TextDecoder();
  let fullMessage: BaseMessage = new AIMessage({
    content: "",
    id: "",
  });

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.trim() !== "") {
        try {
          const streamEvent: StreamEvent = JSON.parse(line);
          if (!fullMessage.id) {
            fullMessage.id = extractMessageId(streamEvent) ?? "";
          }

          const newText = processEvent(streamEvent);
          if (newText) {
            fullMessage.content += newText;
          }

          if (fullMessage.content && fullMessage.id) {
            setRenderedMessages((prevMessages) => {
              const lastMessage = prevMessages[prevMessages.length - 1];

              if (lastMessage.id === fullMessage.id) {
                const allButLastMessage = prevMessages.slice(0, -1);
                return [...allButLastMessage, fullMessage];
              } else {
                return [...prevMessages, fullMessage];
              }
            });
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      }
    }
  }
}
