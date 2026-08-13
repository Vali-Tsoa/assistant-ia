import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import {
  ZapIcon,
  MessageCircleDashedIcon,
  WandSparklesIcon,
  BoxIcon,
} from "lucide-react";
import { ChatInputBox } from "./chat-input-box";

const chatModes = [
  { id: "fast", label: "Fast", icon: ZapIcon },
  { id: "in-depth", label: "In-depth", icon: MessageCircleDashedIcon },
  { id: "magic", label: "Magic AI", icon: WandSparklesIcon, pro: true },
  { id: "holistic", label: "Holistic", icon: BoxIcon },
];

interface ChatWelcomeScreenProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  selectedMode: string;
  onModeChange: (modeId: string) => void;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export function ChatWelcomeScreen({
  message,
  onMessageChange,
  onSend,
  selectedMode,
  onModeChange,
  selectedModel,
  onModelChange,
}: ChatWelcomeScreenProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 md:px-8">
      <div className="w-full max-w-[640px] space-y-9 -mt-12">
        <div className="flex justify-center">
          <div className="flex items-center justify-center rounded-full">
           <img src="download 1.png" alt="" className="w-30" />
          </div>
        </div>

        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            L’assistant IA de NeoCoders
          </h1>

          <Logo className="h-12 w-12" />
        </div>

        <p className="mt-3 text-center text-base text-gray-500 dark:text-gray-400">
          Comment pouvons-nous vous aider aujourd’hui ?
        </p>
         
        </div>

        <ChatInputBox
          message={message}
          onMessageChange={onMessageChange}
          onSend={onSend}
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          showTools={true}
        />
      </div>
    </div>
  );
}

