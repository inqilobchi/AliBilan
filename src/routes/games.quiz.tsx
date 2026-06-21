import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameShell } from "@/components/GameShell";
import { Ali, AliSpeech } from "@/components/Ali";
import { FunButton } from "@/components/FunButton";
import { addStars, loadProgress, recordScore } from "@/lib/progress";
import { celebrate, tinyPop } from "@/lib/confetti";

export const Route = createFileRoute("/games/quiz")({
  head: () => ({
    meta: [
      { title: "Bilim testi — Ali bilan" },
      { name: "description", content: "Ranglar, raqamlar va atrof-olam bo'yicha qiziqarli savollar." },
    ],
  }),
  component: Quiz,
});

interface Q { q: string; emoji?: string; options: string[]; answer: number; }

const BANK: Q[] = [
  { q: "Bu nechta?", emoji: "🍎🍎🍎", options: ["2","3","4","5"], answer: 1 },
  { q: "Bu nechta?", emoji: "⭐⭐⭐⭐⭐", options: ["3","4","5","6"], answer: 2 },
  { q: "Bu nechta?", emoji: "🐶🐶", options: ["1","2","3","4"], answer: 1 },
  { q: "Quyosh qanday rangda?", options: ["Ko'k","Yashil","Sariq","Pushti"], answer: 2 },
  { q: "Olma odatda qanday rangda?", options: ["Qizil","Ko'k","Qora","Binafsha"], answer: 0 },
  { q: "Osmon qanday rangda?", options: ["Sariq","Ko'k","Yashil","Pushti"], answer: 1 },
  { q: "Maysazor qanday rangda?", options: ["Qizil","Yashil","Oq","Qora"], answer: 1 },
  { q: "It qanday gapiradi?", options: ["Miyov","Vov","Ma","Quv-quv"], answer: 1 },
  { q: "Mushuk qanday gapiradi?", options: ["Miyov","Vov","Ma","Ku-kareku"], answer: 0 },
  { q: "Sigir qanday gapiradi?", options: ["Mu","Vov","Miyov","Be"], answer: 0 },
  { q: "Xo'roz qanday gapiradi?", options: ["Mu","Ku-kareku","Miyov","Ma"], answer: 1 },
  { q: "Nechta panja bor mushukda?", options: ["2","3","4","6"], answer: 2 },
  { q: "Bir hafta nechta kun?", options: ["5","6","7","10"], answer: 2 },
  { q: "Bir yil nechta oy?", options: ["10","11","12","14"], answer: 2 },
  { q: "Qaysi biri meva?", options: ["Sabzi","Banan","Kartoshka","Piyoz"], answer: 1 },
  { q: "Qaysi biri sabzavot?", options: ["Olma","Uzum","Sabzi","Banan"], answer: 2 },
  { q: "Qaysi biri uchadi?", options: ["Baliq","Qush","It","Toshbaqa"], answer: 1 },
  { q: "Qaysi biri suvda yashaydi?", options: ["Sher","Baliq","Maymun","Quyon"], answer: 1 },
  { q: "Qaysi figura 3 burchakli?", options: ["Doira","Kvadrat","Uchburchak","Yulduz"], answer: 2 },
  { q: "2 + 1 = ?", options: ["2","3","4","5"], answer: 1 },
  { q: "3 + 2 = ?", options: ["4","5","6","7"], answer: 1 },
  { q: "5 - 1 = ?", options: ["3","4","5","6"], answer: 1 },
  { q: "4 + 4 = ?", options: ["6","7","8","9"], answer: 2 },
  { q: "10 - 3 = ?", options: ["6","7","8","9"], answer: 1 },
];

function shuffle<T>(a: T[]): T[] {
  const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b;
}

function Quiz() {
  const rounds = useMemo(() => shuffle(BANK).slice(0, 10), []);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(0);
  useEffect(() => { setBest(loadProgress().bestScores["quiz"] || 0); }, []);

  const q = rounds[idx];

  const onPick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === q.answer;
    if (correct) { setScore(s => s + 10); tinyPop(); }
    setTimeout(() => {
      if (idx + 1 >= rounds.length) {
        setDone(true); celebrate(); addStars(2);
        setBest(recordScore("quiz", score + (correct ? 10 : 0)).bestScores["quiz"] || 0);
      } else { setIdx(i => i + 1); setPicked(null); }
    }, 900);
  };

  return (
    <GameShell title="Bilim testi" emoji="❓" score={score} best={best}>
      <div className="h-3 bg-card rounded-full overflow-hidden shadow-pop mb-6">
        <motion.div animate={{ width: `${((idx + (picked !== null ? 1 : 0)) / rounds.length) * 100}%` }} className="h-full bg-gradient-fun" />
      </div>

      <AnimatePresence mode="wait">
        {!done && (
          <motion.div key={idx} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
            <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-pop text-center">
              <div className="text-sm font-bold text-muted-foreground">{idx + 1} / {rounds.length}</div>
              {q.emoji && <div className="text-6xl my-3">{q.emoji}</div>}
              <h2 className="text-2xl sm:text-3xl font-bold mt-2">{q.q}</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-5">
              {q.options.map((opt, i) => {
                const isPicked = picked === i;
                const correct = picked !== null && i === q.answer;
                const wrong = isPicked && i !== q.answer;
                return (
                  <motion.button key={i} onClick={() => onPick(i)}
                    whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}
                    className={`p-5 rounded-2xl shadow-pop font-bold text-lg sm:text-xl
                      ${correct ? "bg-success text-success-foreground" :
                        wrong ? "bg-destructive text-destructive-foreground" : "bg-card"}`}>
                    {opt}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
            <div className="bg-card rounded-3xl p-8 shadow-pop max-w-sm w-full text-center">
              <Ali mood="cheer" size={180} />
              <AliSpeech className="mx-auto mt-2">Aql sinovini yakunlading!</AliSpeech>
              <p className="mt-4 text-lg">Ball: <b>{score}</b> / {rounds.length * 10}</p>
              <FunButton variant="primary" size="lg" className="mt-6 w-full" onClick={() => { setIdx(0); setScore(0); setPicked(null); setDone(false); }}>
                Yana
              </FunButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
