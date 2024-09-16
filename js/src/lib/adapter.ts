import { ChatModelAdapter } from "@assistant-ui/react";
import { StreamEvent } from "@langchain/core/tracers/log_stream";
import { processEvent } from "./process_event";

interface ExtendedChatModelAdapter extends ChatModelAdapter {
  setAdditionalFields: (fields: { hasAcceptedText: boolean; userId: string }) => void;
  additionalFields: { hasAcceptedText: boolean; userId: string };
}

export const CustomAdapter: ExtendedChatModelAdapter = {
  additionalFields: { hasAcceptedText: false, userId: '' },
  setAdditionalFields(fields) {
    this.additionalFields = fields;
  },
  async *run(input) {
    const { messages, abortSignal } = input;

    const response = await fetch("/api/graph", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        ...this.additionalFields,
      }),
      signal: abortSignal,
    });
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No reader found in response body");
    }
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.trim() !== "") {
          try {
            const streamEvent: StreamEvent = JSON.parse(line);
            const newText = processEvent(streamEvent);
        
            if (newText) {
              fullText += newText;
              yield {
                content: [
                  {
                    type: "text",
                    text: fullText,
                  },
                ],
              };
            }
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
        }
      }
    }
  },
};