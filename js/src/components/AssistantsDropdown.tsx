import { type Assistant } from "@langchain/langgraph-sdk";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "@/lib/utils";

export interface AssistantsDropdownProps {
  selectedAssistantId?: string;
  isGetAssistantsLoading: boolean;
  getAssistantsByUserId: (userId: string) => Promise<Assistant[]>;
  setAssistantId: (assistantId: string) => void;
  userId: string | undefined;
}

export function AssistantsDropdown(props: AssistantsDropdownProps) {
  const [assistants, setAssistants] = useState<Assistant[]>([]);

  useEffect(() => {
    if (assistants.length > 0) return;
    if (!props.userId) return;
    props.getAssistantsByUserId(props.userId).then(setAssistants);
  }, [props.userId]);

  const handleChangeAssistant = (assistantId: string) => {
    if (assistantId === props.selectedAssistantId) return;

    props.setAssistantId(assistantId);
    // Force page reload
    window.location.reload();
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      <Select
        onValueChange={handleChangeAssistant}
        defaultValue={props.selectedAssistantId}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Switch assistant" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>My assistants</SelectLabel>
            {assistants.map((assistant, idx) => {
              const assistantName =
                (assistant.metadata?.assistantName as string | undefined) ||
                `My assistant ${idx + 1}`;
              const assistantDescription = assistant.metadata
                ?.assistantDescription as string | undefined;
              const isSelected =
                assistant.assistant_id === props.selectedAssistantId;
              return (
                <SelectItem
                  key={assistant.assistant_id}
                  value={assistant.assistant_id}
                  className={cn("py-2", isSelected && "bg-gray-100")}
                >
                  <div className="flex flex-col">
                    <p className="text-sm text-gray-800">{assistantName}</p>
                    {assistantDescription && (
                      <p className="text-xs font-light text-gray-500 mt-1 truncate">
                        {assistantDescription}
                      </p>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
