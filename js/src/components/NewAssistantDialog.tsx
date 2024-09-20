import { FormEventHandler, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { PlusCircleIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { type Assistant } from "@langchain/langgraph-sdk";

export interface NewAssistantDialogProps {
  createAssistant: (
    graphId: string,
    extra?: { assistantName?: string, assistantDescription?: string }
  ) => Promise<Assistant | undefined>;
}

export function NewAssistantDialog(props: NewAssistantDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateNewAssistant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    await props.createAssistant(process.env.NEXT_PUBLIC_LANGGRAPH_GRAPH_ID ?? "", {
      assistantName: name,
      assistantDescription: description,
    });
    setIsLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger className="hover:cursor-pointer" asChild>
              <PlusCircleIcon />
            </TooltipTrigger>
            <TooltipContent>New assistant</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent className="max-w-xl p-8 bg-white rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-light text-gray-800">
            Create a new assistant
          </DialogTitle>
        </DialogHeader>
        <div className="mt-6 max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <form onSubmit={handleCreateNewAssistant}>
            <label>Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tweet writer" />
            <label>Description</label>
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="For writing tweets about..." />
          </form>
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => {}}
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded shadow transition"
          >
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
