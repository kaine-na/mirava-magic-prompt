import { cn } from "@/lib/utils";
import { Image, MessageSquare, Code, Music, FileText, Wand2, Video, Share2, Box, Megaphone, Mail, Palette } from "lucide-react";

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
    id: "video",
    label: "Video",
    icon: Video,
    color: "bg-secondary",
    description: "Video generation prompts",
  },
  {
    id: "social",
    label: "Social",
    icon: Share2,
    color: "bg-tertiary",
    description: "Social media posts",
  },
  {
    id: "3d",
    label: "3D Model",
    icon: Box,
    color: "bg-quaternary",
    description: "3D model prompts",
  },
  {
    id: "chat",
    label: "Chat",
    icon: MessageSquare,
    color: "bg-primary",
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
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
    color: "bg-secondary",
    description: "Ad copy & marketing",
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    color: "bg-tertiary",
    description: "Professional emails",
  },
  {
    id: "art",
    label: "Art Style",
    icon: Palette,
    color: "bg-quaternary",
    description: "Artistic style transfer",
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
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
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
