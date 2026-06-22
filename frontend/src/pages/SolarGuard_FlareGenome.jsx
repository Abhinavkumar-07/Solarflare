import { useState, useEffect, useRef } from "react";

// ── Colour helpers ────────────────────────────────────────────────────────────
function colorAt(v) {
  const stops = [
    [49, 54, 149], [69, 117, 180], [116, 173, 209],
    [224, 243, 248], [254, 224, 144], [253, 174, 97],
    [244, 109, 67], [215, 48, 39], [165, 0, 38],
  ];
  const t = (Math.max(-3, Math.min(3, v)) + 3) / 6;
  const si = t * (stops.length - 1);
  const i = Math.min(Math.floor(si), stops.length - 2);
  const f = si - i;
  return stops[i].map((c, j) => Math.round(c + (stops[i + 1][j] - c) * f));
}
function toRgb(arr) { return `rgb(${arr[0]},${arr[1]},${arr[2]})`; }

// ── Seeded pseudo-random ──────────────────────────────────────────────────────
function seededRand(i) {
  const x = Math.sin(i + 42) * 10000;
  return x - Math.floor(x);
}

// ── Generate heatmap data ─────────────────────────────────────────────────────
const rowPatterns = [
  (j) => -1.2 + 0.8 * Math.sin(j / 10) + 0.4 * (seededRand(j) - 0.5),
  (j) => 0.5 + 1.5 * Math.sin(j / 8 + 1) + 0.5 * (seededRand(j + 100) - 0.5),
  (j) => -0.5 + 1.2 * Math.sin(j / 6 + 2) + (j > 40 ? 1.5 * (seededRand(j + 200) - 0.3) : 0) + 0.3 * (seededRand(j + 300) - 0.5),
  (j) => 0.3 * Math.sin(j / 12 + 0.5) + 0.8 * (seededRand(j + 400) - 0.5),
  (j) => -0.8 + 0.6 * Math.sin(j / 9 + 3) + (j > 50 ? 2 : 0) + 0.4 * (seededRand(j + 500) - 0.5),
  (j) => 0.2 + 0.5 * Math.sin(j / 15 + 1.5) + 0.6 * (seededRand(j + 600) - 0.5),
  (j) => -1.5 + 0.3 * Math.sin(j / 20) + (j > 55 ? 1.8 : 0) + 0.3 * (seededRand(j + 700) - 0.5),
  (j) => -2 + 0.4 * Math.sin(j / 25 + 2) + 0.5 * (seededRand(j + 800) - 0.5),
];
const HEATMAP_DATA = Array.from({ length: 8 }, (_, r) =>
  Array.from({ length: 64 }, (_, c) => rowPatterns[r](c))
);

// ── Heatmap canvas ────────────────────────────────────────────────────────────
function Heatmap() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cw = W / 64, ch = H / 8;
    HEATMAP_DATA.forEach((row, r) => {
      row.forEach((v, c) => {
        ctx.fillStyle = toRgb(colorAt(v));
        ctx.fillRect(c * cw, r * ch, cw + 0.5, ch + 0.5);
      });
    });
  }, []);
  return <canvas ref={canvasRef} width={660} height={200} style={{ width: "100%", display: "block" }} />;
}

// ── Colorbar canvas ───────────────────────────────────────────────────────────
function Colorbar() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 300, 0);
    [
      [0, "rgb(49,54,149)"], [0.15, "rgb(69,117,180)"], [0.3, "rgb(116,173,209)"],
      [0.45, "rgb(254,224,144)"], [0.6, "rgb(253,174,97)"],
      [0.75, "rgb(244,109,67)"], [1, "rgb(165,0,38)"],
    ].forEach(([s, c]) => grad.addColorStop(s, c));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 300, 12);
  }, []);
  return <canvas ref={canvasRef} width={300} height={12} style={{ width: 300, height: 12, display: "block", borderRadius: 3 }} />;
}

// ── Radar chart canvas — precise glow, fully responsive, DPR-aware ───────────
function RadarChart() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const LABELS = [
    ["Spectral Flux (Soft)"],
    ["Spectral Flux", "(Hard)"],
    ["Hardening", "Evolution"],
    ["Temporal Gradients"],
    ["Wavelet", "Features"],
    ["Statistical", "Moments"],
  ];
  const SELECTED  = [0.72, 0.82, 0.68, 0.58, 0.76, 0.62];
  const TOP_MATCH = [0.66, 0.74, 0.61, 0.52, 0.68, 0.56];
  const N = 6;

  function drawRadar(canvas) {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const W = rect.width, H = rect.height;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const cx   = W * 0.45;
    const cy   = H * 0.50;
    const maxR = Math.min(W, H) * 0.32;
    const fs   = Math.max(9, Math.round(maxR * 0.13));

    const angle = (i) => (i * 2 * Math.PI / N) - Math.PI / 2;
    const pt    = (v, i) => [cx + maxR * v * Math.cos(angle(i)), cy + maxR * v * Math.sin(angle(i))];

    // ── grid rings ──────────────────────────────────────────────────────────
    [0.2, 0.4, 0.6, 0.8, 1.0].forEach((rv, ri) => {
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const [x, y] = pt(rv, i);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = ri === 4 ? "rgba(148,163,184,0.22)" : "rgba(148,163,184,0.10)";
      ctx.lineWidth   = ri === 4 ? 0.8 : 0.55;
      ctx.stroke();
    });

    // ── spokes ───────────────────────────────────────────────────────────────
    for (let i = 0; i < N; i++) {
      const [x, y] = pt(1.0, i);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "rgba(148,163,184,0.15)";
      ctx.lineWidth   = 0.6;
      ctx.stroke();
    }

    // ── ring value labels (right-hand spoke) ─────────────────────────────────
    [0.2, 0.4, 0.6, 0.8].forEach((rv) => {
      const [lx, ly] = pt(rv, 1);
      ctx.fillStyle    = "rgba(100,116,139,0.65)";
      ctx.font         = `${Math.max(8, fs - 2)}px system-ui`;
      ctx.textAlign    = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(rv.toFixed(1), lx + 3, ly);
    });

    // ── polygon helper with layered glow ─────────────────────────────────────
    function drawPoly(vals, color, dashed) {
      const points = vals.map((v, i) => pt(v, i));

      const tracePath = () => {
        ctx.beginPath();
        points.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
        ctx.closePath();
      };

      // layer 1 — widest outer halo
      ctx.save();
      tracePath();
      ctx.strokeStyle  = color;
      ctx.lineWidth    = 12;
      ctx.globalAlpha  = 0.05;
      ctx.setLineDash([]);
      ctx.stroke();
      ctx.restore();

      // layer 2 — medium glow
      ctx.save();
      tracePath();
      ctx.strokeStyle  = color;
      ctx.lineWidth    = 6;
      ctx.globalAlpha  = 0.12;
      if (dashed) ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // layer 3 — tight inner glow
      ctx.save();
      tracePath();
      ctx.strokeStyle  = color;
      ctx.lineWidth    = 3;
      ctx.globalAlpha  = 0.22;
      if (dashed) ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // fill
      ctx.save();
      tracePath();
      ctx.fillStyle   = color;
      ctx.globalAlpha = dashed ? 0.05 : 0.08;
      ctx.fill();
      ctx.restore();

      // crisp main stroke
      ctx.save();
      tracePath();
      ctx.strokeStyle = color;
      ctx.lineWidth   = dashed ? 1.4 : 1.8;
      ctx.globalAlpha = 1;
      if (dashed) ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // vertex dots — selected only
      if (!dashed) {
        points.forEach(([x, y]) => {
          // outer dot glow
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, 7, 0, Math.PI * 2);
          ctx.fillStyle   = color;
          ctx.globalAlpha = 0.15;
          ctx.fill();
          ctx.restore();
          // mid glow ring
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, 4.5, 0, Math.PI * 2);
          ctx.fillStyle   = color;
          ctx.globalAlpha = 0.22;
          ctx.fill();
          ctx.restore();
          // solid dot
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle   = color;
          ctx.globalAlpha = 1;
          ctx.fill();
          // dark centre hole
          ctx.beginPath();
          ctx.arc(x, y, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = "#0f1117";
          ctx.fill();
          ctx.restore();
        });
      }
    }

    // draw top-match behind, selected on top
    drawPoly(TOP_MATCH, "#f59e0b", true);
    drawPoly(SELECTED,  "#22d3ee", false);

    // ── axis labels ──────────────────────────────────────────────────────────
    const labelGap = maxR * 0.30;
    LABELS.forEach((lines, i) => {
      const a  = angle(i);
      const lx = cx + (maxR + labelGap) * Math.cos(a);
      const ly = cy + (maxR + labelGap) * Math.sin(a);
      const lh = fs * 1.35;

      ctx.fillStyle    = "#94a3b8";
      ctx.font         = `${fs}px system-ui`;
      ctx.textBaseline = "middle";
      ctx.textAlign    = Math.cos(a) < -0.25 ? "right" : Math.cos(a) > 0.25 ? "left" : "center";

      lines.forEach((line, li) => {
        const offsetY = (li - (lines.length - 1) / 2) * lh;
        ctx.fillText(line, lx, ly + offsetY);
      });
    });
  }

  useEffect(() => {
    const canvas = canvas => {
      if (!canvas) return;
      drawRadar(canvas);
    };
    // initial draw
    drawRadar(canvasRef.current);

    // responsive redraw
    const ro = new ResizeObserver(() => drawRadar(canvasRef.current));
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", aspectRatio: "1 / 0.9" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}

// ── Evolution chart canvas ────────────────────────────────────────────────────
function EvolutionChart() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const pad = { l: 24, r: 10, t: 14, b: 6 };
    const N = 150;
    const pts = Array.from({ length: N }, (_, i) => {
      let noise = 0;
      for (let k = 0; k < 5; k++) noise += seededRand(i * 5 + k * 17) * 0.4 - 0.2;
      const spike = i > 120 && i < 135 ? 1.5 * Math.sin((i - 120) * Math.PI / 15) : 0;
      return noise + spike;
    });
    const ymin = -2.5, ymax = 2.5;
    const pyFn = (v) => pad.t + (1 - (v - ymin) / (ymax - ymin)) * (H - pad.t - pad.b);
    const pxFn = (i) => pad.l + (i / (N - 1)) * (W - pad.l - pad.r);
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "#1e2535";
    ctx.lineWidth = 0.5;
    [-2, -1, 0, 1, 2].forEach(v => {
      ctx.beginPath();
      ctx.moveTo(pad.l, pyFn(v));
      ctx.lineTo(W - pad.r, pyFn(v));
      ctx.stroke();
      ctx.fillStyle = "#475569";
      ctx.font = "9px system-ui";
      ctx.textAlign = "right";
      ctx.fillText(v, pad.l - 2, pyFn(v) + 3);
    });
    ctx.beginPath();
    pts.forEach((v, i) => { i === 0 ? ctx.moveTo(pxFn(i), pyFn(v)) : ctx.lineTo(pxFn(i), pyFn(v)); });
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    const evtX = pxFn(127);
    ctx.beginPath();
    ctx.moveTo(evtX, pad.t);
    ctx.lineTo(evtX, H - pad.b);
    ctx.strokeStyle = "rgba(248,250,252,0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "10px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Selected Event", evtX, pad.t - 2);
  }, []);
  return <canvas ref={canvasRef} width={620} height={90} style={{ width: "100%", display: "block" }} />;
}

// ── Sub-components ────────────────────────────────────────────────────────────
const S = {
  app: { display: "flex", height: "100vh", minHeight: 860, overflow: "hidden", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", fontSize: 13, background: "#0f1117", color: "#e2e8f0" },
  sidebar: { width: 200, minWidth: 200, background: "#131720", borderRight: "1px solid #1e2535", display: "flex", flexDirection: "column" },
  logoArea: { padding: "16px 16px 12px", borderBottom: "1px solid #1e2535" },
  logoRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 },
  logoSun: { width: 32, height: 32, background: "linear-gradient(135deg,#f97316,#fbbf24)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  logoTitle: { fontSize: 14, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.2px" },
  nav: { padding: "8px 0", flex: 1 },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", fontSize: 12, color: "#94a3b8", cursor: "pointer" },
  navActive: { display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", fontSize: 12, color: "#60a5fa", cursor: "pointer", background: "#1e2a3e", borderLeft: "2px solid #3b82f6" },
  qiBox: { margin: "0 10px 12px", background: "#131720", border: "1px solid #1e2535", borderRadius: 8, padding: 12 },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 12px", borderBottom: "1px solid #1e2535", background: "#0f1117" },
  tabs: { display: "flex", padding: "0 20px", borderBottom: "1px solid #1e2535", background: "#0f1117" },
  tab: { padding: "10px 16px", fontSize: 13, color: "#64748b", cursor: "pointer", borderBottom: "2px solid transparent", marginBottom: -1 },
  tabActive: { padding: "10px 16px", fontSize: 13, color: "#60a5fa", cursor: "pointer", borderBottom: "2px solid #3b82f6", marginBottom: -1 },
  content: { flex: 1, display: "flex", overflow: "hidden" },
  center: { flex: 1, overflowY: "auto", padding: "16px 16px 16px 20px", display: "flex", flexDirection: "column", gap: 14 },
  rightPanel: { width: 230, minWidth: 230, borderLeft: "1px solid #1e2535", overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 14 },
  card: { background: "#131720", border: "1px solid #1e2535", borderRadius: 8, padding: 14 },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  cardTitle: { fontSize: 13, fontWeight: 600, color: "#e2e8f0", display: "flex", alignItems: "center", gap: 6 },
  infoDot: { width: 16, height: 16, borderRadius: "50%", border: "1px solid #3b4a6b", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#64748b", cursor: "pointer" },
  actBtn: { padding: "4px 10px", borderRadius: 5, fontSize: 11, border: "1px solid #2d3748", background: "#1a2232", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 },
  tbBtn: { display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", border: "1px solid #2d3748", background: "#1a2232", color: "#94a3b8" },
};

const ROWS = ["Spectral Flux (Soft)", "Spectral Flux (Hard)", "Hardening Evolution", "Temporal Gradients", "Wavelet Features", "Statistical Moments", "Peak Characteristics", "Background Features"];
const EVENTS = [
  { rank: 1, id: "EVT-2024-06-18-122200", dt: "2024-06-18 12:22:00", cls: "C2.4", sim: 0.92, anom: 0.15, lead: "12 min", clsCat: "C" },
  { rank: 2, id: "EVT-2024-06-18-110200", dt: "2024-06-18 11:02:00", cls: "C1.8", sim: 0.88, anom: 0.21, lead: "9 min", clsCat: "C" },
  { rank: 3, id: "EVT-2024-06-03-094100", dt: "2024-06-03 09:41:00", cls: "C3.1", sim: 0.84, anom: 0.17, lead: "14 min", clsCat: "C" },
  { rank: 4, id: "EVT-2024-06-03-101500", dt: "2024-06-03 10:15:00", cls: "B9.7", sim: 0.79, anom: 0.24, lead: "8 min", clsCat: "B" },
  { rank: 5, id: "EVT-2024-05-22-085000", dt: "2024-05-22 08:50:00", cls: "B7.5", sim: 0.74, anom: 0.28, lead: "11 min", clsCat: "B" },
];
const CONTRIBS = [
  { label: "Spectral Flux (Soft)", pct: 18.7, color: "#3b82f6" },
  { label: "Spectral Flux (Hard)", pct: 21.3, color: "#22c55e" },
  { label: "Hardening Evolution", pct: 17.6, color: "#22c55e" },
  { label: "Temporal Gradients",  pct: 14.2, color: "#22c55e" },
  { label: "Wavelet Features",    pct: 12.1, color: "#f59e0b" },
  { label: "Statistical Moments", pct:  9.8, color: "#f97316" },
  { label: "Peak Characteristics",pct:  4.1, color: "#ec4899" },
  { label: "Background Features", pct:  2.2, color: "#8b5cf6" },
];
const NAV_ITEMS = [
  { icon: "⊞", label: "Dashboard" },
  { icon: "〜", label: "Light Curves" },
  { icon: "⟶", label: "Hardening & Forecast" },
  { icon: "⬡", label: "Flare Genome", active: true },
  { icon: "⊙", label: "Solar Memory DB" },
  { icon: "🔔", label: "Alerts" },
  { icon: "📄", label: "Reports" },
  { icon: "⚙", label: "Settings" },
  { icon: "ℹ", label: "About" },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function FlareGenomeDashboard() {
  const [activeTab, setActiveTab] = useState("Genome View");
  const tabs = ["Genome View", "Similarity Matches", "PCA Projection", "Distribution", "Statistics"];

  return (
    <div style={S.app}>
      {/* ── Sidebar ── */}
      <div style={S.sidebar}>
        <div style={S.logoArea}>
          <div style={S.logoRow}>
            <div style={S.logoSun}>☀</div>
            <div style={S.logoTitle}>SolarGuard</div>
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.4, marginLeft: 40 }}>
            Solar Flare Forecasting &amp;<br />Nowcasting System
          </div>
          <div style={{ fontSize: 10, color: "#4ade80", marginLeft: 40, marginTop: 2 }}>
            Aditya-L1 (SoLEXS + HEL1OS)
          </div>
        </div>

        <div style={S.nav}>
          {NAV_ITEMS.map((item) => (
            <div key={item.label} style={item.active ? S.navActive : S.navItem}>
              <span style={{ fontSize: 15, width: 16 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        {/* Quick Info */}
        <div style={S.qiBox}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Quick Info</div>
          {[
            { label: "Selected Event", val: "2024-09-02 12:15:30 IST", style: {} },
            { label: "Predicted Class", val: "C-Class", style: { color: "#f97316", fontWeight: 600 } },
            { label: "Probability", val: "44.7%", style: { color: "#f97316", fontWeight: 600 } },
            { label: "Anomaly Score", val: "0.18", style: { color: "#22d3ee", fontWeight: 600 } },
            { label: "Lead Time (Est.)", val: "10 min", style: { color: "#4ade80", fontWeight: 700, fontSize: 14 } },
            { label: "Data Source", val: "SoLEXS + HEL1OS", style: {} },
          ].map((r) => (
            <div key={r.label} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: "#64748b", marginBottom: 1 }}>{r.label}</div>
              <div style={{ fontSize: 12, color: "#e2e8f0", ...r.style }}>{r.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main ── */}
      <div style={S.main}>
        {/* Topbar */}
        <div style={S.topbar}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 2 }}>Flare Genome</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>64-D Spectral Fingerprint of Solar Flare Event</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={S.tbBtn}>📅 2024-09-02 ⟳</div>
            <div style={S.tbBtn}>⏱ 12:15:30 IST ▾</div>
            <div style={{ ...S.tbBtn, background: "#1e3a5f", color: "#60a5fa", borderColor: "#2563eb" }}>⟳ Compare Events</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          {tabs.map((t) => (
            <div key={t} style={t === activeTab ? S.tabActive : S.tab} onClick={() => setActiveTab(t)}>{t}</div>
          ))}
        </div>

        {/* Content */}
        <div style={S.content}>
          <div style={S.center}>

            {/* Heatmap card */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <div style={S.cardTitle}>
                  Flare Genome (64-D Fingerprint) <span style={S.infoDot}>i</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={S.actBtn}>⬇ Export Genome</div>
                  <div style={S.actBtn}>View Options ▾</div>
                </div>
              </div>

              <div style={{ position: "relative" }}>
                <div style={{ textAlign: "center", fontSize: 11, color: "#64748b", marginLeft: 110, marginBottom: 4 }}>Dimension</div>
                <div style={{ display: "flex" }}>
                  {/* Y-axis labels */}
                  <div style={{ width: 110, display: "flex", flexDirection: "column", justifyContent: "space-around", paddingBottom: 46 }}>
                    {/* Feature Group rotated label */}
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: -8, top: "50%", transform: "translateY(-50%) rotate(-90deg)", fontSize: 10, color: "#64748b", whiteSpace: "nowrap", transformOrigin: "center", pointerEvents: "none" }}>Feature Group</span>
                    </div>
                    {ROWS.map((r) => (
                      <div key={r} style={{ fontSize: 10, color: "#64748b", textAlign: "right", paddingRight: 6 }}>{r}</div>
                    ))}
                  </div>

                  {/* Canvas + x-axis */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", padding: "0 2px", marginBottom: 2 }}>
                      {[1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 64].map((n) => <span key={n}>{n}</span>)}
                    </div>
                    <Heatmap />
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, marginTop: 8 }}>
                      <Colorbar />
                      <div style={{ display: "flex", justifyContent: "space-between", width: 300, fontSize: 10, color: "#64748b" }}>
                        {[-3, -2, -1, 0, 1, 2, 3].map((n) => <span key={n}>{n}</span>)}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>Normalized Value (Z-score)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom row: table + radar */}
            <div style={{ display: "flex", gap: 14 }}>
              {/* Similarity table */}
              <div style={{ ...S.card, flex: 1 }}>
                <div style={S.cardHeader}>
                  <div style={S.cardTitle}>
                    Top 5 Similar Events (From Solar Memory DB) <span style={S.infoDot}>i</span>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                    <thead>
                      <tr>
                        {["Rank", "Event ID", "Date & Time (IST)", "Class", "Similarity Score", "Anomaly", "Lead Time", "View"].map((h) => (
                          <th key={h} style={{ padding: "6px 8px", color: "#64748b", fontWeight: 500, borderBottom: "1px solid #1e2535", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {EVENTS.map((ev) => (
                        <tr key={ev.rank} style={{ borderBottom: "1px solid #0e1420" }}>
                          <td style={{ padding: "6px 8px", color: "#94a3b8" }}>{ev.rank}</td>
                          <td style={{ padding: "6px 8px", color: "#94a3b8", whiteSpace: "nowrap" }}>{ev.id}</td>
                          <td style={{ padding: "6px 8px", color: "#94a3b8", whiteSpace: "nowrap" }}>{ev.dt}</td>
                          <td style={{ padding: "6px 8px", fontWeight: 700, whiteSpace: "nowrap", color: ev.clsCat === "C" ? "#f97316" : "#fbbf24" }}>{ev.cls}</td>
                          <td style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>
                            <span style={{ display: "inline-block", width: 60, height: 8, background: "#1e2535", borderRadius: 4, verticalAlign: "middle", marginRight: 6, overflow: "hidden" }}>
                              <span style={{ display: "block", width: `${ev.sim * 100}%`, height: 8, borderRadius: 4, background: ev.clsCat === "C" ? "#4ade80" : "#fbbf24" }} />
                            </span>
                            {ev.sim}
                          </td>
                          <td style={{ padding: "6px 8px", color: "#94a3b8" }}>{ev.anom}</td>
                          <td style={{ padding: "6px 8px", color: "#94a3b8" }}>{ev.lead}</td>
                          <td style={{ padding: "6px 8px", color: "#3b82f6", cursor: "pointer", fontSize: 14 }}>👁</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#3b82f6", cursor: "pointer" }}>View Full Results →</div>
              </div>

              {/* Radar card */}
              <div style={{ ...S.card, width: 270, minWidth: 240 }}>
                <div style={S.cardHeader}>
                  <div style={{ ...S.cardTitle, fontSize: 12 }}>
                    Genome Comparison <span style={S.infoDot}>i</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 10, color: "#64748b", marginBottom: 8 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="26" height="8" viewBox="0 0 26 8" style={{ flexShrink: 0 }}>
                      <line x1="0" y1="4" x2="26" y2="4" stroke="#22d3ee" strokeWidth="2" />
                      <circle cx="13" cy="4" r="2.5" fill="#22d3ee" />
                    </svg>
                    Selected Event
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="26" height="8" viewBox="0 0 26 8" style={{ flexShrink: 0 }}>
                      <line x1="0" y1="4" x2="26" y2="4" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3" />
                    </svg>
                    Top Match (EVT-2024-06-18-122200)
                  </span>
                </div>
                <RadarChart />
              </div>
            </div>

            {/* Evolution card */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <div style={S.cardTitle}>
                  Genome Evolution (Sliding Window) <span style={S.infoDot}>i</span>
                </div>
              </div>
              <div style={{ position: "relative", paddingLeft: 22 }}>
                <div style={{ position: "absolute", left: -6, top: "50%", transform: "translateY(-50%) rotate(-90deg)", fontSize: 10, color: "#64748b", whiteSpace: "nowrap", transformOrigin: "center" }}>
                  Anomaly Score
                </div>
                <EvolutionChart />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", marginTop: 3 }}>
                  {["10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45", "12:00", "12:15", "12:30", "12:45"].map((t) => <span key={t}>{t}</span>)}
                </div>
                <div style={{ textAlign: "center", fontSize: 10, color: "#64748b", marginTop: 2 }}>Time (IST)</div>
              </div>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div style={S.rightPanel}>
            {/* Genome Summary */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 10 }}>Genome Summary</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, background: "#1e2a3e", borderRadius: "50%", border: "1px solid #2d4a7a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="5" r="2.5" stroke="#60a5fa" strokeWidth="1.2" />
                    <circle cx="10" cy="15" r="2.5" stroke="#60a5fa" strokeWidth="1.2" />
                    <line x1="10" y1="7.5" x2="10" y2="12.5" stroke="#60a5fa" strokeWidth="1.2" />
                    <line x1="7" y1="9" x2="4" y2="9" stroke="#60a5fa" strokeWidth="1.2" />
                    <circle cx="4" cy="9" r="1.2" stroke="#60a5fa" strokeWidth="1" />
                    <line x1="13" y1="11" x2="16" y2="11" stroke="#60a5fa" strokeWidth="1.2" />
                    <circle cx="16" cy="11" r="1.2" stroke="#60a5fa" strokeWidth="1" />
                  </svg>
                </div>
                <div style={{ fontSize: 10, color: "#64748b" }}>DNA fingerprint loaded</div>
              </div>
              {[
                { label: "Dimensions",   val: "64" },
                { label: "Anomaly Score", val: null, special: true },
                { label: "Energy Range", val: "0.5 – 160 keV" },
                { label: "Time Window",  val: "2 hours" },
                { label: "Data Points",  val: "8,592" },
                { label: "Generated At", val: "2024-09-02 12:15:30 IST", small: true },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: "1px solid #1e2535", fontSize: 11 }}>
                  <span style={{ color: "#64748b" }}>{row.label}</span>
                  {row.special ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ color: "#e2e8f0", fontWeight: 500 }}>0.18</span>
                      <span style={{ background: "#0d2818", color: "#4ade80", fontSize: 10, padding: "1px 6px", borderRadius: 3 }}>● Low</span>
                    </span>
                  ) : (
                    <span style={{ color: "#e2e8f0", fontWeight: 500, fontSize: row.small ? 10 : 11 }}>{row.val}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Genome Interpretation */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#c9a227", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <span>⟲</span> Genome Interpretation
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
                The event shows moderate spectral hardening with gradual energy build-up. The fingerprint is most similar to typical C-class flares with slow rise profile.
              </div>
            </div>

            {/* Feature Group Contribution */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                Feature Group Contribution <span style={S.infoDot}>i</span>
              </div>
              {CONTRIBS.map((c) => (
                <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8", width: 112, flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.label}</span>
                  <div style={{ flex: 1, height: 6, background: "#1e2535", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${(c.pct / 25) * 100}%`, height: 6, borderRadius: 3, background: c.color }} />
                  </div>
                  <span style={{ fontSize: 10, color: "#94a3b8", width: 34, textAlign: "right", flexShrink: 0 }}>{c.pct}%</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>Actions</div>
              {["⬇ Export Genome Data", "⬜ Download Heatmap", "◎ View in 3D (PCA)", "＋ Add to Memory DB"].map((a) => (
                <div key={a} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 6, border: "1px solid #1e2535", background: "#0f1117", color: "#94a3b8", fontSize: 11, cursor: "pointer", marginBottom: 6 }}>
                  {a}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}