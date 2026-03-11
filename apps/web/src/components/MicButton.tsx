import { Mic, MicOff } from "lucide-react";
import { useSpeechToText } from "@/hooks/useSpeechToText";

interface MicButtonProps {
  onAppend: (text: string) => void;
  className?: string;
}

export function MicButton({ onAppend, className = "" }: MicButtonProps) {
  const { isListening, isSupported, toggle } = useSpeechToText({ onAppend });

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      title={isListening ? "Parar gravação" : "Ditar por voz"}
      className={`relative flex items-center justify-center size-7 rounded-lg transition-all duration-300 ${
        isListening
          ? "text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30"
          : "text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10"
      } ${className}`}
    >
      {isListening && (
        <span className="absolute inset-0 rounded-lg animate-ping bg-red-500/20 pointer-events-none" />
      )}
      {isListening ? (
        <MicOff className="h-3.5 w-3.5 relative z-10" />
      ) : (
        <Mic className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
