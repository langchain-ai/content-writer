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

const fakeAssistants = [
  {
    assistant_id: "assistant-1",
    graph_id: "graph-1",
    config: {
      tags: ["example", "demo"],
      recursion_limit: 25,
      configurable: {
        thread_id: "thread-1",
        checkpoint_id: "checkpoint-1",
      },
    },
    created_at: "2023-10-26T12:00:00.000Z",
    updated_at: "2023-10-26T12:00:00.000Z",
    metadata: {
      assistantName: "Example Assistant",
      assistantDescription: "This is an example assistant.",
    },
  },
  {
    assistant_id: "assistant-2",
    graph_id: "graph-2",
    config: {
      tags: ["example", "demo"],
      recursion_limit: 25,
      configurable: {
        thread_id: "thread-2",
        checkpoint_id: "checkpoint-2",
      },
    },
    created_at: "2023-10-26T12:00:00.000Z",
    updated_at: "2023-10-26T12:00:00.000Z",
    metadata: {
      assistantName: "Demo Assistant",
      assistantDescription: "This is a demo assistant.",
    },
  },
  {
    assistant_id: "assistant-3",
    graph_id: "graph-3",
    config: {
      tags: ["example", "demo"],
      recursion_limit: 25,
      configurable: {
        thread_id: "thread-3",
        checkpoint_id: "checkpoint-3",
      },
    },
    created_at: "2023-10-26T12:00:00.000Z",
    updated_at: "2023-10-26T12:00:00.000Z",
    metadata: {
      assistantName: "Test Assistant",
      assistantDescription: "This is a test assistant.",
    },
  },
  {
    assistant_id: "assistant-4",
    graph_id: "graph-4",
    config: {
      tags: ["example", "demo"],
      recursion_limit: 25,
      configurable: {
        thread_id: "thread-4",
        checkpoint_id: "checkpoint-4",
      },
    },
    created_at: "2023-10-26T12:00:00.000Z",
    updated_at: "2023-10-26T12:00:00.000Z",
    metadata: {
      assistantName: "Sample Assistant",
      assistantDescription: "This is a sample assistant.",
    },
  },
  {
    assistant_id: "assistant-5",
    graph_id: "graph-5",
    config: {
      tags: ["example", "demo"],
      recursion_limit: 25,
      configurable: {
        thread_id: "thread-5",
        checkpoint_id: "checkpoint-5",
      },
    },
    created_at: "2023-10-26T12:00:00.000Z",
    updated_at: "2023-10-26T12:00:00.000Z",
    metadata: {
      assistantName: "Trial Assistant",
      assistantDescription: "This is a trial assistant.",
    },
  },
  {
    assistant_id: "assistant-6",
    graph_id: "graph-6",
    config: {
      tags: ["example", "demo"],
      recursion_limit: 25,
      configurable: {
        thread_id: "thread-6",
        checkpoint_id: "checkpoint-6",
      },
    },
    created_at: "2023-10-26T12:00:00.000Z",
    updated_at: "2023-10-26T12:00:00.000Z",
    metadata: {
      assistantName: "Practice Assistant",
      assistantDescription: "This is a practice assistant.",
    },
  },
  {
    assistant_id: "assistant-7",
    graph_id: "graph-7",
    config: {
      tags: ["example", "demo"],
      recursion_limit: 25,
      configurable: {
        thread_id: "thread-7",
        checkpoint_id: "checkpoint-7",
      },
    },
    created_at: "2023-10-26T12:00:00.000Z",
    updated_at: "2023-10-26T12:00:00.000Z",
    metadata: {
      assistantName: "Exercise Assistant",
      assistantDescription: "This is an exercise assistant.",
    },
  },
  {
    assistant_id: "assistant-8",
    graph_id: "graph-8",
    config: {
      tags: ["example", "demo"],
      recursion_limit: 25,
      configurable: {
        thread_id: "thread-8",
        checkpoint_id: "checkpoint-8",
      },
    },
    created_at: "2023-10-26T12:00:00.000Z",
    updated_at: "2023-10-26T12:00:00.000Z",
    metadata: {
      assistantName: "Experiment Assistant",
      assistantDescription: "This is an experiment assistant.",
    },
  },
  {
    assistant_id: "assistant-9",
    graph_id: "graph-9",
    config: {
      tags: ["example", "demo"],
      recursion_limit: 25,
      configurable: {
        thread_id: "thread-9",
        checkpoint_id: "checkpoint-9",
      },
    },
    created_at: "2023-10-26T12:00:00.000Z",
    updated_at: "2023-10-26T12:00:00.000Z",
    metadata: {
      assistantName: "Prototype Assistant",
      assistantDescription: "This is a prototype assistant.",
    },
  },
  {
    assistant_id: "assistant-10",
    graph_id: "graph-10",
    config: {
      tags: ["example", "demo"],
      recursion_limit: 25,
      configurable: {
        thread_id: "thread-10",
        checkpoint_id: "checkpoint-10",
      },
    },
    created_at: "2023-10-26T12:00:00.000Z",
    updated_at: "2023-10-26T12:00:00.000Z",
    metadata: {
      assistantName: "Draft Assistant",
      assistantDescription: "This is a draft assistant.",
    },
  },
  {
    assistant_id: "assistant-11",
    graph_id: "graph-11",
    config: {
      tags: ["example", "demo"],
      recursion_limit: 25,
      configurable: {
        thread_id: "thread-11",
        checkpoint_id: "checkpoint-11",
      },
    },
    created_at: "2023-10-26T12:00:00.000Z",
    updated_at: "2023-10-26T12:00:00.000Z",
    metadata: {
      assistantName: "Concept Assistant",
      assistantDescription: "This is a concept assistant.",
    },
  },
  {
    assistant_id: "assistant-12",
    graph_id: "graph-12",
    config: {
      tags: ["example", "demo"],
      recursion_limit: 25,
      configurable: {
        thread_id: "thread-12",
        checkpoint_id: "checkpoint-12",
      },
    },
    created_at: "2023-10-26T12:00:00.000Z",
    updated_at: "2023-10-26T12:00:00.000Z",
    metadata: {
      assistantName: "Idea Assistant",
      assistantDescription: "This is an idea assistant.",
    },
  },
  {
    assistant_id: "assistant-13",
    graph_id: "graph-13",
    config: {
      tags: ["example", "demo"],
      recursion_limit: 25,
      configurable: {
        thread_id: "thread-13",
        checkpoint_id: "checkpoint-13",
      },
    },
    created_at: "2023-10-26T12:00:00.000Z",
    updated_at: "2023-10-26T12:00:00.000Z",
    metadata: {
      assistantName: "Suggestion Assistant",
      assistantDescription: "This is a suggestion assistant.",
    },
  },
  {
    assistant_id: "assistant-14",
    graph_id: "graph-14",
    config: {
      tags: ["example", "demo"],
      recursion_limit: 25,
      configurable: {
        thread_id: "thread-14",
        checkpoint_id: "checkpoint-14",
      },
    },
    created_at: "2023-10-26T12:00:00.000Z",
    updated_at: "2023-10-26T12:00:00.000Z",
    metadata: {
      assistantName: "Proposal Assistant",
      assistantDescription: "This is a proposal assistant.",
    },
  },
  {
    assistant_id: "assistant-15",
    graph_id: "graph-15",
    config: {
      tags: ["example", "demo"],
      recursion_limit: 25,
      configurable: {
        thread_id: "thread-15",
        checkpoint_id: "checkpoint-15",
      },
    },
    created_at: "2023-10-26T12:00:00.000Z",
    updated_at: "2023-10-26T12:00:00.000Z",
    metadata: {
      assistantName: "Recommendation Assistant",
      assistantDescription: "This is a recommendation assistant.",
    },
  },
];

export function AssistantsDropdown(props: AssistantsDropdownProps) {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(
    null
  );

  useEffect(() => {
    if (!props.userId || !props.selectedAssistantId || assistants.length > 0)
      return;

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
      setAssistants([selectedAssistant, ...otherAssistants, ...fakeAssistants]);
    });
  }, [props.userId, props.selectedAssistantId]);

  const handleChangeAssistant = (assistantId: string) => {
    if (assistantId === props.selectedAssistantId) return;

    props.setAssistantId(assistantId);
    // Force page reload
    window.location.reload();
  };

  const dropdownLabel = selectedAssistant
    ? (selectedAssistant.metadata?.assistantName as string)
    : "Select assistant";

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
