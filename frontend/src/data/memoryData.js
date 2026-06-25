export const STATS = [
  { label: 'Total Events',       value: '863',         sub: 'In Database',       icon: 'fas fa-solar-panel',    color: '#38bdf8', bg: 'rgba(59,130,246,.15)',  grad: 'linear-gradient(90deg,#3b82f6,#60a5fa)' },
  { label: 'Total Genomes',      value: '863',         sub: '64-D Fingerprints', icon: 'fas fa-fingerprint',    color: '#c084fc', bg: 'rgba(168,85,247,.15)', grad: 'linear-gradient(90deg,#a855f7,#c084fc)' },
  { label: 'Avg Similarity Search', value: '0.78',     sub: 'Top Match Score',   icon: 'fas fa-search',         color: '#2dd4bf', bg: 'rgba(34,211,238,.15)', grad: 'linear-gradient(90deg,#22d3ee,#67e8f9)' },
  { label: 'Database Coverage',  value: '2023 – 2026', sub: 'Date Range',        icon: 'fas fa-satellite-dish', color: '#22d97a', bg: 'rgba(34,197,94,.15)',  grad: 'linear-gradient(90deg,#22c55e,#4ade80)' },
  { label: 'Storage Size',       value: '28.6 MB',     sub: 'FAISS Index',       icon: 'fas fa-hdd',            color: '#fb923c', bg: 'rgba(245,158,11,.15)', grad: 'linear-gradient(90deg,#f59e0b,#fcd34d)' },
];

export const TABLE_ROWS = [
  { rank: 1, id: 'EVT-2024-06-18-122200', date: '2024-06-18 12:22:00', cls: 'C2.4', clsType: 'c', score: 0.92, anomaly: '0.15', lead: '12 min' },
  { rank: 2, id: 'EVT-2024-06-18-110200', date: '2024-06-18 11:02:00', cls: 'C1.8', clsType: 'c', score: 0.88, anomaly: '0.21', lead: '9 min' },
  { rank: 3, id: 'EVT-2024-06-03-094100', date: '2024-06-03 09:41:00', cls: 'C3.1', clsType: 'c', score: 0.84, anomaly: '0.17', lead: '14 min' },
  { rank: 4, id: 'EVT-2024-06-03-101500', date: '2024-06-03 10:15:00', cls: 'B9.7', clsType: 'b', score: 0.79, anomaly: '0.24', lead: '8 min' },
  { rank: 5, id: 'EVT-2024-05-22-085000', date: '2024-05-22 08:50:00', cls: 'B7.5', clsType: 'b', score: 0.74, anomaly: '0.28', lead: '11 min' },
];

export const ACTIVITIES = [
  { time: '2024-09-02 12:45:30', action: 'Added new event',  detail: 'QRY-2024-09-02-121530', mono: true },
  { time: '2024-09-02 12:44:10', action: 'Search performed',  detail: '(Top K: 5)' },
  { time: '2024-09-02 12:40:22', action: 'Index updated',     detail: '(FAISS)' },
  { time: '2024-09-02 12:30:05', action: 'New event stored',  detail: 'EVT-2024-09-02-120005', mono: true },
  { time: '2024-09-02 12:15:11', action: 'Search performed',  detail: '(Top K: 5)' },
];
