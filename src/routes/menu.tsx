import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Ali, AliSpeech } from "@/components/Ali";
import { useTheme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { loadProgress, type Progress } from "@/lib/progress";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menyu — Ali bilan o'yna" },
      { name: "description", content: "O'yin va darslar tanlovi: xotira, so'z topish, harflar poygasi va ranglar darsi." },
    ],
  }),
  component: Menu,
});

const tiles = [
  { to: "/games/memory", title: "Xotira", emoji: "🧠", desc: "Juftlarni top!", color: "bg-gradient-fun", textColor: "text-primary-foreground" },
  { to: "/games/word-find", title: "So'z topish", emoji: "🔤", desc: "Rasmga mos so'z", color: "bg-gradient-sun", textColor: "text-accent-foreground" },
  { to: "/games/letter-race", title: "Harflar poygasi", emoji: "🏁", desc: "Tezroq bos!", color: "bg-secondary", textColor: "text-secondary-foreground" },
  { to: "/games/alphabet", title: "Alifbo yozish", emoji: "✍️", desc: "Harflarni chiz", color: "bg-primary", textColor: "text-primary-foreground" },
  { to: "/games/math", title: "Matematika", emoji: "➕", desc: "Qo'sh va ayir", color: "bg-success", textColor: "text-success-foreground" },
  { to: "/games/math-puzzle", title: "Matematik jumboq", emoji: "🧩", desc: "Yetishmaganni top", color: "bg-gradient-sun", textColor: "text-accent-foreground" },
  { to: "/games/animals", title: "Hayvon ovozlari", emoji: "🐾", desc: "Ovozni top", color: "bg-secondary", textColor: "text-secondary-foreground" },
  { to: "/games/melody", title: "Ohang topish", emoji: "🎵", desc: "Notalar bilan", color: "bg-gradient-fun", textColor: "text-primary-foreground" },
  { to: "/games/drawing", title: "Rasm chizish", emoji: "🎨", desc: "Erkin chiz!", color: "bg-primary", textColor: "text-primary-foreground" },
  { to: "/games/quiz", title: "Bilim testi", emoji: "❓", desc: "Aql sinovi", color: "bg-success", textColor: "text-success-foreground" },
  { to: "/lessons", title: "Darslar", emoji: "📚", desc: "Birga o'rganamiz", color: "bg-gradient-sun", textColor: "text-accent-foreground" },
] as const;

function Menu() {
  const { theme, setTheme } = useTheme();
  const [progress, setProgress] = useState<Progress | null>(null);
  useEffect(() => setProgress(loadProgress()), []);

  return (
    <main className="relative min-h-screen overflow-hidden bubble-bg">
      <header className="relative z-10 flex items-center justify-between p-4 sm:p-6">
        <Link to="/" className="font-bold text-xl flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-pop">
          ← Uy
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-card rounded-full px-4 py-2 shadow-pop font-bold flex items-center gap-1">
            ⭐ <span>{progress?.stars ?? 0}</span>
          </div>
          <div className="flex gap-1 bg-card rounded-full p-1 shadow-pop">
            <button onClick={() => setTheme("boy")} className={`px-3 py-1.5 rounded-full text-sm font-bold ${theme==="boy"?"bg-primary text-primary-foreground":""}`}>👦</button>
            <button onClick={() => setTheme("girl")} className={`px-3 py-1.5 rounded-full text-sm font-bold ${theme==="girl"?"bg-primary text-primary-foreground":""}`}>👧</button>
          </div>
        </div>
      </header>

      <section className="relative z-10 px-4 pb-10 max-w-5xl mx-auto">
        <div className="flex items-end gap-4 mb-6">
          <Ali mood="think" size={140} />
          <AliSpeech>Qaysi o'yinni tanlaysan?</AliSpeech>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {tiles.map((t, i) => (
            <Link key={t.to} to={t.to}>
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 200, damping: 16 }}
                whileHover={{ y: -6, rotate: -1 }}
                whileTap={{ scale: 0.96 }}
                className={`${t.color} ${t.textColor} rounded-3xl p-5 sm:p-6 shadow-pop aspect-square flex flex-col justify-between cursor-pointer`}
              >
                <div className="text-5xl sm:text-6xl">{t.emoji}</div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold">{t.title}</div>
                  <div className="text-sm opacity-90">{t.desc}</div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
