import React from "react";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { StreamEvent } from "@langchain/core/tracers/log_stream";
import { ToolCall } from "@langchain/core/messages/tool";

const isChatModelStream = (streamEvent: StreamEvent): boolean => {
  return !!(
    streamEvent.event === "on_chat_model_stream" &&
    streamEvent.data.chunk &&
    "kwargs" in streamEvent.data.chunk &&
    streamEvent.data.chunk.kwargs
  );
};

const isChatModelEnd = (streamEvent: StreamEvent): boolean => {
  return !!(
    streamEvent.event === "on_chat_model_end" &&
    streamEvent.data.output &&
    "kwargs" in streamEvent.data.output &&
    streamEvent.data.output.kwargs
  );
};

const isWasTweetGeneratedNode = (streamEvent: StreamEvent): boolean => {
  return streamEvent.metadata.langgraph_node === "wasTweetGenerated";
};

const isCallModelNode = (streamEvent: StreamEvent): boolean => {
  return streamEvent.metadata.langgraph_node === "callModel";
};

const streamEndHasToolCall = (streamEvent: StreamEvent): boolean => {
  return !!(
    streamEvent.data.output.kwargs.tool_calls &&
    streamEvent.data.output.kwargs.tool_calls.length > 0
  );
};

const extractMessageId = (streamEvent: StreamEvent): string | undefined => {
  if (isChatModelStream(streamEvent)) {
    return streamEvent.data.chunk.kwargs.id;
  }
  return undefined;
};

function processCallModelStreamEvent(
  streamEvent: StreamEvent
): string | undefined {
  if (isChatModelStream(streamEvent) && isCallModelNode(streamEvent)) {
    return streamEvent.data.chunk.kwargs.content;
  }
  return undefined;
}

function processWasTweetGeneratedToolCallEvent(
  streamEvent: StreamEvent
): ToolCall | undefined {
  if (
    isChatModelEnd(streamEvent) &&
    streamEndHasToolCall(streamEvent) &&
    isWasTweetGeneratedNode(streamEvent)
  ) {
    return streamEvent.data.output.kwargs.tool_calls[0];
  }
  return undefined;
}

export async function processStream(
  response: Response,
  setRenderedMessages: (value: React.SetStateAction<BaseMessage[]>) => void,
  tweetGenerated: boolean,
  setTweetGenerated: (value: React.SetStateAction<boolean>) => void
) {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No reader found in response body");
  }
  const decoder = new TextDecoder();
  let fullMessage = new AIMessage({
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

          const newText = processCallModelStreamEvent(streamEvent);
          const toolCall = processWasTweetGeneratedToolCallEvent(streamEvent);
          const wasTweetGenerated =
            toolCall && toolCall.name === "was_tweet_generated"
              ? toolCall.args.tweetGenerated
              : false;

          if (newText) {
            fullMessage = new AIMessage({
              id: fullMessage.id,
              content: fullMessage.content + newText,
            });
          } else if (wasTweetGenerated || tweetGenerated) {
            setTweetGenerated(true);
            fullMessage = new AIMessage({
              id: fullMessage.id,
              content: fullMessage.content,
              response_metadata: {
                tweetGenerated: true,
              },
            });
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

  return fullMessage;
}
