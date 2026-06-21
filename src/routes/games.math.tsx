import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameShell } from "@/components/GameShell";
import { Ali, AliSpeech } from "@/components/Ali";
import { FunButton } from "@/components/FunButton";
import { playSound } from "@/lib/audio";
import { addStars, loadProgress, recordScore } from "@/lib/progress";
import { celebrate, tinyPop } from "@/lib/confetti";

export const Route = createFileRoute("/games/math")({
  head: () => ({
    meta: [
      { title: "Raqamlar matematikasi — Ali bilan" },
      { name: "description", content: "Qo'shish va ayirish mashqlari — 3 ta qiyinlik darajasi." },
    ],
  }),
  component: Math0,
});

type Op = "+" | "-";
type Level = "easy" | "mid" | "hard";

interface Q { a: number; b: number; op: Op; ans: number; options: number[]; }

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function build(level: Level): Q[] {
  const cap = level === "easy" ? 5 : level === "mid" ? 10 : 20;
  const ops: Op[] = level === "easy" ? ["+"] : ["+", "-"];
  const out: Q[] = [];
  for (let i = 0; i < 10; i++) {
    const op = ops[rand(0, ops.length - 1)];
    let a = rand(1, cap), b = rand(1, cap);
    if (op === "-" && b > a) [a, b] = [b, a];
    const ans = op === "+" ? a + b : a - b;
    const pool = new Set<number>([ans]);
    while (pool.size < 4) {
      const cand = ans + rand(-3, 3);
      if (cand >= 0 && cand !== ans) pool.add(cand);
    }
    const options = [...pool].sort(() => Math.random() - 0.5);
    out.push({ a, b, op, ans, options });
  }
  return out;
}

function Math0() {
  const [level, setLevel] = useState<Level>("easy");
  const [rounds, setRounds] = useState<Q[]>(() => build("easy"));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(0);

  useEffect(() => { setBest(loadProgress().bestScores[`math-${level}`] || 0); }, [level]);

  const restart = (lv: Level = level) => {
    setRounds(build(lv)); setIdx(0); setScore(0); setPicked(null); setDone(false);
  };

  const q = rounds[idx];
  const pct = useMemo(() => ((idx + (picked !== null ? 1 : 0)) / rounds.length) * 100, [idx, picked, rounds.length]);

  const onPick = (v: number) => {
    if (picked !== null) return;
    setPicked(v);
    const correct = v === q.ans;
    if (correct) { setScore(s => s + 10); playSound("correct"); tinyPop(); }
    else { playSound("wrong"); }
    setTimeout(() => {
      if (idx + 1 >= rounds.length) {
        setDone(true); celebrate(); addStars(2); playSound("win");
        setBest(recordScore(`math-${level}`, score + (correct ? 10 : 0)).bestScores[`math-${level}`] || 0);
      } else { setIdx(i => i + 1); setPicked(null); }
    }, 800);
  };

  return (
    <GameShell title="Matematika" emoji="➕" score={score} best={best}>
      <div className="flex items-center gap-2 bg-card rounded-full p-1 shadow-pop mb-4 w-fit">
        {(["easy","mid","hard"] as Level[]).map(l => (
          <button key={l}
            onClick={() => { setLevel(l); restart(l); playSound("click"); }}
            className={`px-4 py-1.5 rounded-full font-bold text-sm ${level===l?"bg-primary text-primary-foreground":""}`}>
            {l==="easy"?"Oson":l==="mid"?"O'rta":"Qiyin"}
          </button>
        ))}
      </div>

      <div className="h-3 bg-card rounded-full overflow-hidden shadow-pop mb-6">
        <motion.div animate={{ width: `${pct}%` }} className="h-full bg-gradient-fun" />
      </div>

      <AnimatePresence mode="wait">
        {!done && (
          <motion.div key={idx} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
            <div className="bg-card rounded-3xl p-8 shadow-pop text-center">
              <div className="text-sm font-bold text-muted-foreground">{idx + 1} / {rounds.length}</div>
              <div className="text-6xl sm:text-7xl font-bold mt-4 flex items-center justify-center gap-3">
                <span className="text-primary">{q.a}</span>
                <span className="text-muted-foreground">{q.op}</span>
                <span className="text-primary">{q.b}</span>
                <span className="text-muted-foreground">=</span>
                <span className="text-accent-foreground">?</span>
              </div>
              {/* Visual aid for easy mode */}
              {level === "easy" && (
                <div className="flex items-center justify-center gap-1 mt-4 text-2xl flex-wrap">
                  {Array.from({ length: q.a }).map((_, i) => <span key={`a${i}`}>🍎</span>)}
                  <span className="mx-2 font-bold">{q.op}</span>
                  {Array.from({ length: q.b }).map((_, i) => <span key={`b${i}`}>{q.op === "+" ? "🍎" : "❌"}</span>)}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              {q.options.map(opt => {
                const isPicked = picked === opt;
                const correct = picked !== null && opt === q.ans;
                const wrong = isPicked && opt !== q.ans;
                return (
                  <motion.button key={opt} onClick={() => onPick(opt)}
                    whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}
                    className={`p-6 rounded-2xl shadow-pop font-bold text-3xl
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
              <AliSpeech className="mx-auto mt-2">Sen — matematik!</AliSpeech>
              <p className="mt-4 text-lg">Ball: <b>{score}</b> / {rounds.length * 10}</p>
              <FunButton variant="primary" size="lg" className="mt-6 w-full" onClick={() => restart()}>Yana</FunButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
