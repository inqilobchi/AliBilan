import aliWave from "@/assets/ali-wave.png";
import aliCheer from "@/assets/ali-cheer.png";
import aliThink from "@/assets/ali-think.png";
import { motion } from "framer-motion";

const sources = { wave: aliWave, cheer: aliCheer, think: aliThink } as const;
export type AliMood = keyof typeof sources;

interface Props {
  mood?: AliMood;
  size?: number;
  className?: string;
  bounce?: boolean;
}

export function Ali({ mood = "wave", size = 220, className = "", bounce = true }: Props) {
  return (
    <motion.img
      key={mood}
      src={sources[mood]}
      alt={`Ali ${mood}`}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`select-none drop-shadow-xl ${bounce ? "animate-bounce-soft" : ""} ${className}`}
      initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 14 }}
      draggable={false}
    />
  );
}

interface SpeechProps {
  children: React.ReactNode;
  className?: string;
}

export function AliSpeech({ children, className = "" }: SpeechProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 16 }}
      className={`relative bg-card text-card-foreground rounded-3xl px-6 py-4 shadow-pop border-4 border-foreground/10 max-w-sm font-semibold text-lg ${className}`}
    >
      {children}
      <span className="absolute -bottom-3 left-10 w-6 h-6 bg-card border-b-4 border-r-4 border-foreground/10 rotate-45" />
    </motion.div>
  );
}
