// Offline content — large enough to keep kids replaying.

export const UZ_ALPHABET = [
  "A","B","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","X","Y","Z",
  "CH","SH","NG","O'","G'",
];

// Memory pairs — emoji pairs grouped by theme. Each game picks a pack.
export const MEMORY_PACKS: { id: string; name: string; emojis: string[] }[] = [
  { id: "hayvonlar", name: "Hayvonlar", emojis: ["🐶","🐱","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸"] },
  { id: "mevalar", name: "Mevalar", emojis: ["🍎","🍌","🍇","🍓","🍉","🍊","🍑","🥝","🍍","🥭","🍒","🍐"] },
  { id: "transport", name: "Transport", emojis: ["🚗","🚌","🚓","🚑","🚒","🚜","🚲","🛵","✈️","🚀","🚂","⛵"] },
  { id: "tabiat", name: "Tabiat", emojis: ["🌞","🌝","⭐","☁️","🌈","❄️","🌊","🔥","🌸","🌻","🍀","🌳"] },
  { id: "narsalar", name: "Buyumlar", emojis: ["⚽","🎈","🎁","🎨","✏️","📚","🎵","🧸","🎮","⏰","🔔","🎂"] },
];

// Word-find: show emoji, choose word among 4. Plenty so it never repeats fast.
export const WORD_ITEMS: { word: string; emoji: string }[] = [
  { word: "Olma", emoji: "🍎" }, { word: "Banan", emoji: "🍌" }, { word: "Uzum", emoji: "🍇" },
  { word: "Qulupnay", emoji: "🍓" }, { word: "Tarvuz", emoji: "🍉" }, { word: "Apelsin", emoji: "🍊" },
  { word: "Shaftoli", emoji: "🍑" }, { word: "Limon", emoji: "🍋" }, { word: "Ananas", emoji: "🍍" },
  { word: "It", emoji: "🐶" }, { word: "Mushuk", emoji: "🐱" }, { word: "Quyon", emoji: "🐰" },
  { word: "Tulki", emoji: "🦊" }, { word: "Ayiq", emoji: "🐻" }, { word: "Sher", emoji: "🦁" },
  { word: "Yo'lbars", emoji: "🐯" }, { word: "Sigir", emoji: "🐮" }, { word: "Cho'chqa", emoji: "🐷" },
  { word: "Qurbaqa", emoji: "🐸" }, { word: "Maymun", emoji: "🐵" }, { word: "Tovuq", emoji: "🐔" },
  { word: "Mashina", emoji: "🚗" }, { word: "Avtobus", emoji: "🚌" }, { word: "Velosiped", emoji: "🚲" },
  { word: "Samolyot", emoji: "✈️" }, { word: "Raketa", emoji: "🚀" }, { word: "Poyezd", emoji: "🚂" },
  { word: "Kema", emoji: "⛵" }, { word: "Quyosh", emoji: "🌞" }, { word: "Oy", emoji: "🌝" },
  { word: "Yulduz", emoji: "⭐" }, { word: "Bulut", emoji: "☁️" }, { word: "Kamalak", emoji: "🌈" },
  { word: "Qor", emoji: "❄️" }, { word: "Dengiz", emoji: "🌊" }, { word: "Olov", emoji: "🔥" },
  { word: "Gul", emoji: "🌸" }, { word: "Daraxt", emoji: "🌳" }, { word: "Koptok", emoji: "⚽" },
  { word: "Sovg'a", emoji: "🎁" }, { word: "Kitob", emoji: "📚" }, { word: "Qalam", emoji: "✏️" },
  { word: "O'yinchoq", emoji: "🧸" }, { word: "Tort", emoji: "🎂" }, { word: "Soat", emoji: "⏰" },
];

// Mini-darslar — simple lessons each with bite-size cards.
export const LESSONS = [
  {
    id: "ranglar",
    title: "Ranglar",
    emoji: "🎨",
    cards: [
      { label: "Qizil", emoji: "🍎", color: "#ef4444" },
      { label: "Sariq", emoji: "🍋", color: "#facc15" },
      { label: "Yashil", emoji: "🍀", color: "#22c55e" },
      { label: "Ko'k", emoji: "🌊", color: "#3b82f6" },
      { label: "Pushti", emoji: "🌸", color: "#ec4899" },
      { label: "Binafsha", emoji: "🍇", color: "#a855f7" },
      { label: "Qora", emoji: "🐈‍⬛", color: "#111827" },
      { label: "Oq", emoji: "☁️", color: "#e5e7eb" },
    ],
  },
  {
    id: "raqamlar",
    title: "Raqamlar",
    emoji: "🔢",
    cards: Array.from({ length: 10 }, (_, i) => ({
      label: ["Bir","Ikki","Uch","To'rt","Besh","Olti","Yetti","Sakkiz","To'qqiz","O'n"][i],
      emoji: `${i + 1}`,
      color: ["#60a5fa","#34d399","#fbbf24","#f472b6","#a78bfa","#fb7185","#22d3ee","#facc15","#4ade80","#f97316"][i],
    })),
  },
  {
    id: "shakllar",
    title: "Shakllar",
    emoji: "🔺",
    cards: [
      { label: "Doira", emoji: "⚪", color: "#60a5fa" },
      { label: "Kvadrat", emoji: "⬛", color: "#111827" },
      { label: "Uchburchak", emoji: "🔺", color: "#ef4444" },
      { label: "Yulduz", emoji: "⭐", color: "#facc15" },
      { label: "Yurak", emoji: "❤️", color: "#ec4899" },
      { label: "Olmos", emoji: "💎", color: "#22d3ee" },
    ],
  },
];
