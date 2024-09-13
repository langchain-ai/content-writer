"use server";

import { MessagePrimitive } from "@assistant-ui/react";
import { ActionBarPrimitive } from "@assistant-ui/react";

const ActionBar = () => (
  <ActionBarPrimitive.Root>
    <ActionBarPrimitive.Edit />
    <ActionBarPrimitive.Copy />
  </ActionBarPrimitive.Root>
)

export const UserMessage = () => (
  <MessagePrimitive.Root>
    User: <MessagePrimitive.Content />
  </MessagePrimitive.Root>
);
 
export const AssistantMessage = () => (
  <MessagePrimitive.Root>
    Assistant: <MessagePrimitive.Content />
 
    <ActionBar />
  </MessagePrimitive.Root>
);