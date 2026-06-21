import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameShell } from "@/components/GameShell";
import { UZ_ALPHABET } from "@/lib/games-data";
import { Ali, AliSpeech } from "@/components/Ali";
import { FunButton } from "@/components/FunButton";
import { addStars, loadProgress, recordScore } from "@/lib/progress";
import { celebrate, tinyPop } from "@/lib/confetti";

export const Route = createFileRoute("/games/letter-race")({
  head: () => ({
    meta: [
      { title: "Harflar poygasi — Ali bilan" },
      { name: "description", content: "Berilgan harfni 9 ta variantdan tezroq tanlang. Reaksiya va harf tanish mashqi." },
    ],
  }),
  component: LetterRace,
});

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function buildBoard(target: string): string[] {
  const others = UZ_ALPHABET.filter(l => l !== target);
  const board: string[] = [target];
  while (board.length < 9) {
    const l = pick(others);
    if (!board.includes(l)) board.push(l);
  }
  return board.sort(() => Math.random() - 0.5);
}

function LetterRace() {
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [time, setTime] = useState(30);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [target, setTarget] = useState<string>("A");
  const [board, setBoard] = useState<string[]>(buildBoard("A"));
  const [shake, setShake] = useState(false);
  const [best, setBest] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => { setBest(loadProgress().bestScores["letter-race"] || 0); }, []);

  const next = () => {
    const t = pick(UZ_ALPHABET);
    setTarget(t); setBoard(buildBoard(t));
  };

  const start = () => {
    setPhase("play"); setTime(30); setScore(0); setCombo(0);
    next();
    timerRef.current = window.setInterval(() => {
      setTime(t => {
        if (t <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          setPhase("done");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);

  useEffect(() => {
    if (phase === "done") {
      celebrate(); addStars(2);
      setBest(recordScore("letter-race", score).bestScores["letter-race"] || 0);
    }
    // eslint-disable-next-line
  }, [phase]);

  const onPick = (l: string) => {
    if (l === target) {
      tinyPop();
      setCombo(c => c + 1);
      setScore(s => s + 10 + Math.min(combo * 2, 20));
      next();
    } else {
      setCombo(0);
      setShake(true); setTimeout(() => setShake(false), 300);
      setScore(s => Math.max(0, s - 3));
    }
  };

  return (
    <GameShell title="Harflar poygasi" emoji="🏁" score={score} best={best}>
      {phase === "intro" && (
        <div className="bg-card rounded-3xl p-8 shadow-pop text-center">
          <Ali mood="wave" size={180} />
          <AliSpeech className="mx-auto mt-2">Men aytaman — sen tezroq bos! 30 soniya bor.</AliSpeech>
          <FunButton variant="primary" size="xl" className="mt-8" onClick={start}>🏁 Start</FunButton>
        </div>
      )}

      {phase === "play" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-card rounded-full px-4 py-2 shadow-pop font-bold">⏱️ {time}s</div>
            {combo >= 3 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-gradient-sun text-accent-foreground rounded-full px-4 py-2 shadow-pop font-bold">
                🔥 {combo}x kombo
              </motion.div>
            )}
          </div>

          <motion.div
            key={target}
            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-fun text-primary-foreground rounded-3xl p-8 shadow-pop text-center mb-5"
          >
            <div className="text-sm font-bold opacity-80">TOP:</div>
            <div className="text-8xl sm:text-9xl font-bold">{target}</div>
          </motion.div>

          <motion.div
            animate={shake ? { x: [-8, 8, -6, 6, 0] } : {}}
            className="grid grid-cols-3 gap-3"
          >
            {board.map((l, i) => (
              <motion.button
                key={`${l}-${i}`} onClick={() => onPick(l)}
                whileTap={{ scale: 0.9 }} whileHover={{ y: -3 }}
                className="aspect-square rounded-2xl bg-card shadow-pop text-4xl sm:text-5xl font-bold"
              >
                {l}
              </motion.button>
            ))}
          </motion.div>
        </>
      )}

      <AnimatePresence>
        {phase === "done" && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
            <div className="bg-card rounded-3xl p-8 shadow-pop max-w-sm w-full text-center">
              <Ali mood="cheer" size={180} />
              <h2 className="text-3xl font-bold mt-2">Vaqt tugadi!</h2>
              <p className="mt-2 text-lg">Ball: <b>{score}</b></p>
              <p className="text-muted-foreground">Eng yaxshi: 🏆 {Math.max(best, score)}</p>
              <FunButton variant="primary" size="lg" className="mt-6 w-full" onClick={start}>Yana</FunButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
