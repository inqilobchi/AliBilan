import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameShell } from "@/components/GameShell";
import { LESSONS } from "@/lib/games-data";
import { Ali, AliSpeech } from "@/components/Ali";
import { FunButton } from "@/components/FunButton";
import { tinyPop } from "@/lib/confetti";

export const Route = createFileRoute("/lessons")({
  head: () => ({
    meta: [
      { title: "Darslar — Ali bilan" },
      { name: "description", content: "Sodda va qiziqarli darslar: ranglar, raqamlar va shakllar." },
    ],
  }),
  component: Lessons,
});

function Lessons() {
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [cardIdx, setCardIdx] = useState(0);

  const lesson = LESSONS.find(l => l.id === lessonId);

  if (!lesson) {
    return (
      <GameShell title="Darslar" emoji="📚">
        <div className="flex items-end gap-3 mb-5">
          <Ali mood="wave" size={120} />
          <AliSpeech>Bugun nimani o'rganamiz?</AliSpeech>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {LESSONS.map((l, i) => (
            <motion.button
              key={l.id} onClick={() => { setLessonId(l.id); setCardIdx(0); }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
              className="bg-card rounded-3xl p-6 shadow-pop text-left"
            >
              <div className="text-5xl mb-3">{l.emoji}</div>
              <div className="text-2xl font-bold">{l.title}</div>
              <div className="text-sm text-muted-foreground mt-1">{l.cards.length} ta kartochka</div>
            </motion.button>
          ))}
        </div>
      </GameShell>
    );
  }

  const card = lesson.cards[cardIdx];
  const last = cardIdx >= lesson.cards.length - 1;

  return (
    <GameShell title={lesson.title} emoji={lesson.emoji}>
      <button onClick={() => setLessonId(null)} className="mb-4 text-sm font-bold text-muted-foreground">← Boshqa dars</button>

      <div className="h-3 bg-card rounded-full overflow-hidden shadow-pop mb-6">
        <motion.div animate={{ width: `${((cardIdx + 1) / lesson.cards.length) * 100}%` }} className="h-full bg-gradient-fun" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={cardIdx}
          initial={{ opacity: 0, x: 60, rotate: 4 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          exit={{ opacity: 0, x: -60, rotate: -4 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="rounded-3xl p-10 shadow-pop text-center text-white"
          style={{ background: card.color }}
        >
          <div className="text-9xl drop-shadow-lg">{card.emoji}</div>
          <div className="text-5xl sm:text-6xl font-bold mt-4 text-stroke">{card.label}</div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-end gap-3 mt-6">
        <Ali mood="think" size={100} bounce={false} />
        <AliSpeech>"{card.label}" — qaytarib ayt!</AliSpeech>
      </div>

      <div className="flex gap-3 mt-6">
        <FunButton variant="ghost" size="lg" onClick={() => setCardIdx(i => Math.max(0, i - 1))} className="flex-1">← Orqa</FunButton>
        <FunButton
          variant={last ? "success" : "primary"} size="lg" className="flex-[2]"
          onClick={() => {
            if (last) { tinyPop(); setLessonId(null); }
            else { setCardIdx(i => i + 1); tinyPop(); }
          }}
        >
          {last ? "🎉 Tugatish" : "Keyingi →"}
        </FunButton>
      </div>
    </GameShell>
  );
}
