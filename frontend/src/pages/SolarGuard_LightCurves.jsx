import React, { useState, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { toast } from "../components/Toast";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea,
} from "recharts";
import {
  LayoutDashboard, Activity, TrendingUp, Dna, Database, Bell, FileText,
  Settings, Info, Calendar, Clock, RefreshCw, Download, Hand, RotateCcw,
  Maximize2, MoreHorizontal, Link2, Sun, Check,
} from "lucide-react";
import { COLORS as THEME_COLORS, PAGE_STYLE, MAIN_STYLE, FONT } from "../theme";

/* ────────────────────────────────────────────────────────────────────────
   SolarGuard — Light Curves detail page
   Same design system as the main Dashboard: dark navy, left nav rail,
   per-channel toggle pills, dual large light-curve panels with crosshair
   readouts, a metrics strip, and a 4-panel analysis row.
   ──────────────────────────────────────────────────────────────────────── */

const COLORS = THEME_COLORS;

const RANGE_OPTIONS = ["5m", "15m", "1h", "3h", "6h", "12h"];

const EVENT_MARKERS = [
  { time: "12:08:20", label: "Elevated Activity", color: COLORS.accentYellow },
  { time: "12:11:05", label: "Hardening Ratio > 1.0", color: COLORS.accentOrange },
  { time: "12:15:30", label: "Flare Peak (Est.)", color: COLORS.accentRed },
  { time: "12:25:30", label: "Gradual Decay", color: COLORS.accentBlue },
  { time: "12:35:30", label: "Returning to Normal", color: COLORS.accentGreen },
];

// ── Synthetic-but-physically-shaped light curve generator ──────────────
function generateChannelSeries(nPoints, { base, flarePeak, peakIdx, width, noiseScale, seed }) {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const vals = [];
  for (let i = 0; i < nPoints; i++) {
    const flare = flarePeak * Math.exp(-((i - peakIdx) ** 2) / (2 * width ** 2));
    const decayTail = i > peakIdx ? flare * 0.15 * Math.exp(-(i - peakIdx) / 18) : 0;
    const v = base + flare + decayTail * 0 + (rand() - 0.5) * base * noiseScale;
    vals.push(Math.max(base * 0.3, v));
  }
  return vals;
}

function buildTimeLabels(nPoints, startHour = 11, startMin = 30, totalMin = 75) {
  const labels = [];
  for (let i = 0; i < nPoints; i++) {
    const m = startMin + (totalMin * i) / (nPoints - 1);
    const hh = startHour + Math.floor(m / 60);
    const mm = Math.floor(m % 60);
    labels.push(`${hh}:${String(mm).padStart(2, "0")}`);
  }
  return labels;
}

function fmtSci(v) {
  if (v >= 1000) return `${(v / 1000).toFixed(2)} × 10³`;
  if (v >= 100) return `${(v / 100).toFixed(2)} × 10²`;
  return v.toFixed(1);
}

// ── Reusable building blocks ─────────────────────────────────────────────

function ChannelPill({ icon, color, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", cursor: "pointer", gap: 7,
        background: active ? color + "1f" : "transparent",
        border: `1px solid ${active ? color + "70" : COLORS.panelBorder}`,
        borderRadius: 8, padding: "7px 13px", cursor: "pointer",
        fontSize: 12.5, fontWeight: 600, color: active ? color : COLORS.textSecondary,
        transition: "all 0.15s",
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 99, background: color, flexShrink: 0 }} />
      {label}
    </button>
  );
}

function RangeTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600,
        border: `1px solid ${active ? COLORS.accentBlue + "70" : COLORS.panelBorder}`,
        background: active ? COLORS.accentBlue + "1f" : "transparent",
        color: active ? COLORS.accentBlue : COLORS.textSecondary, cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function Panel({ title, icon: Icon, accent, actions, children, style }) {
  return (
    <div
      style={{
        background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`,
        borderRadius: 10, padding: "16px 18px",
        display: "flex", flexDirection: "column", minWidth: 0, ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", cursor: "pointer", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 8 }}>
          {Icon && <Icon size={15} color={accent || COLORS.accentBlue} strokeWidth={2} />}
          <span style={{ fontSize: 14, fontWeight: 700, color: accent || COLORS.textPrimary }}>{title}</span>
        </div>
        {actions && <div style={{ display: "flex", gap: 12, color: COLORS.textMuted }}>{actions}</div>}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
}

function CrosshairTooltip({ active, payload, label, dataKey, color, unit }) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  return (
    <div style={{ background: "#0a0f1f", border: `1px solid ${COLORS.panelBorder}`, borderRadius: 7, padding: "8px 12px", fontSize: 11.5 }}>
      <div style={{ color: COLORS.textMuted, marginBottom: 3 }}>{label} IST</div>
      <div style={{ color, fontWeight: 700, fontSize: 13 }}>{fmtSci(v)}</div>
      <div style={{ color: COLORS.textMuted, fontSize: 10 }}>{unit}</div>
    </div>
  );
}

function MetricCard({ icon: Icon, iconColor, label, value, unit, sub, subColor, link }) {
  return (
    <div
      style={{
        background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`,
        borderRadius: 10, padding: "14px 16px", minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 7, marginBottom: 9 }}>
        {link ? (
          <Link2 size={13} color={iconColor} strokeWidth={2.2} />
        ) : (
          <span style={{ width: 8, height: 8, borderRadius: 99, background: iconColor, flexShrink: 0 }} />
        )}
        <span style={{ fontSize: 11.5, color: COLORS.textSecondary, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontSize: 19, fontWeight: 800, color: iconColor }}>{value}</span>
        {unit && <span style={{ fontSize: 11.5, color: COLORS.textMuted }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 11, color: subColor || COLORS.textMuted, marginTop: 4, display: "flex", alignItems: "center", cursor: "pointer", gap: 4 }}>
        {sub}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────

export default function LightCurvesPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState("15m");
  const [autoScale, setAutoScale] = useState(true);
  const [activeChannels, setActiveChannels] = useState({
    solexs: true, czt: false, cdte: false, all: false,
  });

  const N = 80;
  const timeLabels = useMemo(() => buildTimeLabels(N), []);

  const soft = useMemo(
    () => generateChannelSeries(N, { base: 14, flarePeak: 1260, peakIdx: 46, width: 13, noiseScale: 0.55, seed: 11 }),
    []
  );
  const hard = useMemo(
    () => generateChannelSeries(N, { base: 1.2, flarePeak: 240, peakIdx: 43, width: 11, noiseScale: 0.6, seed: 23 }),
    []
  );
  const cdte = useMemo(
    () => generateChannelSeries(N, { base: 0.6, flarePeak: 30, peakIdx: 44, width: 12, noiseScale: 0.65, seed: 31 }),
    []
  );

  const softData = timeLabels.map((t, i) => ({ t, v: soft[i] }));
  const hardData = timeLabels.map((t, i) => ({ t, v: hard[i] }));

  const crosshairIdx = 45; // ~12:15:30
  const softAtCrosshair = soft[crosshairIdx];
  const hardAtCrosshair = hard[crosshairIdx];
  const softPeak = Math.max(...soft);
  const hardPeak = Math.max(...hard);
  const hardeningRatio = (hardAtCrosshair / softAtCrosshair) * 5.9; // scaled to match design's 1.14 readout
  const backgroundSoft = 140;

  const multiData = timeLabels.map((t, i) => ({
    t, solexs: soft[i], czt: hard[i], cdte: cdte[i], background: backgroundSoft + (i % 5),
  }));

  return (
    <div style={PAGE_STYLE}>
      {/* ── Left nav rail ── */}
      <Sidebar activePage="Light Curves" />

      <main style={{ ...MAIN_STYLE, padding: "20px 24px", gap: 16, display: "flex", flexDirection: "column" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div
              style={{
                width: 38, height: 38, borderRadius: 9, background: COLORS.accentBlue + "1a",
                display: "flex", alignItems: "center", cursor: "pointer", justifyContent: "center", flexShrink: 0, marginTop: 2,
              }}
            >
              <Activity size={19} color={COLORS.accentBlue} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>Light Curves</div>
              <div style={{ fontSize: 12.5, color: COLORS.textSecondary, marginTop: 2 }}>
                Real-time X-ray flux from SoLEXS &amp; HEL1OS
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 10, flexWrap: "wrap" }}>
            <FieldPicker icon={Calendar} value="2024-09-02" onClick={() => toast("Select Date")} />
            <FieldPicker icon={Clock} value="11:30 - 12:45 IST" onClick={() => toast("Select Time")} />
            <button
              style={{
                display: "flex", alignItems: "center", cursor: "pointer", gap: 6, background: "#0f3322",
                border: `1px solid ${COLORS.accentGreen}55`, borderRadius: 8, padding: "9px 14px",
                color: COLORS.accentGreen, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: 99, background: COLORS.accentGreen }} />
              Live
            </button>
            <button
              style={{
                width: 36, height: 36, borderRadius: 8, border: `1px solid ${COLORS.panelBorder}`,
                background: COLORS.panel, display: "flex", alignItems: "center", cursor: "pointer", justifyContent: "center",
                color: COLORS.textSecondary, cursor: "pointer",
              }}
            >
              <RefreshCw size={15} />
            </button>
            <button
              style={{
                display: "flex", alignItems: "center", cursor: "pointer", gap: 7, background: COLORS.navActive,
                border: "none", borderRadius: 8, padding: "9px 16px", color: "#fff",
                fontSize: 12.5, fontWeight: 700, cursor: "pointer",
              }}
            >
              <Download size={14} />
              Export Data
            </button>
          </div>
        </div>

        {/* Channel toggle pills + range tabs */}
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <ChannelPill icon="dot" color={COLORS.accentBlue} label="SoLEXS (0.5 – 4 keV)" active={activeChannels.solexs}
              onClick={() => setActiveChannels((s) => ({ ...s, solexs: !s.solexs }))} />
            <ChannelPill icon="dot" color={COLORS.accentOrange} label="HEL1OS CZT (18 – 160 keV)" active={activeChannels.czt}
              onClick={() => setActiveChannels((s) => ({ ...s, czt: !s.czt }))} />
            <ChannelPill icon="dot" color={COLORS.accentGreen} label="HEL1OS CdTe (1.8 – 90 keV)" active={activeChannels.cdte}
              onClick={() => setActiveChannels((s) => ({ ...s, cdte: !s.cdte }))} />
            <ChannelPill icon="dot" color={COLORS.accentPurple} label="All Channels" active={activeChannels.all}
              onClick={() => setActiveChannels((s) => ({ ...s, all: !s.all }))} />
          </div>

          <div style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 8 }}>
              <span style={{ fontSize: 12, color: COLORS.textSecondary, fontWeight: 600 }}>Auto Scale</span>
              <Toggle checked={autoScale} onChange={() => setAutoScale((v) => !v)} />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {RANGE_OPTIONS.map((r) => (
                <RangeTab key={r} label={r} active={range === r} onClick={() => setRange(r)} />
              ))}
            </div>
          </div>
        </div>

        {/* Dual large light curve panels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, height: 320 }}>
          <Panel
            title="SoLEXS Soft X-ray Light Curve (0.5 – 4 keV)"
            icon={Activity}
            accent={COLORS.accentBlue}
            actions={<><Hand size={14} /><RotateCcw size={14} /><Maximize2 size={13} /><MoreHorizontal size={15} /></>}
          >
            <div style={{ fontSize: 11, color: COLORS.accentBlue, marginBottom: 6, display: "flex", alignItems: "center", cursor: "pointer", gap: 5 }}>
              <Activity size={11} /> SoLEXS SDD2
            </div>
            <ResponsiveContainer width="100%" height="78%">
              <LineChart data={softData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.gridLine} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: COLORS.textMuted }} interval={15} tickLine={false} axisLine={{ stroke: COLORS.gridLine }} />
                <YAxis scale="log" domain={[1, "auto"]} tick={{ fontSize: 10, fill: COLORS.textMuted }} tickLine={false} axisLine={{ stroke: COLORS.gridLine }} width={36} />
                <Tooltip content={<CrosshairTooltip color={COLORS.accentBlue} unit="counts/s" />} />
                <ReferenceLine x={timeLabels[crosshairIdx]} stroke={COLORS.accentBlue} strokeWidth={1}
                  label={{ value: timeLabels[crosshairIdx] + ":30", fill: "#fff", fontSize: 10, position: "top", style: { fill: COLORS.bg } }} />
                <Line type="monotone" dataKey="v" stroke={COLORS.accentBlue} dot={false} strokeWidth={1.6} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
            <MiniSparkline data={softData} color={COLORS.accentBlue} markIdx={[35, 45]} />
          </Panel>

          <Panel
            title="HEL1OS Hard X-ray Light Curve (18 – 160 keV)"
            icon={Activity}
            accent={COLORS.accentOrange}
            actions={<><Hand size={14} /><RotateCcw size={14} /><Maximize2 size={13} /><MoreHorizontal size={15} /></>}
          >
            <div style={{ fontSize: 11, color: COLORS.accentOrange, marginBottom: 6, display: "flex", alignItems: "center", cursor: "pointer", gap: 5 }}>
              <Activity size={11} /> CZT1 + CZT2
            </div>
            <ResponsiveContainer width="100%" height="78%">
              <LineChart data={hardData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.gridLine} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: COLORS.textMuted }} interval={15} tickLine={false} axisLine={{ stroke: COLORS.gridLine }} />
                <YAxis scale="log" domain={[0.1, "auto"]} tick={{ fontSize: 10, fill: COLORS.textMuted }} tickLine={false} axisLine={{ stroke: COLORS.gridLine }} width={36} />
                <Tooltip content={<CrosshairTooltip color={COLORS.accentOrange} unit="counts/s" />} />
                <ReferenceLine x={timeLabels[crosshairIdx]} stroke={COLORS.accentOrange} strokeWidth={1}
                  label={{ value: timeLabels[crosshairIdx] + ":30", fill: "#fff", fontSize: 10, position: "top" }} />
                <Line type="monotone" dataKey="v" stroke={COLORS.accentOrange} dot={false} strokeWidth={1.6} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
            <MiniSparkline data={hardData} color={COLORS.accentOrange} markIdx={[33, 45]} />
          </Panel>
        </div>

        {/* Metrics strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          <MetricCard
            iconColor={COLORS.accentBlue} label="Soft Flux (SoLEXS)"
            value={fmtSci(softAtCrosshair)} unit="counts/s"
            sub={`Peak: ${fmtSci(softPeak)}`}
          />
          <MetricCard
            iconColor={COLORS.accentOrange} label="Hard Flux (HEL1OS)"
            value={fmtSci(hardAtCrosshair)} unit="counts/s"
            sub={`Peak: ${fmtSci(hardPeak)}`}
          />
          <MetricCard
            iconColor={COLORS.accentPurple} label="Spectral Hardening Ratio"
            value={hardeningRatio.toFixed(2)}
            sub={<><Check size={11} color={COLORS.accentGreen} /> <span style={{ color: COLORS.accentGreen }}>↑ 12.6%</span></>}
          />
          <MetricCard
            iconColor={COLORS.accentTeal} label="Background (SoLEXS)"
            value={fmtSci(backgroundSoft)} unit="counts/s"
            sub="—"
          />
          <MetricCard
            iconColor={COLORS.accentTeal} label="Cross-correlation Lag" link
            value="+600" unit="sec"
            sub="(Hard lags Soft)" subColor={COLORS.textMuted}
          />
        </div>

        {/* Bottom 4-panel analysis row */}
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 0.85fr 0.85fr", gap: 14, flex: 1, minHeight: 220 }}>
          <Panel title="Multi-channel Light Curves" icon={Activity} accent={COLORS.accentBlue}>
            <div style={{ display: "flex", gap: 12, marginBottom: 8, fontSize: 10.5, flexWrap: "wrap" }}>
              <LegendDot color={COLORS.accentBlue} label="SoLEXS (0.5–4 keV)" checked />
              <LegendDot color={COLORS.accentOrange} label="CZT (18–160 keV)" />
              <LegendDot color={COLORS.accentGreen} label="CdTe (1.8–90 keV)" />
              <LegendDot color={COLORS.textMuted} label="Background" />
            </div>
            <ResponsiveContainer width="100%" height="76%">
              <LineChart data={multiData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.gridLine} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 9.5, fill: COLORS.textMuted }} interval={19} tickLine={false} axisLine={{ stroke: COLORS.gridLine }} />
                <YAxis scale="log" domain={[0.5, "auto"]} tick={{ fontSize: 9.5, fill: COLORS.textMuted }} tickLine={false} axisLine={{ stroke: COLORS.gridLine }} width={30} />
                <Tooltip content={<CrosshairTooltip color={COLORS.accentBlue} unit="counts/s" />} />
                <ReferenceArea x1={timeLabels[38]} x2={timeLabels[50]} fill={COLORS.accentRed} fillOpacity={0.08}
                  label={{ value: "Flare Window", position: "insideBottom", fontSize: 9, fill: COLORS.accentRed }} />
                <Line type="monotone" dataKey="solexs" stroke={COLORS.accentBlue} dot={false} strokeWidth={1.4} isAnimationActive={false} />
                <Line type="monotone" dataKey="czt" stroke={COLORS.accentOrange} dot={false} strokeWidth={1.2} isAnimationActive={false} />
                <Line type="monotone" dataKey="cdte" stroke={COLORS.accentGreen} dot={false} strokeWidth={1.2} isAnimationActive={false} />
                <Line type="monotone" dataKey="background" stroke={COLORS.textMuted} strokeDasharray="3 3" dot={false} strokeWidth={1} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Intensity Map (Last 24 Hours)" icon={Activity} accent={COLORS.accentBlue}>
            <IntensityMap />
          </Panel>

          <Panel title="Event Markers" icon={Bell} accent={COLORS.accentPurple}>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {EVENT_MARKERS.map((e) => (
                <div key={e.time} style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 9 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: e.color, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>{e.time}</div>
                    <div style={{ fontSize: 12, color: COLORS.textPrimary, fontWeight: 600 }}>{e.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Channel Statistics (Current)" icon={Activity} accent={COLORS.accentBlue}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, height: "100%", alignContent: "space-around" }}>
              <ChannelGauge label="SoLEXS" value={1.28} unit="k counts/s" color={COLORS.accentBlue} pct={0.68} display="1.28k" />
              <ChannelGauge label="CZT" value={242} unit="counts/s" color={COLORS.accentOrange} pct={0.5} display="242" />
              <ChannelGauge label="CdTe" value={48.6} unit="counts/s" color={COLORS.accentGreen} pct={0.42} display="48.6" />
              <ChannelGauge label="Hardening Ratio" value={1.14} unit="" color={COLORS.accentPurple} pct={0.57} display="1.14" />
            </div>
          </Panel>
        </div>

        <div style={{ textAlign: "center", fontSize: 10.5, color: COLORS.textMuted, padding: "2px 2px 0" }}>
          SolarGuard © 2026 | Built for ISRO Hackathon 2026
        </div>
      </main>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────

function FieldPicker({ icon: Icon, value, onClick }) {
  return (
    <div onClick={onClick}
      style={{
        display: "flex", alignItems: "center", cursor: "pointer", gap: 8, background: COLORS.panel,
        border: `1px solid ${COLORS.panelBorder}`, borderRadius: 8, padding: "9px 13px",
        fontSize: 12.5, color: COLORS.textPrimary,
      }}
    >
      <Icon size={13} color={COLORS.textMuted} />
      {value}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 36, height: 20, borderRadius: 99, border: "none", cursor: "pointer",
        background: checked ? COLORS.accentBlue : "#2a3550", position: "relative", padding: 0,
        transition: "background 0.15s",
      }}
    >
      <span
        style={{
          position: "absolute", top: 2, left: checked ? 18 : 2,
          width: 16, height: 16, borderRadius: 99, background: "#fff",
          transition: "left 0.15s",
        }}
      />
    </button>
  );
}

function LegendDot({ color, label, checked }) {
  return (
    <div style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 5, color: COLORS.textSecondary }}>
      <span
        style={{
          width: 11, height: 11, borderRadius: 3, border: `1.5px solid ${color}`,
          background: checked ? color : "transparent", display: "flex", alignItems: "center", cursor: "pointer", justifyContent: "center",
        }}
      />
      {label}
    </div>
  );
}

function MiniSparkline({ data, color, markIdx }) {
  return (
    <div style={{ height: "14%", marginTop: 4 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <Line type="monotone" dataKey="v" stroke={color} strokeOpacity={0.55} dot={false} strokeWidth={1} isAnimationActive={false} />
          {markIdx.map((idx) => (
            <ReferenceLine key={idx} x={data[idx]?.t} stroke={color} strokeWidth={1.5} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function IntensityMap() {
  // Synthetic heatmap: rows = energy bins (log scale 0.1-100 keV), cols = time
  const rows = 20;
  const cols = 60;
  let seed = 17;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const cellColor = (r, c) => {
    const flareBoost = Math.exp(-((c - 38) ** 2) / (2 * 8 ** 2)) * (1 - r / rows);
    const v = rand() * 0.3 + flareBoost * 0.9;
    if (v > 0.75) return "#f87171";
    if (v > 0.55) return "#fb923c";
    if (v > 0.38) return "#facc15";
    if (v > 0.22) return "#4ade80";
    if (v > 0.1) return "#2563eb";
    return "#0c1a33";
  };

  return (
    <div style={{ display: "flex", gap: 8, height: "100%" }}>
      <div style={{ flex: 1, display: "grid", gridTemplateRows: `repeat(${rows}, 1fr)`, gap: 0.5 }}>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 0.5 }}>
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} style={{ background: cellColor(r, c) }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", width: 14, padding: "4px 0" }}>
        <span style={{ fontSize: 8.5, color: COLORS.textMuted }}>High</span>
        <div style={{ flex: 1, width: 8, borderRadius: 4, background: "linear-gradient(to bottom, #f87171, #facc15, #4ade80, #2563eb, #0c1a33)" }} />
        <span style={{ fontSize: 8.5, color: COLORS.textMuted }}>Low</span>
      </div>
    </div>
  );
}

function ChannelGauge({ label, color, pct, display, unit }) {
  const r = 30;
  const cx = 38;
  const cy = 38;
  const toRad = (d) => ((d - 180) * Math.PI) / 180;
  const angle = 180 * pct;
  const x2 = cx + r * Math.cos(toRad(angle));
  const y2 = cy + r * Math.sin(toRad(angle));
  const large = angle > 180 ? 1 : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="76" height="46" viewBox="0 0 76 46">
        <path d={`M 8 38 A 30 30 0 1 1 68 38`} stroke="#1c2740" strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d={`M 8 38 A 30 30 0 ${large} 1 ${x2} ${y2}`} stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" />
      </svg>
      <div style={{ fontSize: 15, fontWeight: 800, color, marginTop: -6 }}>{display}</div>
      <div style={{ fontSize: 9.5, color: COLORS.textMuted }}>{unit}</div>
      <div style={{ fontSize: 11, color: COLORS.textSecondary, fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  );
}
