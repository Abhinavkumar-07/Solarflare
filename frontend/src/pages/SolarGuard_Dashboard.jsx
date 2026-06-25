import React, { useState, useEffect, useMemo, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  LayoutDashboard, Activity, TrendingUp, Dna, Database, Bell, FileText,
  Settings, Info, Calendar, Clock, Search, ZoomIn, Maximize2, ArrowUpRight,
  AlertTriangle, Sun,
} from "lucide-react";
import { COLORS as THEME_COLORS, PAGE_STYLE, MAIN_STYLE, FONT } from "../theme";
import { SIMILAR_EVENTS } from "../data/dashboardData";

/* ────────────────────────────────────────────────────────────────────────
   SolarGuard — ISRO BAH 2026 dashboard
   Solar flare forecasting & nowcasting using Aditya-L1 SoLEXS + HEL1OS

   Layout, palette, and panel set match the approved design exactly:
   dark navy theme, left nav rail, 5 stat cards, dual light-curve row,
   3-panel analysis row, genome heatmap + memory table + forecast gauge.
   ──────────────────────────────────────────────────────────────────────── */

// ── Design tokens — pulled from shared theme ──────────────────────────
const COLORS = THEME_COLORS;



// ── Synthetic-but-physically-shaped data generator ──────────────────────
// Mirrors the real shape of June 3, 2026 data: quiet baseline, a flare
// rise/peak/decay, hard X-ray leading soft X-ray by several minutes.
function generateFlareSeries(nPoints = 64, seed = 7) {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const soft = [];
  const hard = [];
  const peakIdx = Math.floor(nPoints * 0.58);
  const hardPeakIdx = peakIdx - 4; // hard leads soft, as in real data

  for (let i = 0; i < nPoints; i++) {
    const softBase = 12 + rand() * 6;
    const hardBase = 8 + rand() * 5;

    const softFlare = 3800 * Math.exp(-((i - peakIdx) ** 2) / (2 * 7 ** 2));
    const hardFlare = 2600 * Math.exp(-((i - hardPeakIdx) ** 2) / (2 * 5.5 ** 2));

    soft.push(Math.max(8, softBase + softFlare + (rand() - 0.5) * softBase * 0.6));
    hard.push(Math.max(0.4, hardBase + hardFlare + (rand() - 0.5) * hardBase * 0.6));
  }
  return { soft, hard, peakIdx, hardPeakIdx };
}

function buildTimeLabels(nPoints, startHour = 11, startMin = 45) {
  const labels = [];
  const totalMin = 75; // 11:45 -> 13:00 window, matches design
  for (let i = 0; i < nPoints; i++) {
    const m = startMin + (totalMin * i) / (nPoints - 1);
    const hh = startHour + Math.floor(m / 60);
    const mm = Math.floor(m % 60);
    labels.push(`${hh}:${String(mm).padStart(2, "0")}`);
  }
  return labels;
}

// 64-dim genome fingerprint heatmap data (8 rows x 64 cols, like the design)
function generateGenomeMatrix(seed = 3) {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const rows = 8;
  const cols = 64;
  const matrix = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      // smooth-ish structure so it reads as a real learned fingerprint, not noise
      const v =
        Math.sin(c * 0.18 + r * 0.6) * 1.6 +
        Math.cos(c * 0.05 + r) * 1.1 +
        (rand() - 0.5) * 1.3;
      row.push(v);
    }
    matrix.push(row);
  }
  return matrix;
}

function genomeColor(v) {
  // -3 (blue) -> 0 (dark) -> +3 (red), matches the design's colorbar
  const clamped = Math.max(-3, Math.min(3, v));
  if (clamped >= 0) {
    const t = clamped / 3;
    const r = Math.round(40 + t * 215);
    const g = Math.round(40 + (1 - t) * 60);
    const b = Math.round(60 - t * 40);
    return `rgb(${r},${g},${b})`;
  } else {
    const t = -clamped / 3;
    const r = Math.round(20 + (1 - t) * 20);
    const g = Math.round(50 + t * 90);
    const b = Math.round(80 + t * 175);
    return `rgb(${r},${g},${b})`;
  }
}



function classColor(cls) {
  if (cls.startsWith("X")) return COLORS.accentRed;
  if (cls.startsWith("M")) return COLORS.accentOrange;
  if (cls.startsWith("C")) return COLORS.accentYellow;
  return COLORS.accentGreen; // B / A
}

// ── Small reusable building blocks ──────────────────────────────────────

function Panel({ title, icon: Icon, actions, children, accent, style }) {
  return (
    <div
      style={{
        background: COLORS.panel,
        border: `1px solid ${accent ? accent + "55" : COLORS.panelBorder}`,
        borderRadius: 10,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {Icon && <Icon size={15} color={accent || COLORS.accentBlue} strokeWidth={2} />}
          <span style={{ fontSize: 13, fontWeight: 600, color: accent || COLORS.textPrimary }}>{title}</span>
        </div>
        {actions && <div style={{ display: "flex", gap: 10, color: COLORS.textMuted }}>{actions}</div>}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
}

function StatCard({ icon: Icon, iconColor, label, value, valueColor, sub }) {
  return (
    <div
      style={{
        background: COLORS.panel,
        border: `1px solid ${COLORS.panelBorder}`,
        borderRadius: 10,
        padding: "14px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          background: iconColor + "1a", display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Icon size={17} color={iconColor} strokeWidth={2} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 2, whiteSpace: "nowrap" }}>{label}</div>
        <div style={{ fontSize: 21, fontWeight: 700, color: valueColor || COLORS.textPrimary, lineHeight: 1.15 }}>{value}</div>
        <div style={{ fontSize: 10.5, color: COLORS.textMuted, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0a0f1f", border: `1px solid ${COLORS.panelBorder}`, borderRadius: 6, padding: "6px 10px", fontSize: 11 }}>
      <div style={{ color: COLORS.textMuted, marginBottom: 3 }}>{label} IST</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}{unit || ""}
        </div>
      ))}
    </div>
  );
}

// ── Main dashboard ───────────────────────────────────────────────────────

export default function SolarGuardDashboard() {
  const navigate = useNavigate();
    const [date, setDate] = useState("2026-06-03");
  const [time, setTime] = useState("12:45:30");
  const [tick, setTick] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isLive) return;
    intervalRef.current = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(intervalRef.current);
  }, [isLive]);

  // Compute a seed offset from the selected date and time to make charts update when date selectors change
  const timeSeed = useMemo(() => {
    return Array.from(date + time).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }, [date, time]);

  // Live mode subtly advances the seed so the curves drift slightly each
  // tick (new noise, same overall flare shape) — visible movement without
  // the chart jumping around unrealistically.
  const { soft, hard, peakIdx, hardPeakIdx } = useMemo(
    () => generateFlareSeries(64, 7 + tick + timeSeed),
    [tick, timeSeed]
  );
  const timeLabels = useMemo(() => buildTimeLabels(64), []);
  const genome = useMemo(() => generateGenomeMatrix(3), []);

  const lightCurveData = useMemo(
    () => timeLabels.map((t, i) => ({ t, soft: soft[i], hard: hard[i] })),
    [timeLabels, soft, hard]
  );

  const hardeningData = useMemo(
    () =>
      timeLabels.map((t, i) => ({
        t,
        ratio: Math.max(0.05, hard[i] / soft[i]),
      })),
    [timeLabels, soft, hard]
  );

  const forecastData = useMemo(
    () =>
      timeLabels.map((t, i) => {
        const rampUp = Math.min(100, Math.max(5, ((i - 10) / 30) * 70 + 8));
        const noise = Math.sin(i * 0.7) * 6;
        return { t, prob: Math.max(2, Math.min(98, rampUp + noise)) };
      }),
    [timeLabels]
  );

  const currentProb = 44.7;
  const currentRatio = hardeningData[Math.floor(hardeningData.length * 0.62)]?.ratio.toFixed(3) || "1.014";
  const zScore = 0.73;

  return (
    <div style={PAGE_STYLE}>
      {/* ── Left nav rail ── */}
      <Sidebar activePage="Dashboard" />

      <main style={{ ...MAIN_STYLE, padding: "20px 24px", gap: 16, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <FieldPicker icon={Calendar} label="Selected Date" value={date} type="date" onChange={setDate} />
            <FieldPicker icon={Clock} label="Time (IST)" value={time} type="time" onChange={setTime} />
            <button
              onClick={() => setIsLive((v) => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: isLive ? "#0f3322" : "#241414",
                border: `1px solid ${isLive ? COLORS.accentGreen + "55" : COLORS.accentRed + "55"}`,
                borderRadius: 7, padding: "8px 14px", color: isLive ? COLORS.accentGreen : COLORS.accentRed,
                fontSize: 12, fontWeight: 700, cursor: "pointer", marginTop: 18,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: 99, background: isLive ? COLORS.accentGreen : COLORS.accentRed, display: "inline-block" }} />
              {isLive ? "LIVE" : "PAUSED"}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ fontSize: 11.5, color: COLORS.textSecondary }}>
              Data Source: <span style={{ color: COLORS.accentGreen, fontWeight: 600 }}>Aditya-L1 (SoLEXS + HEL1OS)</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 2 }}>System Status</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: COLORS.accentGreen }} />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.accentGreen }}>Normal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stat cards row */}
        <div className="sg-grid-5" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          <StatCard icon={Sun} iconColor={COLORS.accentYellow} label="Current Flare Class" value="C-Class" valueColor={COLORS.accentYellow} sub="Predicted Class" />
          <StatCard icon={TrendingUp} iconColor={COLORS.accentPurple} label="Flare Probability" value={`${currentProb}%`} valueColor={COLORS.accentPurple} sub="Probability of M or X class" />
          <StatCard icon={Search} iconColor={COLORS.accentTeal} label="Spectral Hardening Ratio" value={currentRatio} valueColor={COLORS.accentTeal} sub="Hard / Soft Flux Ratio" />
          <StatCard icon={Activity} iconColor={COLORS.accentOrange} label="Z-Score (Anomaly)" value={`${zScore} σ`} valueColor={COLORS.accentOrange} sub="Deviation from Normal" />
          <StatCard icon={Clock} iconColor={COLORS.accentGreen} label="Lead Time (Est.)" value="10 min" valueColor={COLORS.accentGreen} sub="Until Expected Peak" />
        </div>

        {/* Dual light curve row */}
        <div className="sg-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, height: 230 }}>
          <Panel
            title="SoLEXS Soft X-ray Light Curve (0.5 – 4 keV)"
            icon={Activity}
            accent={COLORS.accentBlue}
            actions={<><ZoomIn size={14} /><ArrowUpRight size={14} /><Maximize2 size={13} /></>}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lightCurveData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.gridLine} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: COLORS.textMuted }} interval={13} tickLine={false} axisLine={{ stroke: COLORS.gridLine }} />
                <YAxis scale="log" domain={[8, "auto"]} tick={{ fontSize: 10, fill: COLORS.textMuted }} tickLine={false} axisLine={{ stroke: COLORS.gridLine }} width={42} />
                <Tooltip content={<CustomTooltip unit=" cts/s" />} />
                <Line type="monotone" dataKey="soft" name="SoLEXS (SDD2)" stroke={COLORS.accentBlue} dot={false} strokeWidth={1.6} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          <Panel
            title="HEL1OS Hard X-ray Light Curve (18 – 160 keV)"
            icon={Activity}
            accent={COLORS.accentOrange}
            actions={<><ZoomIn size={14} /><ArrowUpRight size={14} /><Maximize2 size={13} /></>}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lightCurveData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.gridLine} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: COLORS.textMuted }} interval={13} tickLine={false} axisLine={{ stroke: COLORS.gridLine }} />
                <YAxis scale="log" domain={[0.3, "auto"]} tick={{ fontSize: 10, fill: COLORS.textMuted }} tickLine={false} axisLine={{ stroke: COLORS.gridLine }} width={42} />
                <Tooltip content={<CustomTooltip unit=" cts/s" />} />
                <Line type="monotone" dataKey="hard" name="HEL1OS (CZT)" stroke={COLORS.accentOrange} dot={false} strokeWidth={1.6} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        </div>

        {/* Middle 3-panel row: ratio, forecast, nowcast+gauge */}
        <div className="sg-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, height: 230 }}>
          <Panel title="Spectral Hardening Ratio (Hard / Soft)" icon={TrendingUp} accent={COLORS.accentGreen}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hardeningData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.gridLine} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 9.5, fill: COLORS.textMuted }} interval={13} tickLine={false} axisLine={{ stroke: COLORS.gridLine }} />
                <YAxis domain={[0, 2.2]} tick={{ fontSize: 9.5, fill: COLORS.textMuted }} tickLine={false} axisLine={{ stroke: COLORS.gridLine }} width={28} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={1.2} stroke={COLORS.accentRed} strokeDasharray="4 3" label={{ value: "Warning Threshold (1.2)", fontSize: 9, fill: COLORS.accentRed, position: "insideTopRight" }} />
                <Line type="monotone" dataKey="ratio" name="Hardening Ratio" stroke={COLORS.accentGreen} dot={false} strokeWidth={1.6} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Flare Probability Forecast" icon={TrendingUp} accent={COLORS.accentPurple}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.gridLine} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 9.5, fill: COLORS.textMuted }} interval={13} tickLine={false} axisLine={{ stroke: COLORS.gridLine }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9.5, fill: COLORS.textMuted }} tickLine={false} axisLine={{ stroke: COLORS.gridLine }} width={28} />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <ReferenceLine y={60} stroke={COLORS.accentRed} strokeDasharray="4 3" label={{ value: "Alert Threshold (60%)", fontSize: 9, fill: COLORS.accentRed, position: "insideTopRight" }} />
                <Line type="monotone" dataKey="prob" name="M/X Probability" stroke={COLORS.accentPurple} dot={false} strokeWidth={1.6} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Nowcast & Forecast" icon={Activity} accent={COLORS.accentBlue}>
            <div style={{ display: "flex", height: "100%", gap: 10 }}>
              <div style={{ flex: 1.1, fontSize: 11, color: COLORS.textSecondary, lineHeight: 1.7 }}>
                <div style={{ fontWeight: 700, color: COLORS.textPrimary, marginBottom: 2 }}>Nowcast (Next 5 min)</div>
                <div>
                  Flare probability is{" "}
                  <span style={{ background: "#241a3d", color: COLORS.accentPurple, padding: "1px 6px", borderRadius: 5, fontWeight: 700 }}>
                    {currentProb}%
                  </span>{" "}
                  for M-class or higher.
                </div>
                <div style={{ fontWeight: 700, color: COLORS.textPrimary, marginTop: 10, marginBottom: 2 }}>Forecast (Next 30 min)</div>
                <div>
                  Probability may reach{" "}
                  <span style={{ background: "#241a3d", color: COLORS.accentPurple, padding: "1px 6px", borderRadius: 5, fontWeight: 700 }}>
                    67.3%
                  </span>{" "}
                  around 12:55 IST.
                </div>
                <div style={{ fontWeight: 700, color: COLORS.textPrimary, marginTop: 10, marginBottom: 2 }}>Predicted Flare Class</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.accentOrange }}>M-Class</div>
              </div>
              <Gauge value={currentProb} />
            </div>
          </Panel>
        </div>

        {/* Bottom row: genome heatmap, similar events table, alert card */}
        <div className="sg-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.85fr", gap: 14, flex: 1, minHeight: 230 }}>
          <Panel title="Flare Genome (64-D Fingerprint)" icon={Dna} accent={COLORS.accentBlue}>
            <GenomeHeatmap matrix={genome} />
          </Panel>

          <Panel title="Top 5 Similar Events (Solar Memory DB)" icon={Database} accent={COLORS.accentTeal}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
              <thead>
                <tr style={{ color: COLORS.textMuted, textAlign: "left" }}>
                  <th style={{ paddingBottom: 8, fontWeight: 500 }}>Rank</th>
                  <th style={{ paddingBottom: 8, fontWeight: 500 }}>Date &amp; Time (IST)</th>
                  <th style={{ paddingBottom: 8, fontWeight: 500 }}>Flare Class</th>
                  <th style={{ paddingBottom: 8, fontWeight: 500, textAlign: "right" }}>Similarity Score</th>
                </tr>
              </thead>
              <tbody>
                {SIMILAR_EVENTS.map((e) => (
                  <tr key={e.rank} style={{ borderTop: `1px solid ${COLORS.panelBorder}` }}>
                    <td style={{ padding: "8px 0", color: COLORS.textSecondary }}>{e.rank}</td>
                    <td style={{ padding: "8px 0", color: COLORS.textSecondary }}>{e.date}</td>
                    <td style={{ padding: "8px 0", color: classColor(e.cls), fontWeight: 700 }}>{e.cls}</td>
                    <td style={{ padding: "8px 0", color: COLORS.accentTeal, textAlign: "right", fontWeight: 600 }}>{e.score.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <AlertCard prob={currentProb} cls="M-Class" leadMin={10} updated="2026-06-03 12:45:30 IST" />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: COLORS.textMuted, padding: "2px 2px 0" }}>
          <span>SolarGuard © 2026 | Built for ISRO Hackathon 2026</span>
          <span>Data Latency: 2.3 sec</span>
        </div>
      </main>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────

function FieldPicker({ icon: Icon, label, value, type="text", onChange }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: COLORS.textSecondary, marginBottom: 4 }}>{label}</div>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`,
          borderRadius: 7, padding: "8px 12px", fontSize: 12.5, minWidth: 150,
        }}
      >
        <Icon size={13} color={COLORS.textMuted} />
        <input 
          type={type} 
          value={value} 
          onChange={(e) => onChange && onChange(e.target.value)}
          style={{ background: "transparent", border: "none", outline: "none", color: "inherit", width: "100%" }}
        />
      </div>
    </div>
  );
}

function Gauge({ value }) {
  const angle = -90 + (value / 100) * 180;
  const r = 56;
  const cx = 70;
  const cy = 70;
  const arc = (startDeg, endDeg, color) => {
    const toRad = (d) => ((d - 180) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`} stroke={color} strokeWidth={10} fill="none" strokeLinecap="round" />;
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <svg width="150" height="100" viewBox="0 0 140 80">
        {arc(0, 90, COLORS.accentGreen)}
        {arc(90, 135, COLORS.accentYellow)}
        {arc(135, 180, COLORS.accentRed)}
        <line
          x1={cx} y1={cy}
          x2={cx + (r - 14) * Math.cos((angle * Math.PI) / 180)}
          y2={cy + (r - 14) * Math.sin((angle * Math.PI) / 180)}
          stroke="#fff" strokeWidth={2.5} strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={3.5} fill="#fff" />
        <text x="14" y="78" fontSize="8" fill={COLORS.textMuted}>0%</text>
        <text x="64" y="14" fontSize="8" fill={COLORS.textMuted}>50%</text>
        <text x="116" y="78" fontSize="8" fill={COLORS.textMuted}>100%</text>
      </svg>
      <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, marginTop: -6 }}>{value}%</div>
      <div style={{ fontSize: 10, color: COLORS.textMuted }}>Current Probability</div>
    </div>
  );
}

function GenomeHeatmap({ matrix }) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  return (
    <div style={{ display: "flex", gap: 8, height: "100%" }}>
      <div style={{ flex: 1, display: "grid", gridTemplateRows: `repeat(${rows}, 1fr)`, gap: 1 }}>
        {matrix.map((row, r) => (
          <div key={r} style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 1 }}>
            {row.map((v, c) => (
              <div key={c} style={{ background: genomeColor(v) }} title={`dim ${r * cols + c + 1}: ${v.toFixed(2)}`} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", width: 14 }}>
        <span style={{ fontSize: 9, color: COLORS.accentRed }}>3</span>
        <div style={{ flex: 1, width: 8, borderRadius: 4, background: "linear-gradient(to bottom, #f87171, #1a1f2e, #38bdf8)" }} />
        <span style={{ fontSize: 9, color: COLORS.accentBlue }}>-3</span>
      </div>
    </div>
  );
}

function AlertCard({ prob, cls, leadMin, updated }) {
  return (
    <div
      style={{
        background: "#1a0f0f",
        border: `1px solid ${COLORS.accentOrange}55`,
        borderRadius: 10,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Bell size={14} color={COLORS.accentPurple} />
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.accentPurple }}>Current Alert</span>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        <div
          style={{
            width: 38, height: 38, borderRadius: 9, flexShrink: 0,
            background: COLORS.accentYellow + "22", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <AlertTriangle size={19} color={COLORS.accentYellow} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.accentYellow, marginBottom: 3 }}>WATCH</div>
          <div style={{ fontSize: 11.5, color: COLORS.textSecondary, lineHeight: 1.5 }}>
            Enhanced activity detected. M-class flare possible in next {leadMin} minutes.
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: "auto", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 3 }}>Probability</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.accentPurple }}>{prob}%</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 3 }}>Predicted Class</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.accentOrange }}>{cls}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 3 }}>Lead Time</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.accentGreen }}>{leadMin} min</div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${COLORS.panelBorder}`, paddingTop: 10, fontSize: 10, color: COLORS.textMuted }}>
        Last Updated: {updated}
      </div>
    </div>
  );
}
