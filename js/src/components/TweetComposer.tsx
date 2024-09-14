"use client"

import React from 'react';
import {
  Composer,
  ThreadPrimitive,
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter,
} from "@assistant-ui/react";
import { AssistantMessage, UserMessage } from './Message';

export function TweetComposer(): React.ReactElement {

  return (
    <div>
      <h1>Tweet Composer</h1>
      <ThreadPrimitive.Root>
        <ThreadPrimitive.Viewport>
          {/* <ThreadPrimitive.Empty>...</ThreadPrimitive.Empty> */}
          <ThreadPrimitive.Messages components={{
            UserMessage,
            AssistantMessage,
          }} />
        </ThreadPrimitive.Viewport>
        <Composer />
      </ThreadPrimitive.Root>
    </div>
  )
}