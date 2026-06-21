import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface Props {
  title: string;
  emoji: string;
  score?: number;
  best?: number;
  children: ReactNode;
}

export function GameShell({ title, emoji, score, best, children }: Props) {
  return (
    <main className="relative min-h-screen overflow-hidden bubble-bg">
      <header className="relative z-10 flex items-center justify-between p-4 sm:p-6">
        <Link to="/menu" className="font-bold flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-pop">
          ← Menyu
        </Link>
        <div className="font-bold text-xl flex items-center gap-2">
          <span className="text-2xl">{emoji}</span> {title}
        </div>
        <div className="flex items-center gap-2">
          {typeof score === "number" && (
            <div className="bg-accent text-accent-foreground rounded-full px-3 py-1.5 shadow-pop font-bold text-sm">
              {score} ball
            </div>
          )}
          {typeof best === "number" && best > 0 && (
            <div className="bg-card rounded-full px-3 py-1.5 shadow-pop font-bold text-sm hidden sm:flex items-center gap-1">
              🏆 {best}
            </div>
          )}
        </div>
      </header>
      <section className="relative z-10 px-4 pb-10 max-w-3xl mx-auto">
        {children}
      </section>
    </main>
  );
}
