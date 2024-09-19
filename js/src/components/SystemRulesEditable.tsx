import { HAS_SEEN_DIALOG } from "@/constants";
import { setCookie } from "@/lib/cookies";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

export interface SystemRulesEditableProps {
  setOpen: (open: boolean) => void;
  setSystemRulesAndSave: (newSystemRules: string) => Promise<void>;
  systemRules: string;
  setSystemRules: (newSystemRules: string) => void;
}

export function SystemRulesEditable(props: SystemRulesEditableProps) {
  const { setSystemRules, setOpen, setSystemRulesAndSave, systemRules } = props;
  const handleSaveAndClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (process.env.NODE_ENV !== "development") {
      setCookie(HAS_SEEN_DIALOG, "true");
    }
    setOpen(false);
    await setSystemRulesAndSave(systemRules ?? "");
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-light text-gray-800 mb-2">System Rules</h3>
      <p className="text-sm font-light text-gray-600 mb-4">
        The agent has a set of &quot;system rules&quot; which are provided every
        time. You can edit them below.
      </p>
      <form className="flex flex-col gap-4" onSubmit={handleSaveAndClose}>
        <Textarea
          rows={8}
          value={systemRules}
          onChange={(e) => setSystemRules(e.target.value)}
        />
        <div className="flex justify-end">
          <Button variant="outline" type="submit" size="sm">
            Save and close
          </Button>
        </div>
      </form>
    </div>
  );
}
