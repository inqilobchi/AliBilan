import confetti from "canvas-confetti";

export function celebrate() {
  const colors = ["#fbbf24", "#60a5fa", "#34d399", "#f472b6", "#a78bfa"];
  confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 }, colors });
  setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 }, colors }), 200);
  setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 }, colors }), 350);
}

export function tinyPop() {
  confetti({ particleCount: 20, spread: 40, origin: { y: 0.6 }, scalar: 0.7 });
}
