import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameShell } from "@/components/GameShell";
import { MEMORY_PACKS } from "@/lib/games-data";
import { Ali, AliSpeech } from "@/components/Ali";
import { FunButton } from "@/components/FunButton";
import { addStars, loadProgress, recordScore } from "@/lib/progress";
import { celebrate, tinyPop } from "@/lib/confetti";

export const Route = createFileRoute("/games/memory")({
  head: () => ({
    meta: [
      { title: "Xotira o'yini — Ali bilan" },
      { name: "description", content: "Juftlarni topish orqali xotirangizni mashq qiling. Hayvonlar, mevalar, transport va boshqa to'plamlar." },
    ],
  }),
  component: MemoryGame,
});

interface Card { id: number; emoji: string; flipped: boolean; matched: boolean; }

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function buildDeck(pack: typeof MEMORY_PACKS[number], pairs: number): Card[] {
  const picked = shuffle(pack.emojis).slice(0, pairs);
  const doubled = shuffle([...picked, ...picked]);
  return doubled.map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
}

function MemoryGame() {
  const [packId, setPackId] = useState(MEMORY_PACKS[0].id);
  const [pairs, setPairs] = useState(6);
  const pack = useMemo(() => MEMORY_PACKS.find(p => p.id === packId)!, [packId]);
  const [cards, setCards] = useState<Card[]>(() => buildDeck(pack, pairs));
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);
  const [best, setBest] = useState(0);

  useEffect(() => { setBest(loadProgress().bestScores["memory"] || 0); }, []);

  const reset = (newPack = pack, newPairs = pairs) => {
    setCards(buildDeck(newPack, newPairs));
    setSelected([]); setMoves(0); setBusy(false);
  };

  useEffect(() => { reset(pack, pairs); /* eslint-disable-next-line */ }, [packId, pairs]);

  const onFlip = (id: number) => {
    if (busy) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;
    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    const newSel = [...selected, id];
    setCards(newCards); setSelected(newSel);

    if (newSel.length === 2) {
      setMoves(m => m + 1); setBusy(true);
      const [a, b] = newSel;
      const ca = newCards.find(c => c.id === a)!;
      const cb = newCards.find(c => c.id === b)!;
      if (ca.emoji === cb.emoji) {
        tinyPop();
        setTimeout(() => {
          setCards(prev => prev.map(c => (c.id === a || c.id === b) ? { ...c, matched: true } : c));
          setSelected([]); setBusy(false);
        }, 400);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => (c.id === a || c.id === b) ? { ...c, flipped: false } : c));
          setSelected([]); setBusy(false);
        }, 900);
      }
    }
  };

  const allMatched = cards.length > 0 && cards.every(c => c.matched);

  useEffect(() => {
    if (allMatched) {
      celebrate();
      const score = Math.max(10, pairs * 20 - moves * 2);
      addStars(3);
      const updated = recordScore("memory", score);
      setBest(updated.bestScores["memory"] || 0);
    }
    // eslint-disable-next-line
  }, [allMatched]);

  const cols = pairs <= 6 ? "grid-cols-3 sm:grid-cols-4" : pairs <= 8 ? "grid-cols-4" : "grid-cols-4 sm:grid-cols-6";

  return (
    <GameShell title="Xotira" emoji="🧠" score={moves} best={best}>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="font-bold text-sm text-muted-foreground mr-2">To'plam:</span>
        {MEMORY_PACKS.map(p => (
          <button key={p.id} onClick={() => setPackId(p.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-bold shadow-pop transition ${packId===p.id?"bg-primary text-primary-foreground":"bg-card"}`}>
            {p.name}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 bg-card p-1 rounded-full shadow-pop">
          {[6, 8, 10].map(n => (
            <button key={n} onClick={() => setPairs(n)}
              className={`w-9 h-9 rounded-full text-sm font-bold ${pairs===n?"bg-secondary text-secondary-foreground":""}`}>{n}</button>
          ))}
        </div>
      </div>

      <div className={`grid ${cols} gap-2 sm:gap-3`}>
        {cards.map(c => (
          <motion.button
            key={c.id} onClick={() => onFlip(c.id)} disabled={c.matched}
            whileTap={{ scale: 0.95 }}
            className="relative aspect-square rounded-2xl shadow-pop"
            style={{ perspective: 800 }}
          >
            <motion.div
              animate={{ rotateY: c.flipped || c.matched ? 180 : 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute inset-0 bg-gradient-fun rounded-2xl flex items-center justify-center text-3xl text-primary-foreground" style={{ backfaceVisibility: "hidden" }}>
                ❓
              </div>
              <div className={`absolute inset-0 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl ${c.matched ? "bg-success/30" : "bg-card"}`}
                   style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                {c.emoji}
              </div>
            </motion.div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {allMatched && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
          >
            <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-pop max-w-sm w-full text-center">
              <Ali mood="cheer" size={180} />
              <AliSpeech className="mx-auto mt-2">Zo'r! Sen yutding 🎉</AliSpeech>
              <p className="mt-4 text-muted-foreground">Yurishlar: <b>{moves}</b> · ⭐ +3</p>
              <FunButton variant="primary" size="lg" className="mt-6 w-full" onClick={() => reset()}>
                Yana o'ynash
              </FunButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
