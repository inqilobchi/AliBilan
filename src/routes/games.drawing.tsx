import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GameShell } from "@/components/GameShell";
import { Ali, AliSpeech } from "@/components/Ali";
import { FunButton } from "@/components/FunButton";
import { playSound } from "@/lib/audio";
import { addStars } from "@/lib/progress";
import { tinyPop } from "@/lib/confetti";

export const Route = createFileRoute("/games/drawing")({
  head: () => ({
    meta: [
      { title: "Rasm chizish — Ali bilan" },
      { name: "description", content: "Erkin chizish: ranglar, qalin-ingichka qalam va o'chirg'ich. Ijodingni namoyon qil!" },
    ],
  }),
  component: Drawing,
});

const PALETTE = [
  "#111827", "#ef4444", "#f97316", "#facc15",
  "#22c55e", "#06b6d4", "#3b82f6", "#a855f7",
  "#ec4899", "#92400e", "#ffffff",
];

const PROMPTS = [
  "Quyoshli kun ☀️", "Yulduzli osmon ⭐", "Sevimli hayvon 🐶",
  "Sehrli daraxt 🌳", "Mevali bog' 🍎", "Kosmik raketa 🚀",
  "Dengiz va kemalar ⛵", "Kamalak 🌈", "Ali bilan birga 👦",
];

function Drawing() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(PALETTE[6]);
  const [size, setSize] = useState(8);
  const [eraser, setEraser] = useState(false);
  const [prompt, setPrompt] = useState(PROMPTS[0]);

  useEffect(() => {
    setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    const c = canvasRef.current; if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = Math.floor(rect.width * dpr);
    c.height = Math.floor(rect.height * dpr);
    const ctx = c.getContext("2d");
    if (ctx) { ctx.scale(dpr, dpr); ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, rect.width, rect.height); }
  }, []);

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
    ctx.strokeStyle = eraser ? "#ffffff" : color;
    ctx.lineWidth = eraser ? size * 2.5 : size;
    ctx.beginPath();
    if (from) { ctx.moveTo(from.x, from.y); ctx.lineTo(p.x, p.y); }
    else { ctx.moveTo(p.x - 0.5, p.y); ctx.lineTo(p.x + 0.5, p.y); }
    ctx.stroke();
  };

  const clear = () => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const r = c.getBoundingClientRect();
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, r.width, r.height);
    playSound("click");
  };

  const save = () => {
    const c = canvasRef.current; if (!c) return;
    const url = c.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url; a.download = "rasm.png"; a.click();
    playSound("star"); tinyPop(); addStars(1);
  };

  const newPrompt = () => { setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]); playSound("click"); };

  return (
    <GameShell title="Rasm chizish" emoji="🎨">
      <div className="flex items-end gap-3 mb-3">
        <Ali mood="think" size={90} bounce={false} />
        <AliSpeech>
          Bugun chiz: <b>{prompt}</b>
          <button onClick={newPrompt} className="ml-2 text-sm underline">o'zgartir</button>
        </AliSpeech>
      </div>

      {/* Palette + tools */}
      <div className="bg-card rounded-2xl p-3 shadow-pop mb-3 flex flex-wrap items-center gap-2">
        {PALETTE.map(c => (
          <button key={c}
            onClick={() => { setColor(c); setEraser(false); playSound("click"); }}
            aria-label={`color ${c}`}
            className={`w-9 h-9 rounded-full border-2 ${!eraser && color===c ? "border-foreground scale-110" : "border-foreground/10"} shadow transition`}
            style={{ background: c }} />
        ))}
        <div className="w-px h-8 bg-border mx-1" />
        <button onClick={() => { setEraser(e => !e); playSound("click"); }}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${eraser?"bg-accent text-accent-foreground":"bg-muted"}`}>🩹</button>
        <div className="flex items-center gap-1 ml-1">
          {[4, 8, 14, 22].map(s => (
            <button key={s} onClick={() => { setSize(s); playSound("tick"); }}
              className={`w-9 h-9 rounded-full flex items-center justify-center ${size===s?"bg-primary text-primary-foreground":"bg-muted"}`}>
              <span className="rounded-full bg-current" style={{ width: s/2 + 4, height: s/2 + 4 }} />
            </button>
          ))}
        </div>
      </div>

      <motion.canvas
        ref={canvasRef}
        onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerLeave={end}
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full aspect-square rounded-3xl shadow-pop bg-white touch-none"
        style={{ cursor: "crosshair" }}
      />

      <div className="grid grid-cols-2 gap-3 mt-4">
        <FunButton variant="ghost" size="lg" onClick={clear}>🧹 Tozalash</FunButton>
        <FunButton variant="success" size="lg" onClick={save}>⬇️ Saqlash</FunButton>
      </div>
    </GameShell>
  );
}
