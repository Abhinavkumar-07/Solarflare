export const STATS = [
  { label: 'Total Events',       value: '863',         sub: 'In Database',       icon: 'fas fa-solar-panel',    color: '#38bdf8', bg: 'rgba(59,130,246,.15)',  grad: 'linear-gradient(90deg,#3b82f6,#60a5fa)' },
  { label: 'Total Genomes',      value: '863',         sub: '64-D Fingerprints', icon: 'fas fa-fingerprint',    color: '#c084fc', bg: 'rgba(168,85,247,.15)', grad: 'linear-gradient(90deg,#a855f7,#c084fc)' },
  { label: 'Avg Similarity Search', value: '0.78',     sub: 'Top Match Score',   icon: 'fas fa-search',         color: '#2dd4bf', bg: 'rgba(34,211,238,.15)', grad: 'linear-gradient(90deg,#22d3ee,#67e8f9)' },
  { label: 'Database Coverage',  value: '2023 – 2026', sub: 'Date Range',        icon: 'fas fa-satellite-dish', color: '#22d97a', bg: 'rgba(34,197,94,.15)',  grad: 'linear-gradient(90deg,#22c55e,#4ade80)' },
  { label: 'Storage Size',       value: '28.6 MB',     sub: 'FAISS Index',       icon: 'fas fa-hdd',            color: '#fb923c', bg: 'rgba(245,158,11,.15)', grad: 'linear-gradient(90deg,#f59e0b,#fcd34d)' },
];


export const ACTIVITIES = [
  { time: '2024-09-02 12:45:30', action: 'Added new event',  detail: 'QRY-2024-09-02-121530', mono: true },
  { time: '2024-09-02 12:44:10', action: 'Search performed',  detail: '(Top K: 5)' },
  { time: '2024-09-02 12:40:22', action: 'Index updated',     detail: '(FAISS)' },
  { time: '2024-09-02 12:30:05', action: 'New event stored',  detail: 'EVT-2024-09-02-120005', mono: true },
  { time: '2024-09-02 12:15:11', action: 'Search performed',  detail: '(Top K: 5)' },
];
