import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameShell } from "@/components/GameShell";
import { Ali, AliSpeech } from "@/components/Ali";
import { FunButton } from "@/components/FunButton";
import { UZ_ALPHABET } from "@/lib/games-data";
import { playSound } from "@/lib/audio";
import { addStars } from "@/lib/progress";
import { celebrate, tinyPop } from "@/lib/confetti";

export const Route = createFileRoute("/games/alphabet")({
  head: () => ({
    meta: [
      { title: "Alifbo yozish — Ali bilan" },
      { name: "description", content: "Harflarni barmoq bilan chiziq tortib o'rganing. O'zbek alifbosi to'liq." },
    ],
  }),
  component: Alphabet,
});

const COLORS = ["#3b82f6", "#ef4444", "#f97316", "#22c55e", "#a855f7", "#ec4899", "#0ea5e9"];

function Alphabet() {
  const [idx, setIdx] = useState(0);
  const [color, setColor] = useState(COLORS[0]);
  const [done, setDone] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const letter = UZ_ALPHABET[idx];

  const setupCanvas = () => {
    const c = canvasRef.current; if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = Math.floor(rect.width * dpr);
    c.height = Math.floor(rect.height * dpr);
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);
  };

  useEffect(() => { setupCanvas(); /* eslint-disable-next-line */ }, [idx]);

  const clear = () => { setupCanvas(); playSound("click"); };
  const pos = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const start = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drawing.current = true; last.current = pos(e); paint(pos(e));
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const p = pos(e); paint(p, last.current); last.current = p;
  };
  const end = () => { drawing.current = false; last.current = null; };

  const paint = (p: { x: number; y: number }, from?: { x: number; y: number } | null) => {
    const ctx = canvasRef.current?.getContext("2d"); if (!ctx) return;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = color; ctx.lineWidth = 14;
    ctx.beginPath();
    if (from) { ctx.moveTo(from.x, from.y); ctx.lineTo(p.x, p.y); }
    else { ctx.moveTo(p.x - 0.5, p.y); ctx.lineTo(p.x + 0.5, p.y); }
    ctx.stroke();
  };

  const next = () => {
    tinyPop(); playSound("star"); addStars(1);
    if (idx + 1 >= UZ_ALPHABET.length) { setDone(true); celebrate(); playSound("win"); }
    else setIdx(i => i + 1);
  };
  const prev = () => { if (idx > 0) setIdx(i => i - 1); };

  return (
    <GameShell title="Alifbo yozish" emoji="✍️">
      <div className="flex items-end gap-3 mb-3">
        <Ali mood="think" size={90} bounce={false} />
        <AliSpeech>
          Bu harf — <b>{letter}</b>. Barmog'ing bilan chiziq tort!
        </AliSpeech>
      </div>

      {/* Progress strip */}
      <div className="flex items-center justify-between mb-3 bg-card rounded-2xl px-4 py-2 shadow-pop">
        <button onClick={prev} disabled={idx === 0} className="font-bold text-2xl disabled:opacity-30">←</button>
        <div className="text-sm font-bold">{idx + 1} / {UZ_ALPHABET.length}</div>
        <div className="flex gap-1">
          {COLORS.map(c => (
            <button key={c} onClick={() => { setColor(c); playSound("tick"); }}
              className={`w-7 h-7 rounded-full border-2 ${color===c?"border-foreground scale-110":"border-transparent"}`}
              style={{ background: c }} />
          ))}
        </div>
      </div>

      {/* Tracing area */}
      <div className="relative w-full aspect-square rounded-3xl shadow-pop bg-white overflow-hidden">
        {/* Faded guide letter */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontWeight: 700,
            fontSize: "min(70vw, 26rem)",
            color: "#e5e7eb",
            lineHeight: 1,
          }}>
          {letter}
        </div>
        <motion.canvas
          ref={canvasRef}
          onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerLeave={end}
          className="relative w-full h-full touch-none"
          style={{ cursor: "crosshair" }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <FunButton variant="ghost" size="lg" onClick={clear}>🧹 Tozalash</FunButton>
        <FunButton variant="accent" size="lg" onClick={() => playSound(`letter-${letter.toLowerCase()}`)}>
          🔊 Eshit
        </FunButton>
        <FunButton variant="success" size="lg" onClick={next}>
          {idx + 1 >= UZ_ALPHABET.length ? "🎉 Tugatish" : "Keyingi →"}
        </FunButton>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
            <div className="bg-card rounded-3xl p-8 shadow-pop max-w-sm w-full text-center">
              <Ali mood="cheer" size={180} />
              <AliSpeech className="mx-auto mt-2">Butun alifboni o'rganding! 🎉</AliSpeech>
              <FunButton variant="primary" size="lg" className="mt-6 w-full"
                onClick={() => { setIdx(0); setDone(false); }}>
                Boshidan
              </FunButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
