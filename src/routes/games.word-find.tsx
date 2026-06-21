import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameShell } from "@/components/GameShell";
import { WORD_ITEMS } from "@/lib/games-data";
import { Ali, AliSpeech } from "@/components/Ali";
import { FunButton } from "@/components/FunButton";
import { addStars, loadProgress, recordScore } from "@/lib/progress";
import { celebrate, tinyPop } from "@/lib/confetti";

export const Route = createFileRoute("/games/word-find")({
  head: () => ({
    meta: [
      { title: "So'z topish — Ali bilan" },
      { name: "description", content: "Rasmga mos so'zni 4 ta variantdan tanlang. Lug'at boyitish va o'qish mashqi." },
    ],
  }),
  component: WordFind,
});

const ROUND_COUNT = 10;

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function buildRounds() {
  const picks = shuffle(WORD_ITEMS).slice(0, ROUND_COUNT);
  return picks.map(item => {
    const distractors = shuffle(WORD_ITEMS.filter(w => w.word !== item.word)).slice(0, 3);
    return { item, options: shuffle([item, ...distractors]).map(o => o.word) };
  });
}

function WordFind() {
  const [rounds, setRounds] = useState(() => buildRounds());
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(0);
  useEffect(() => { setBest(loadProgress().bestScores["word-find"] || 0); }, []);

  const current = rounds[idx];
  const isCorrect = picked && picked === current.item.word;

  const onPick = (w: string) => {
    if (picked) return;
    setPicked(w);
    if (w === current.item.word) { setScore(s => s + 10); tinyPop(); }
    setTimeout(() => {
      if (idx + 1 >= rounds.length) {
        setDone(true);
        celebrate();
        addStars(2);
        setBest(recordScore("word-find", score + (w === current.item.word ? 10 : 0)).bestScores["word-find"] || 0);
      } else {
        setIdx(i => i + 1); setPicked(null);
      }
    }, 900);
  };

  const restart = () => { setRounds(buildRounds()); setIdx(0); setScore(0); setPicked(null); setDone(false); };

  const progressPct = useMemo(() => ((idx + (picked ? 1 : 0)) / rounds.length) * 100, [idx, picked, rounds.length]);

  return (
    <GameShell title="So'z topish" emoji="🔤" score={score} best={best}>
      <div className="h-3 bg-card rounded-full overflow-hidden shadow-pop mb-6">
        <motion.div animate={{ width: `${progressPct}%` }} className="h-full bg-gradient-fun" />
      </div>

      <AnimatePresence mode="wait">
        {!done && (
          <motion.div key={idx} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            <div className="bg-card rounded-3xl p-8 shadow-pop text-center">
              <div className="text-sm font-bold text-muted-foreground mb-2">{idx + 1} / {rounds.length}</div>
              <motion.div key={current.item.emoji} initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} className="text-8xl sm:text-9xl my-4">
                {current.item.emoji}
              </motion.div>
              <p className="text-muted-foreground font-bold">Bu nima?</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              {current.options.map(opt => {
                const isPicked = picked === opt;
                const correct = picked && opt === current.item.word;
                const wrong = isPicked && opt !== current.item.word;
                return (
                  <motion.button
                    key={opt} onClick={() => onPick(opt)}
                    whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}
                    className={`p-5 rounded-2xl shadow-pop font-bold text-lg sm:text-xl transition
                      ${correct ? "bg-success text-success-foreground" :
                        wrong ? "bg-destructive text-destructive-foreground" :
                        "bg-card"}`}
                  >
                    {opt}
                  </motion.button>
                );
              })}
            </div>

            {picked && (
              <div className="mt-5 flex items-end gap-3">
                <Ali mood={isCorrect ? "cheer" : "think"} size={100} bounce={false} />
                <AliSpeech>{isCorrect ? "Ofarin!" : `Bu — ${current.item.word}`}</AliSpeech>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
            <div className="bg-card rounded-3xl p-8 shadow-pop max-w-sm w-full text-center">
              <Ali mood="cheer" size={180} />
              <h2 className="text-3xl font-bold mt-2">Yakun!</h2>
              <p className="mt-2 text-lg">Sening balling: <b>{score}</b></p>
              <p className="text-muted-foreground">⭐ +2 yulduz</p>
              <FunButton variant="primary" size="lg" className="mt-6 w-full" onClick={restart}>Yana</FunButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
