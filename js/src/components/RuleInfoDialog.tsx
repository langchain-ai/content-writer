"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

export interface RuleInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RuleInfoDialog(props: RuleInfoDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Understanding Rule Generation
          </DialogTitle>
        </DialogHeader>
        <div className="mt-6 space-y-4">
          <p className="text-base text-gray-700 leading-relaxed">
            Rule generation is a process where our AI powered agent learns to
            create better tweets aligned with your preferences. It&apos;s
            triggered in two ways:
          </p>
          <ul className="list-disc list-inside text-base text-gray-700 leading-relaxed pl-4">
            <li>When you copy an AI-generated tweet</li>
            <li>When you edit and save an AI-generated tweet</li>
          </ul>
          <p className="text-base text-gray-700 leading-relaxed">
            Once triggered, the agent analyzes your conversation history and any
            edits you&apos;ve made to generate a set of rules. These rules are
            then used to improve future tweet suggestions, ensuring they better
            match your style and preferences.
          </p>
        </div>
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => props.onOpenChange(false)}
            className="px-6 py-2 bg-primary text-white text-lg font-semibold rounded-lg hover:bg-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          >
            Got it!
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
