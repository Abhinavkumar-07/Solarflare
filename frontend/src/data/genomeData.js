// ── Seeded pseudo-random ──────────────────────────────────────────────────────
export function seededRand(i) {
  const x = Math.sin(i + 42) * 10000;
  return x - Math.floor(x);
}

export const rowPatterns = [
  (j) => -1.2 + 0.8 * Math.sin(j / 10) + 0.4 * (seededRand(j) - 0.5),
  (j) => 0.5 + 1.5 * Math.sin(j / 8 + 1) + 0.5 * (seededRand(j + 100) - 0.5),
  (j) => -0.5 + 1.2 * Math.sin(j / 6 + 2) + (j > 40 ? 1.5 * (seededRand(j + 200) - 0.3) : 0) + 0.3 * (seededRand(j + 300) - 0.5),
  (j) => 0.3 * Math.sin(j / 12 + 0.5) + 0.8 * (seededRand(j + 400) - 0.5),
  (j) => -0.8 + 0.6 * Math.sin(j / 9 + 3) + (j > 50 ? 2 : 0) + 0.4 * (seededRand(j + 500) - 0.5),
  (j) => 0.2 + 0.5 * Math.sin(j / 15 + 1.5) + 0.6 * (seededRand(j + 600) - 0.5),
  (j) => -1.5 + 0.3 * Math.sin(j / 20) + (j > 55 ? 1.8 : 0) + 0.3 * (seededRand(j + 700) - 0.5),
  (j) => -2 + 0.4 * Math.sin(j / 25 + 2) + 0.5 * (seededRand(j + 800) - 0.5),
];

export const HEATMAP_DATA = Array.from({ length: 8 }, (_, r) =>
  Array.from({ length: 64 }, (_, c) => rowPatterns[r](c))
);

export const LABELS = [
  ["Spectral Flux (Soft)"],
  ["Spectral Flux", "(Hard)"],
  ["Hardening", "Evolution"],
  ["Temporal Gradients"],
  ["Wavelet", "Features"],
  ["Statistical", "Moments"],
];

export const SELECTED  = [0.72, 0.82, 0.68, 0.58, 0.76, 0.62];
export const TOP_MATCH = [0.66, 0.74, 0.61, 0.52, 0.68, 0.56];

export const ROWS = ["Spectral Flux (Soft)", "Spectral Flux (Hard)", "Hardening Evolution", "Temporal Gradients", "Wavelet Features", "Statistical Moments", "Peak Characteristics", "Background Features"];

export const EVENTS = [
  { rank: 1, id: "EVT-2024-06-18-122200", dt: "2024-06-18 12:22:00", cls: "C2.4", sim: 0.92, anom: 0.15, lead: "12 min", clsCat: "C" },
  { rank: 2, id: "EVT-2024-06-18-110200", dt: "2024-06-18 11:02:00", cls: "C1.8", sim: 0.88, anom: 0.21, lead: "9 min", clsCat: "C" },
  { rank: 3, id: "EVT-2024-06-03-094100", dt: "2024-06-03 09:41:00", cls: "C3.1", sim: 0.84, anom: 0.17, lead: "14 min", clsCat: "C" },
  { rank: 4, id: "EVT-2024-06-03-101500", dt: "2024-06-03 10:15:00", cls: "B9.7", sim: 0.79, anom: 0.24, lead: "8 min", clsCat: "B" },
  { rank: 5, id: "EVT-2024-05-22-085000", dt: "2024-05-22 08:50:00", cls: "B7.5", sim: 0.74, anom: 0.28, lead: "11 min", clsCat: "B" },
];

export const CONTRIBS = [
  { label: "Spectral Flux (Soft)", pct: 18.7, color: "#3b82f6" },
  { label: "Spectral Flux (Hard)", pct: 21.3, color: "#22c55e" },
  { label: "Hardening Evolution", pct: 17.6, color: "#22c55e" },
  { label: "Temporal Gradients",  pct: 14.2, color: "#22c55e" },
  { label: "Wavelet Features",    pct: 12.1, color: "#f59e0b" },
  { label: "Statistical Moments", pct:  9.8, color: "#f97316" },
  { label: "Peak Characteristics",pct:  4.1, color: "#ec4899" },
  { label: "Background Features", pct:  2.2, color: "#8b5cf6" },
];
