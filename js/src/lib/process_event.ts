import { StreamEvent } from "@langchain/core/tracers/log_stream";

export function processEvent(streamEvent: StreamEvent): string | undefined {
  if (
    streamEvent.event === "on_chat_model_stream" &&
    streamEvent.data.chunk &&
    "kwargs" in streamEvent.data.chunk &&
    streamEvent.data.chunk.kwargs &&
    "content" in streamEvent.data.chunk.kwargs &&
    streamEvent.data.chunk.kwargs.content
  ) {
    return streamEvent.data.chunk.kwargs.content;
  }
  return undefined;
}