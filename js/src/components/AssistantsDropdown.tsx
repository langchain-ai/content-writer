import { type Assistant } from "@langchain/langgraph-sdk";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { NewAssistantDialog } from "./NewAssistantDialog";

export interface AssistantsDropdownProps {
  selectedAssistantId: string | undefined;
  isGetAssistantsLoading: boolean;
  getAssistantsByUserId: (userId: string) => Promise<Assistant[]>;
  setAssistantId: (assistantId: string) => void;
  userId: string | undefined;
  createAssistant: (
    graphId: string,
    userId: string,
    extra?: {
      assistantName?: string;
      assistantDescription?: string;
      overrideExisting?: boolean;
    }
  ) => Promise<Assistant | undefined>;
}

export function AssistantsDropdown(props: AssistantsDropdownProps) {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!props.userId || !props.selectedAssistantId || assistants.length > 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    props.getAssistantsByUserId(props.userId).then((a) => {
      if (!a.length) {
        return [];
      }
      const selectedAssistant = a.find(
        (assistant) => assistant.assistant_id === props.selectedAssistantId
      );
      if (!selectedAssistant) {
        return a;
      }
      setSelectedAssistant(selectedAssistant);
      const otherAssistants = a.filter(
        (assistant) => assistant.assistant_id !== props.selectedAssistantId
      );
      setAssistants([selectedAssistant, ...otherAssistants]);
      setIsLoading(false);
    });
  }, [props.userId, props.selectedAssistantId]);

  const handleChangeAssistant = (assistantId: string) => {
    if (assistantId === props.selectedAssistantId) return;

    props.setAssistantId(assistantId);
    // Force page reload
    window.location.reload();
  };

  const defaultButtonValue = isLoading ? (
    <p className="flex items-center text-sm text-gray-600 p-2">
      Loading assistants
      <Loader className="ml-2 h-4 w-4 animate-spin" />
    </p>
  ) : (
    "Select assistant"
  );
  const dropdownLabel = selectedAssistant
    ? (selectedAssistant.metadata?.assistantName as string)
    : defaultButtonValue;

  return (
    <div className="fixed top-4 left-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{dropdownLabel}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-64 ml-4">
          <DropdownMenuLabel>Assistants</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={selectedAssistant?.assistant_id}
            onValueChange={handleChangeAssistant}
            className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          >
            {props.isGetAssistantsLoading ? (
              <p className="flex items-center text-sm text-gray-600 p-2">
                Fetching assistants
                <Loader className="ml-2 h-4 w-4 animate-spin" />
              </p>
            ) : (
              assistants.map((assistant, idx) => {
                const assistantName =
                  (assistant.metadata?.assistantName as string | undefined) ||
                  `My assistant ${idx + 1}`;
                const assistantDescription = assistant.metadata
                  ?.assistantDescription as string | undefined;
                const isSelected =
                  assistant.assistant_id === props.selectedAssistantId;
                return (
                  <DropdownMenuRadioItem
                    key={assistant.assistant_id}
                    value={assistant.assistant_id}
                    className={cn(
                      "py-2 cursor-pointer",
                      isSelected && "bg-gray-100"
                    )}
                  >
                    <div className="flex flex-col">
                      <p className="text-sm text-gray-800">{assistantName}</p>
                      {assistantDescription && (
                        <p className="text-xs font-light text-gray-500 mt-1 truncate max-w-64">
                          {assistantDescription}
                        </p>
                      )}
                    </div>
                  </DropdownMenuRadioItem>
                );
              })
            )}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="cursor-pointer">
            <NewAssistantDialog
              createAssistant={props.createAssistant}
              userId={props.userId}
            />
          </DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
