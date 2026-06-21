import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameShell } from "@/components/GameShell";
import { Ali, AliSpeech } from "@/components/Ali";
import { FunButton } from "@/components/FunButton";
import { playSound } from "@/lib/audio";
import { addStars, loadProgress, recordScore } from "@/lib/progress";
import { celebrate, tinyPop } from "@/lib/confetti";

export const Route = createFileRoute("/games/animals")({
  head: () => ({
    meta: [
      { title: "Hayvon ovozlari — Ali bilan" },
      { name: "description", content: "Ovozni eshit va hayvonni top. Sodda taqlidlar bilan o'rgan." },
    ],
  }),
  component: Animals,
});

// Each animal has a synthetic call pattern (works without mp3).
// If you add mp3s like /audio/animal-it.mp3, they will be used automatically.
interface Animal {
  id: string; name: string; emoji: string;
  // notes: [freqHz, durSec, gapSec][]
  notes: [number, number, number][];
  type?: OscillatorType;
}

const ANIMALS: Animal[] = [
  { id: "it",       name: "It",        emoji: "🐶", notes: [[180,0.12,0.04],[160,0.14,0.08],[180,0.12,0]], type: "square" },
  { id: "mushuk",   name: "Mushuk",    emoji: "🐱", notes: [[700,0.22,0.05],[900,0.28,0]], type: "sine" },
  { id: "sigir",    name: "Sigir",     emoji: "🐮", notes: [[180,0.45,0.05],[140,0.5,0]], type: "sawtooth" },
  { id: "qo'y",     name: "Qo'y",      emoji: "🐑", notes: [[420,0.16,0.04],[380,0.16,0.04],[420,0.18,0]], type: "triangle" },
  { id: "echki",    name: "Echki",     emoji: "🐐", notes: [[520,0.1,0.04],[480,0.1,0.04],[520,0.1,0.04],[480,0.1,0]], type: "triangle" },
  { id: "xo'roz",   name: "Xo'roz",    emoji: "🐓", notes: [[660,0.18,0.04],[990,0.22,0.04],[770,0.3,0]], type: "square" },
  { id: "tovuq",    name: "Tovuq",     emoji: "🐔", notes: [[440,0.08,0.06],[440,0.08,0.06],[330,0.18,0]], type: "square" },
  { id: "o'rdak",   name: "O'rdak",    emoji: "🦆", notes: [[260,0.1,0.04],[240,0.1,0.04],[260,0.1,0]], type: "sawtooth" },
  { id: "ot",       name: "Ot",        emoji: "🐴", notes: [[300,0.5,0.05],[260,0.3,0]], type: "sawtooth" },
  { id: "ari",      name: "Ari",       emoji: "🐝", notes: [[300,0.6,0]], type: "sawtooth" },
  { id: "qurbaqa",  name: "Qurbaqa",   emoji: "🐸", notes: [[160,0.12,0.06],[160,0.12,0.06],[160,0.12,0]], type: "square" },
  { id: "boyo'g'li",name: "Boyo'g'li", emoji: "🦉", notes: [[440,0.3,0.08],[440,0.4,0]], type: "sine" },
];

function shuffle<T>(a: T[]): T[] {
  const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b;
}

let ctxSingleton: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctxSingleton) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctxSingleton = new Ctor();
  }
  return ctxSingleton;
}

function playAnimal(a: Animal) {
  const ac = getCtx(); if (!ac) return;
  let t = ac.currentTime + 0.02;
  for (const [f, d, gap] of a.notes) {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = a.type ?? "sine";
    osc.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.22, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + d);
    osc.connect(g).connect(ac.destination);
    osc.start(t); osc.stop(t + d + 0.02);
    t += d + gap;
  }
}

interface Round { target: Animal; options: Animal[]; }

function build(): Round[] {
  return Array.from({ length: 8 }, () => {
    const pool = shuffle(ANIMALS);
    const target = pool[0];
    const distractors = pool.slice(1, 4);
    return { target, options: shuffle([target, ...distractors]) };
  });
}

function Animals() {
  const [rounds, setRounds] = useState(build);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(0);

  useEffect(() => { setBest(loadProgress().bestScores["animals"] || 0); }, []);

  const r = rounds[idx];
  const pct = useMemo(() => ((idx + (picked ? 1 : 0)) / rounds.length) * 100, [idx, picked, rounds.length]);

  const play = () => playAnimal(r.target);

  // Auto-play on each new round
  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => playAnimal(r.target), 300);
    return () => clearTimeout(t);
  }, [idx, done, r.target]);

  const onPick = (a: Animal) => {
    if (picked) return;
    setPicked(a.id);
    const ok = a.id === r.target.id;
    if (ok) { setScore(s => s + 10); playSound("correct"); tinyPop(); }
    else { playSound("wrong"); setTimeout(() => playAnimal(r.target), 300); }
    setTimeout(() => {
      if (idx + 1 >= rounds.length) {
        setDone(true); celebrate(); playSound("win"); addStars(2);
        setBest(recordScore("animals", score + (ok ? 10 : 0)).bestScores["animals"] || 0);
      } else { setIdx(i => i + 1); setPicked(null); }
    }, 1100);
  };

  const restart = () => { setRounds(build()); setIdx(0); setScore(0); setPicked(null); setDone(false); };

  return (
    <GameShell title="Hayvon ovozlari" emoji="🐾" score={score} best={best}>
      <div className="h-3 bg-card rounded-full overflow-hidden shadow-pop mb-6">
        <motion.div animate={{ width: `${pct}%` }} className="h-full bg-gradient-fun" />
      </div>

      <AnimatePresence mode="wait">
        {!done && (
          <motion.div key={idx} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
            <div className="bg-card rounded-3xl p-8 shadow-pop text-center">
              <div className="text-sm font-bold text-muted-foreground">{idx + 1} / {rounds.length}</div>
              <p className="font-bold text-lg mt-2">Qaysi hayvonning ovozi?</p>
              <motion.button
                onClick={play} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
                className="mt-5 w-28 h-28 rounded-full bg-gradient-fun text-primary-foreground shadow-pop text-5xl mx-auto flex items-center justify-center"
                aria-label="Ovozni qayta eshit"
              >
                🔊
              </motion.button>
              <p className="text-sm text-muted-foreground mt-2">Bosib qayta eshit</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              {r.options.map(opt => {
                const isPicked = picked === opt.id;
                const ok = picked && opt.id === r.target.id;
                const bad = isPicked && opt.id !== r.target.id;
                return (
                  <motion.button key={opt.id} onClick={() => onPick(opt)}
                    whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}
                    className={`p-5 rounded-2xl shadow-pop font-bold text-lg flex flex-col items-center gap-1
                      ${ok ? "bg-success text-success-foreground" :
                        bad ? "bg-destructive text-destructive-foreground" : "bg-card"}`}>
                    <span className="text-5xl">{opt.emoji}</span>
                    <span>{opt.name}</span>
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
              <AliSpeech className="mx-auto mt-2">Sen hayvon ovozlarini bilasan!</AliSpeech>
              <p className="mt-4 text-lg">Ball: <b>{score}</b> / {rounds.length * 10}</p>
              <FunButton variant="primary" size="lg" className="mt-6 w-full" onClick={restart}>Yana</FunButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
