import { useState } from "react";
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

export function NewAssistantDialog() {
  const [open, setOpen] = useState(false);

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
            System Rules
          </DialogTitle>
          <DialogDescription className="mt-2 text-md font-light text-gray-600">
            The system rules set by you, included in every request.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"></div>
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
