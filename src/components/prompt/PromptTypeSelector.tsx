import { cn } from "@/lib/utils";
import { Image, MessageSquare, Code, Music, FileText, Wand2 } from "lucide-react";

interface PromptType {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const promptTypes: PromptType[] = [
  {
    id: "image",
    label: "Image",
    icon: Image,
    color: "bg-primary",
    description: "Generate image prompts",
  },
  {
    id: "chat",
    label: "Chat",
    icon: MessageSquare,
    color: "bg-secondary",
    description: "Conversational AI prompts",
  },
  {
    id: "code",
    label: "Code",
    icon: Code,
    color: "bg-quaternary",
    description: "Programming prompts",
  },
  {
    id: "music",
    label: "Music",
    icon: Music,
    color: "bg-tertiary",
    description: "Audio generation prompts",
  },
  {
    id: "writing",
    label: "Writing",
    icon: FileText,
    color: "bg-primary",
    description: "Creative writing prompts",
  },
  {
    id: "custom",
    label: "Custom",
    icon: Wand2,
    color: "bg-secondary",
    description: "Build your own prompt",
  },
];

interface PromptTypeSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function PromptTypeSelector({ selected, onSelect }: PromptTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {promptTypes.map((type, index) => {
        const isSelected = selected === type.id;
        return (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            className={cn(
              "relative p-4 rounded-2xl border-2 transition-all duration-300 group animate-pop-in",
              isSelected
                ? "border-foreground bg-card shadow-hard"
                : "border-border bg-card/50 hover:border-foreground hover:shadow-hard-sm"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={cn(
                "w-12 h-12 mx-auto rounded-full border-2 border-foreground flex items-center justify-center mb-2 transition-all group-hover:animate-wiggle",
                type.color
              )}
            >
              <type.icon className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <p className="font-semibold text-sm text-center">{type.label}</p>
            {isSelected && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-tertiary rounded-full border-2 border-foreground flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
