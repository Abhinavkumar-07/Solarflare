import { COLORS as C } from "../theme";

export const METRICS = [
  { title: 'Total Events Analyzed', value: '248', trend: '↗ 12.4% vs last period', trendColor: C.cyan, chart: true, color: C.cyan },
  { title: 'Flares Detected', value: '225', trend: '↗ 10.2% vs last period', trendColor: C.yellow, icon: 'fas fa-sun', color: C.yellow },
  { title: 'True Positives (TP)', value: '207', trend: '↗ 8.7% vs last period', trendColor: C.green, icon: 'fas fa-check-circle', color: C.green },
  { title: 'False Alarms (FP)', value: '18', trend: '↘ -5.3% vs last period', trendColor: C.orange, icon: 'fas fa-exclamation-triangle', color: C.orange },
  { title: 'Missed Events (FN)', value: '21', trend: '↘ -10.6% vs last period', trendColor: C.red, icon: 'fas fa-times-circle', color: C.red },
  { title: 'Average Lead Time', value: '10.3 min', trend: '↗ 1.8 min vs last period', trendColor: C.purple, icon: 'fas fa-clock', color: C.purple },
];

export const CONFUSION_MATRIX = [
  { act: 'B', pred: { B: 58, C: 5, M: 1, X: 0 }, tot: 64 },
  { act: 'C', pred: { B: 7, C: 117, M: 7, X: 1 }, tot: 132 },
  { act: 'M', pred: { B: 1, C: 6, M: 31, X: 0 }, tot: 38 },
  { act: 'X', pred: { B: 0, C: 1, M: 1, X: 12 }, tot: 14 },
  { act: 'Total', pred: { B: 66, C: 129, M: 40, X: 13 }, tot: 248 },
];

export function cellColor(act, pred, val) {
  if (act === 'Total' || pred === 'tot' || act === 'act') return 'transparent';
  if (act === pred) return `rgba(34, 197, 94, ${val / 117})`; 
  if (val > 0) return `rgba(245, 158, 11, ${val / 10})`; 
  return 'rgba(255,255,255,0.02)';
}
