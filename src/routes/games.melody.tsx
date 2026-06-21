import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameShell } from "@/components/GameShell";
import { Ali, AliSpeech } from "@/components/Ali";
import { FunButton } from "@/components/FunButton";
import { NOTES, playNote, playSound } from "@/lib/audio";
import { addStars, loadProgress, recordScore } from "@/lib/progress";
import { celebrate } from "@/lib/confetti";

export const Route = createFileRoute("/games/melody")({
  head: () => ({
    meta: [
      { title: "Ohang topish — Ali bilan" },
      { name: "description", content: "Aliga ergash: u chalgan ohangni qaytar. Har raundda nota qo'shiladi." },
    ],
  }),
  component: Melody,
});

const PAD_NOTES = ["C", "D", "E", "F", "G", "A", "B"] as const;
const PAD_COLORS = ["#ef4444", "#f97316", "#facc15", "#22c55e", "#06b6d4", "#3b82f6", "#a855f7"];

type Note = typeof PAD_NOTES[number];

function rand(): Note { return PAD_NOTES[Math.floor(Math.random() * PAD_NOTES.length)]; }

function Melody() {
  const [seq, setSeq] = useState<Note[]>([]);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"idle" | "show" | "play" | "lost">("idle");
  const [active, setActive] = useState<Note | null>(null);
  const [best, setBest] = useState(0);
  const cancelRef = useRef(false);

  useEffect(() => { setBest(loadProgress().bestScores["melody"] || 0); void NOTES; }, []);

  const showSequence = async (s: Note[]) => {
    setPhase("show"); cancelRef.current = false;
    await new Promise(r => setTimeout(r, 500));
    for (const n of s) {
      if (cancelRef.current) return;
      setActive(n); playNote(n, 0.35);
      await new Promise(r => setTimeout(r, 450));
      setActive(null);
      await new Promise(r => setTimeout(r, 150));
    }
    setStep(0); setPhase("play");
  };

  const start = () => {
    const s = [rand(), rand()];
    setSeq(s); setStep(0);
    void showSequence(s);
  };

  const reset = () => { cancelRef.current = true; setPhase("idle"); setSeq([]); setStep(0); };

  const onPad = (n: Note) => {
    if (phase !== "play") return;
    playNote(n, 0.25);
    setActive(n); setTimeout(() => setActive(null), 180);
    if (n === seq[step]) {
      if (step + 1 >= seq.length) {
        // round won
        playSound("correct");
        const newSeq = [...seq, rand()];
        if (newSeq.length - 1 > best) setBest(recordScore("melody", newSeq.length - 1).bestScores["melody"] || 0);
        addStars(1);
        setTimeout(() => { setSeq(newSeq); void showSequence(newSeq); }, 500);
      } else {
        setStep(s => s + 1);
      }
    } else {
      playSound("wrong");
      setPhase("lost");
    }
  };

  const onReplay = () => { if (phase === "play") void showSequence(seq); };

  const finalScore = seq.length - 1;

  return (
    <GameShell title="Ohang topish" emoji="🎵" score={Math.max(0, finalScore)} best={best}>
      {phase === "idle" && (
        <div className="bg-card rounded-3xl p-8 shadow-pop text-center">
          <Ali mood="wave" size={180} />
          <AliSpeech className="mx-auto mt-2">Men ohang chalaman — sen takrorla! 🎶</AliSpeech>
          <FunButton variant="primary" size="xl" className="mt-8" onClick={start}>▶️ Boshlash</FunButton>
        </div>
      )}

      {(phase === "show" || phase === "play") && (
        <>
          <div className="bg-card rounded-2xl px-4 py-3 shadow-pop mb-5 flex items-center justify-between">
            <span className="font-bold">Daraja: {seq.length - 1}</span>
            <span className="text-sm text-muted-foreground">{phase === "show" ? "Eshit..." : `Qaytar (${step}/${seq.length})`}</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {PAD_NOTES.map((n, i) => (
              <motion.button
                key={n} onClick={() => onPad(n)} disabled={phase !== "play"}
                animate={{ scale: active === n ? 1.15 : 1, opacity: phase === "show" && active !== n ? 0.5 : 1 }}
                className="aspect-[1/2] rounded-2xl shadow-pop text-white font-bold flex items-end justify-center pb-3"
                style={{ background: PAD_COLORS[i] }}
              >
                {n}
              </motion.button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <FunButton variant="ghost" size="lg" onClick={onReplay} disabled={phase !== "play"}>🔁 Yana eshit</FunButton>
            <FunButton variant="ghost" size="lg" onClick={reset}>⏹️ To'xtat</FunButton>
          </div>
        </>
      )}

      <AnimatePresence>
        {phase === "lost" && (
          <LostModal finalScore={finalScore} best={best} onRestart={start} />
        )}
      </AnimatePresence>
    </GameShell>
  );
}

function LostModal({ finalScore, best, onRestart }: { finalScore: number; best: number; onRestart: () => void }) {
  useEffect(() => { if (finalScore > 0) celebrate(); }, [finalScore]);
  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
      <div className="bg-card rounded-3xl p-8 shadow-pop max-w-sm w-full text-center">
        <Ali mood={finalScore > 0 ? "cheer" : "think"} size={170} />
        <h2 className="text-3xl font-bold mt-2">{finalScore > 0 ? "Yaxshi urinish!" : "Yana sinab ko'r!"}</h2>
        <p className="mt-2">Daraja: <b>{finalScore}</b> · 🏆 {best}</p>
        <FunButton variant="primary" size="lg" className="mt-6 w-full" onClick={onRestart}>Yana</FunButton>
      </div>
    </motion.div>
  );
}
