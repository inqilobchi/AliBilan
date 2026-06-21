import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Ali, AliSpeech } from "@/components/Ali";
import { FunButton } from "@/components/FunButton";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ali bilan o'yna — Bosh sahifa" },
      { name: "description", content: "Salom! Men Ali. Birga o'ynaymizmi? Ranglar, raqamlar, harflar va ko'plab qiziqarli o'yinlar seni kutmoqda." },
    ],
  }),
  component: Index,
});

function Index() {
  const { theme, setTheme } = useTheme();

  return (
    <main className="relative min-h-screen overflow-hidden bubble-bg flex flex-col">
      {/* Theme switcher */}
      <header className="relative z-10 flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <span className="text-3xl">⭐</span>
          <span className="font-bold text-xl">Ali bilan</span>
        </div>
        <div className="flex gap-2 bg-card rounded-full p-1 shadow-pop">
          <button
            onClick={() => setTheme("boy")}
            className={`px-4 py-2 rounded-full font-bold text-sm transition ${theme === "boy" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >👦 O'g'il</button>
          <button
            onClick={() => setTheme("girl")}
            className={`px-4 py-2 rounded-full font-bold text-sm transition ${theme === "girl" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >👧 Qiz</button>
        </div>
      </header>

      <section className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 px-4 pb-10 lg:gap-16">
        <div className="flex flex-col items-center lg:items-start lg:order-2">
          <Ali mood="wave" size={260} />
          <AliSpeech className="mt-2 lg:mt-4">
            Salom! Men <strong>Ali</strong> 👋<br/>Bugun nima o'rganamiz?
          </AliSpeech>
        </div>

        <div className="lg:order-1 max-w-xl text-center lg:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95]"
          >
            <span className="bg-gradient-fun bg-clip-text text-transparent">Ali</span>
            <br/>bilan o'yna! 🎉
          </motion.h1>
          <p className="mt-4 text-lg sm:text-xl text-muted-foreground">
            Qiziqarli o'yinlar, kichkina darslar va Ali hamroh.
            Internet kerak emas — istalgan paytda o'yna!
          </p>
          <Link to="/menu" className="inline-block mt-8">
            <FunButton size="xl" variant="primary" className="animate-wiggle">
              ▶️ Boshlash
            </FunButton>
          </Link>
        </div>
      </section>

      {/* Floating decorations */}
      <FloatingEmoji emoji="⭐" className="top-20 left-10" delay={0} />
      <FloatingEmoji emoji="🎈" className="top-32 right-12" delay={0.5} />
      <FloatingEmoji emoji="🌈" className="bottom-20 left-16" delay={1} />
      <FloatingEmoji emoji="🎨" className="bottom-32 right-8" delay={1.5} />
    </main>
  );
}

function FloatingEmoji({ emoji, className, delay }: { emoji: string; className: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1, y: [0, -15, 0] }}
      transition={{ scale: { delay }, y: { duration: 3, repeat: Infinity, delay } }}
      className={`absolute text-4xl sm:text-5xl pointer-events-none ${className}`}
    >
      {emoji}
    </motion.div>
  );
}
