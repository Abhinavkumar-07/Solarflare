const N = 31; // 11:52 -> 12:22, one point per minute

export function timeLabel(i) {
  const total = 52 + i;
  const hh = 11 + Math.floor(total / 60);
  const mm = total % 60;
  return `${hh}:${String(mm).padStart(2, "0")}`;
}

export function buildSeries(keyframes, jitterAmt = 0.05) {
  const idxs = Object.keys(keyframes)
    .map(Number)
    .sort((a, b) => a - b);
  return Array.from({ length: N }, (_, i) => {
    let lower = idxs[0];
    let upper = idxs[idxs.length - 1];
    for (let k = 0; k < idxs.length - 1; k++) {
      if (i >= idxs[k] && i <= idxs[k + 1]) {
        lower = idxs[k];
        upper = idxs[k + 1];
        break;
      }
    }
    const t = upper === lower ? 0 : (i - lower) / (upper - lower);
    const val = keyframes[lower] + (keyframes[upper] - keyframes[lower]) * t;
    const jitter = val * jitterAmt * Math.sin(i * 2.3 + lower * 0.7);
    return Math.max(val + jitter, 0.0000001);
  });
}

// jagged, multi-bump hardness curves (matches the reference crop)
export const hrSeries = buildSeries(
  { 0: 0.65, 3: 0.95, 5: 0.7, 7: 0.55, 9: 0.6, 11: 0.85, 13: 0.7, 15: 0.95, 17: 1.25, 19: 1.05, 21: 1.4, 23: 1.9, 25: 1.85, 27: 1.6, 30: 1.35 },
  0.045
);
export const hiSeries = buildSeries(
  { 0: 0.55, 3: 0.7, 5: 0.6, 7: 0.5, 9: 0.52, 11: 0.65, 13: 0.58, 15: 0.72, 17: 0.85, 19: 0.78, 21: 0.88, 23: 1.0, 25: 0.97, 27: 0.9, 30: 0.82 },
  0.04
);
// sharp rise -> double bump -> spike -> crash, like a real GOES flare light curve
export const goesSeries = buildSeries(
  { 0: 0.0000015, 8: 0.000002, 10: 0.000003, 13: 0.00001, 15: 0.00003, 17: 0.00006, 18: 0.00004, 20: 0.00009, 22: 0.00022, 23: 0.00032, 24: 0.00025, 25: 0.00015, 27: 0.00005, 29: 0.000008, 30: 0.000003 },
  0.03
);

export const lowSeries = buildSeries({ 0: 150, 10: 300, 15: 700, 20: 1500, 23: 2500, 25: 2200, 30: 1800 });
export const medSeries = buildSeries({ 0: 100, 10: 250, 15: 600, 20: 1800, 23: 3500, 25: 3000, 30: 1300 });
export const highSeries = buildSeries({ 0: 40, 10: 100, 15: 250, 20: 600, 23: 1100, 25: 950, 30: 550 });
export const vhighSeries = buildSeries({ 0: 8, 10: 20, 15: 50, 20: 130, 23: 280, 25: 240, 30: 160 });

export const hardeningData = Array.from({ length: N }, (_, i) => ({
  time: timeLabel(i),
  hr: hrSeries[i],
  hi: hiSeries[i],
  goes: goesSeries[i],
}));

export const energyData = Array.from({ length: N }, (_, i) => ({
  time: timeLabel(i),
  low: lowSeries[i],
  medium: medSeries[i],
  high: highSeries[i],
  vhigh: vhighSeries[i],
}));

export const timeTicks = ["11:52", "11:57", "12:02", "12:07", "12:12", "12:17", "12:22"];

export const latestForecasts = [
  { time: "12:22:00", cls: "C2.4", prob: 71, tone: "#fbbf24" },
  { time: "12:12:00", cls: "C1.9", prob: 63, tone: "#fbbf24" },
  { time: "12:02:00", cls: "C1.3", prob: 48, tone: "#fbbf24" },
  { time: "11:52:00", cls: "B8.7", prob: 34, tone: "#fde047" },
  { time: "11:42:00", cls: "B6.1", prob: 22, tone: "#fde047" },
];

export const keyIndicators = [
  { p: "Hardening Ratio (HR)", cur: "1.28", prev: "0.95", up: true },
  { p: "Hardness Intensity (HI)", cur: "0.74", prev: "0.63", up: true },
  { p: "Spectral Index (γ)", cur: "-2.35", prev: "-2.11", up: false },
  { p: "Energy Flux (15-150 keV)", cur: "2.31 × 10²", prev: "1.62 × 10²", up: true },
  { p: "GOES Flux (1-8 Å)", cur: "3.21 × 10⁻⁵", prev: "1.98 × 10⁻⁵", up: true },
];

export const features = [
  { name: "Hardening Ratio (HR)", value: 0.32 },
  { name: "Hardness Intensity (HI)", value: 0.24 },
  { name: "Energy Flux (15-150 keV)", value: 0.18 },
  { name: "Spectral Index (γ)", value: 0.14 },
  { name: "GOES Flux (1-8 Å)", value: 0.07 },
  { name: "Rise Time (10-50 keV)", value: 0.05 },
];
