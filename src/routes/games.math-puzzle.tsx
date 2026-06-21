import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameShell } from "@/components/GameShell";
import { Ali, AliSpeech } from "@/components/Ali";
import { FunButton } from "@/components/FunButton";
import { playSound } from "@/lib/audio";
import { addStars, loadProgress, recordScore } from "@/lib/progress";
import { celebrate, tinyPop } from "@/lib/confetti";

export const Route = createFileRoute("/games/math-puzzle")({
  head: () => ({
    meta: [
      { title: "Matematik jumboq — Ali bilan" },
      { name: "description", content: "Yetishmayotgan raqamni top: 3 + ? = 7. Aql va mantiq mashqi." },
    ],
  }),
  component: MathPuzzle,
});

type Slot = "a" | "b" | "r";
type Op = "+" | "-";
interface Puz { a: number; b: number; op: Op; r: number; hide: Slot; options: number[]; }

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function build(level: "easy" | "mid" | "hard"): Puz[] {
  const cap = level === "easy" ? 5 : level === "mid" ? 10 : 20;
  const ops: Op[] = level === "easy" ? ["+"] : ["+", "-"];
  const out: Puz[] = [];
  for (let i = 0; i < 10; i++) {
    const op = ops[rand(0, ops.length - 1)];
    let a = rand(1, cap), b = rand(1, cap);
    if (op === "-" && b > a) [a, b] = [b, a];
    const r = op === "+" ? a + b : a - b;
    const hide: Slot = (["a","b","r"] as Slot[])[rand(0, 2)];
    const answer = hide === "a" ? a : hide === "b" ? b : r;
    const pool = new Set<number>([answer]);
    while (pool.size < 4) {
      const c = answer + rand(-3, 3);
      if (c >= 0 && c !== answer) pool.add(c);
    }
    out.push({ a, b, op, r, hide, options: [...pool].sort(() => Math.random() - 0.5) });
  }
  return out;
}

function MathPuzzle() {
  const [level, setLevel] = useState<"easy" | "mid" | "hard">("easy");
  const [rounds, setRounds] = useState(() => build("easy"));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(0);

  useEffect(() => { setBest(loadProgress().bestScores[`math-puz-${level}`] || 0); }, [level]);

  const restart = (lv = level) => { setRounds(build(lv)); setIdx(0); setScore(0); setPicked(null); setDone(false); };
  const q = rounds[idx];
  const answer = q.hide === "a" ? q.a : q.hide === "b" ? q.b : q.r;
  const pct = useMemo(() => ((idx + (picked !== null ? 1 : 0)) / rounds.length) * 100, [idx, picked, rounds.length]);

  const onPick = (v: number) => {
    if (picked !== null) return;
    setPicked(v);
    const ok = v === answer;
    if (ok) { setScore(s => s + 10); playSound("correct"); tinyPop(); } else playSound("wrong");
    setTimeout(() => {
      if (idx + 1 >= rounds.length) {
        setDone(true); celebrate(); playSound("win"); addStars(2);
        setBest(recordScore(`math-puz-${level}`, score + (ok ? 10 : 0)).bestScores[`math-puz-${level}`] || 0);
      } else { setIdx(i => i + 1); setPicked(null); }
    }, 800);
  };

  const cell = (slot: Slot, n: number) => (
    <span className={q.hide === slot
      ? "inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent text-accent-foreground border-4 border-dashed border-accent-foreground/40"
      : ""}>
      {q.hide === slot ? "?" : n}
    </span>
  );

  return (
    <GameShell title="Matematik jumboq" emoji="🧩" score={score} best={best}>
      <div className="flex items-center gap-2 bg-card rounded-full p-1 shadow-pop mb-4 w-fit">
        {(["easy","mid","hard"] as const).map(l => (
          <button key={l} onClick={() => { setLevel(l); restart(l); playSound("click"); }}
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
            <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-pop text-center">
              <div className="text-sm font-bold text-muted-foreground">{idx + 1} / {rounds.length}</div>
              <div className="text-5xl sm:text-6xl font-bold mt-5 flex items-center justify-center gap-3 flex-wrap">
                {cell("a", q.a)}
                <span className="text-muted-foreground">{q.op}</span>
                {cell("b", q.b)}
                <span className="text-muted-foreground">=</span>
                {cell("r", q.r)}
              </div>
              <p className="text-muted-foreground mt-4 font-bold">Yetishmayotgan raqamni top!</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              {q.options.map(opt => {
                const isPicked = picked === opt;
                const ok = picked !== null && opt === answer;
                const bad = isPicked && opt !== answer;
                return (
                  <motion.button key={opt} onClick={() => onPick(opt)}
                    whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}
                    className={`p-6 rounded-2xl shadow-pop font-bold text-3xl
                      ${ok ? "bg-success text-success-foreground" :
                        bad ? "bg-destructive text-destructive-foreground" : "bg-card"}`}>
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
              <AliSpeech className="mx-auto mt-2">Aqlli bola!</AliSpeech>
              <p className="mt-4 text-lg">Ball: <b>{score}</b> / {rounds.length * 10}</p>
              <FunButton variant="primary" size="lg" className="mt-6 w-full" onClick={() => restart()}>Yana</FunButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
