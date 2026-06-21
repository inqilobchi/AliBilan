// Simple offline progress tracking via localStorage.
const KEY = "ali-progress-v1";

export interface Progress {
  stars: number;
  bestScores: Record<string, number>;
  name: string;
}

const DEFAULT: Progress = { stars: 0, bestScores: {}, name: "Do'stim" };

export function loadProgress(): Progress {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

export function saveProgress(p: Progress) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
}

export function addStars(n: number) {
  const p = loadProgress();
  p.stars += n;
  saveProgress(p);
  return p;
}

export function recordScore(gameId: string, score: number) {
  const p = loadProgress();
  p.bestScores[gameId] = Math.max(p.bestScores[gameId] || 0, score);
  saveProgress(p);
  return p;
}
