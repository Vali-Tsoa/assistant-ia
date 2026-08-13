import {
  PaperclipIcon,
  CircleDashedIcon,
  SparklesIcon,
  ChevronDownIcon,
  CheckIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/ui/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface ChatInputBoxProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  showTools?: boolean;
  placeholder?: string;
}

export function ChatInputBox({
  message,
  onMessageChange,
  onSend,
  selectedModel,
  onModelChange,
  showTools = true,
  placeholder = "Décrivez votre problème...",
}: ChatInputBoxProps) {
  return (
    <div className="rounded-2xl border border-border bg-secondary dark:bg-card p-1">
      <div className="rounded-xl border border-border dark:border-transparent bg-card dark:bg-secondary">
        <Textarea
          placeholder={placeholder}
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          className="min-h-[120px] resize-none border-0 bg-transparent px-4 py-3 text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />

       
      </div>
    </div>
  );
}

