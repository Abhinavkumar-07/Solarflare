import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { toast } from "../components/Toast";
import {
  Sun,
  LayoutDashboard,
  Activity,
  TrendingUp,
  Dna,
  Database,
  Bell,
  FileText,
  Settings as SettingsIcon,
  Info,
  Calendar,
  Clock,
  Radio,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
} from "recharts";
import { PAGE_STYLE, MAIN_STYLE, FONT } from "../theme";
import { 
  hardeningData as syncHardening, 
  energyData as syncEnergy, 
  timeTicks as syncTicks, 
  latestForecasts as syncForecasts, 
  keyIndicators as syncIndicators, 
  features as syncFeatures 
} from "../data/forecastData";
import forecastService from "../services/forecastService";

/* --------------------------------------------------------------------- */
/* synthetic time-series data                                            */
/* --------------------------------------------------------------------- */



const SUP = { "-6": "⁻⁶", "-5": "⁻⁵", "-4": "⁻⁴", "-3": "⁻³", "-2": "⁻²", "-1": "⁻¹", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵" };
function expTick(v) {
  const e = Math.round(Math.log10(v));
  return `10${SUP[e] ?? e}`;
}

/* --------------------------------------------------------------------- */
/* small reusable pieces (every custom size below is an inline style,    */
/* never a Tailwind arbitrary-value class, since this renderer only      */
/* supports the static pre-built utility classes)                        */
/* --------------------------------------------------------------------- */

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors"
      style={{
        fontSize: 13,
        backgroundColor: active ? "#2563eb" : "transparent",
        color: active ? "#ffffff" : "#94a3b8",
      }}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
  );
}

function TabItem({ label, active }) {
  return (
    <button onClick={() => toast("Exporting report...")}
      className="relative px-1 pb-3 font-medium transition-colors"
      style={{ fontSize: 13.5, color: active ? "#60a5fa" : "#94a3b8" }}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 w-full rounded-full" style={{ height: 2, backgroundColor: "#3b82f6" }} />
      )}
    </button>
  );
}

function CardShell({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-xl border p-4 ${className}`}
      style={{ borderColor: "#1e293b", backgroundColor: "rgba(15,23,42,0.45)", ...style }}
    >
      {children}
    </div>
  );
}

function CardTitle({ title, right }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <h3 className="font-semibold text-slate-100" style={{ fontSize: 14 }}>
          {title}
        </h3>
        <Info className="h-3.5 w-3.5 text-slate-500" />
      </div>
      {right}
    </div>
  );
}

function Trend({ up, children }) {
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span className="inline-flex items-center gap-0.5 font-medium" style={{ fontSize: 11, color: up ? "#34d399" : "#f87171" }}>
      <Icon className="h-3 w-3" />
      {children}
    </span>
  );
}

function KpiCard({ label, value, valueColor, unit, delta, icon: Icon, iconColor, borderColor, bgColor }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor, backgroundColor: bgColor }}>
      <div className="flex items-start justify-between">
        <p style={{ fontSize: 12, color: "#94a3b8" }}>{label}</p>
        <Icon className="h-4 w-4 shrink-0" style={{ color: iconColor }} />
      </div>
      <p className="font-bold leading-none" style={{ fontSize: 26, marginTop: 6, color: valueColor }}>
        {value}
      </p>
      {unit && <p style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>{unit}</p>}
      {delta && <div style={{ marginTop: 6 }}>{delta}</div>}
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span className="flex items-center gap-1.5 text-slate-400" style={{ fontSize: 11.5 }}>
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function ProbBar({ label, percent, color }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="shrink-0 text-slate-400" style={{ fontSize: 12, width: 64 }}>
        {label}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: "#1e293b" }}>
        <div className="h-full rounded-full" style={{ width: `${Math.max(percent, 2)}%`, backgroundColor: color }} />
      </div>
      <span className="shrink-0 text-right text-slate-200" style={{ fontSize: 12, width: 36 }}>
        {percent}%
      </span>
    </div>
  );
}

function InfoRow({ label, value, color = "#e2e8f0" }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span style={{ fontSize: 12.5, color: "#94a3b8" }}>{label}</span>
      <span className="font-medium" style={{ fontSize: 13, color }}>
        {value}
      </span>
    </div>
  );
}

/* ----- donut: Flare Class Forecast ----- */
function ForecastDonut({ percent, label, color }) {
  const data = [
    { v: percent, key: "fill" },
    { v: 100 - percent, key: "rest" },
  ];
  return (
    <div className="relative" style={{ height: 170, width: 170, flexShrink: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="45%" stopColor="#818cf8" />
              <stop offset="75%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <Pie
            data={data}
            dataKey="v"
            startAngle={90}
            endAngle={-270}
            innerRadius={62}
            outerRadius={80}
            paddingAngle={1}
            cornerRadius={6}
            stroke="none"
            isAnimationActive={false}
          >
            <Cell fill="url(#forecastGradient)" />
            <Cell fill="#1e293b" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold" style={{ fontSize: 30, color }}>
          {label}
        </span>
        <span className="font-semibold text-slate-200" style={{ fontSize: 18, marginTop: 4 }}>
          {percent}%
        </span>
        <span style={{ fontSize: 11, color: "#64748b" }}>Probability</span>
      </div>
    </div>
  );
}

/* ----- semicircle speedometer: Hardening Trend ----- */
function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function arcPath(cx, cy, r, startAngle, endAngle) {
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  return `M ${s.x} ${s.y} A ${r} ${r} 0 0 1 ${e.x} ${e.y}`;
}

function HardeningGauge({ value }) {
  const cx = 110;
  const cy = 110;
  const r = 85;
  const segments = [
    { from: -90, to: -45, color: "#34d399" },
    { from: -45, to: 0, color: "#facc15" },
    { from: 0, to: 45, color: "#fb923c" },
    { from: 45, to: 90, color: "#ef4444" },
  ];
  const needleAngle = -90 + value * 180;
  const tip = polarToCartesian(cx, cy, r - 18, needleAngle);

  return (
    <svg viewBox="0 0 220 130" style={{ height: 140, width: "100%" }}>
      {segments.map((s, idx) => (
        <path key={idx} d={arcPath(cx, cy, r, s.from, s.to)} stroke={s.color} strokeWidth={14} strokeLinecap="round" fill="none" />
      ))}
      <circle cx={cx} cy={cy} r={5} fill="#e2e8f0" />
      <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="#e2e8f0" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

/* --------------------------------------------------------------------- */
/* main component                                                         */
/* --------------------------------------------------------------------- */

export default function HardeningForecast() {
  const [activeRange, setActiveRange] = useState("3 hr");
  const navigate = useNavigate();

  const [data, setData] = useState({
    hardeningData: syncHardening,
    energyData: syncEnergy,
    timeTicks: syncTicks,
    latestForecasts: syncForecasts,
    keyIndicators: syncIndicators,
    features: syncFeatures
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchForecast = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedData = await forecastService.getForecastData();
      setData(fetchedData);
    } catch (err) {
      setError(err.message || "Failed to load forecast data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const { hardeningData, energyData, timeTicks, latestForecasts, keyIndicators, features } = data;

  return (
    <div style={{ ...PAGE_STYLE, fontFamily: FONT }}>
      {/* ---------------------------- Sidebar ---------------------------- */}
      <Sidebar activePage="Hardening & Forecast" />


      {/* ----------------------------- Main ------------------------------ */}
      <div style={{ ...MAIN_STYLE }}>
        {error && (
          <div style={{ margin: "20px 32px 0", background: "rgba(239,68,68,0.15)", border: `1px solid #ef4444`, padding: "10px 14px", borderRadius: 8, color: "#f87171", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Failed to sync live data: {error}</span>
            <button onClick={fetchForecast} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 14px", borderRadius: 5, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Retry Connection</button>
          </div>
        )}
        
        {/* Header */}
        <header className="flex items-start justify-between px-8 pt-6" style={{ opacity: isLoading ? 0.6 : 1, transition: "opacity 0.2s" }}>
          <div>
            <h2 className="text-2xl font-bold text-white">Hardening &amp; Forecast</h2>
            <p className="text-slate-500" style={{ fontSize: 13, marginTop: 4 }}>
              Spectral analysis, hardening index and flare class prediction
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 rounded-lg border text-slate-200"
              style={{ fontSize: 13, padding: "8px 12px", borderColor: "#334155", backgroundColor: "rgba(15,23,42,0.6)" }}
            >
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              2024-06-18
            </div>
            <div
              className="flex items-center gap-2 rounded-lg border text-slate-200"
              style={{ fontSize: 13, padding: "8px 12px", borderColor: "#334155", backgroundColor: "rgba(15,23,42,0.6)" }}
            >
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              12:22:00 IST
            </div>
            <div
              className="flex items-center gap-2 rounded-lg border font-semibold"
              style={{ fontSize: 13, padding: "8px 12px", borderColor: "rgba(239,68,68,0.4)", backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171" }}
            >
              <Radio className="h-3.5 w-3.5" />
              Live
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="mt-5 flex items-center justify-between border-b border-slate-800 px-8">
          <div className="flex gap-7">
            <TabItem label="Overview" active />
            <TabItem label="Spectral Analysis" />
            <TabItem label="Model Forecast" />
            <TabItem label="Event History" />
          </div>
          <button onClick={() => toast("Exporting report...")}
            className="mb-2 flex items-center gap-2 rounded-md border font-medium"
            style={{ fontSize: 12.5, padding: "6px 12px", borderColor: "#2563eb", color: "#60a5fa" }}
          >
            <Download className="h-3.5 w-3.5" />
            Export Report
          </button>
        </div>

        <div className="space-y-4 px-8 py-5" style={{ opacity: isLoading ? 0.6 : 1, transition: "opacity 0.2s" }}>
          {/* ----------------------- KPI row ----------------------- */}
          <div className="sg-grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            <KpiCard
              label="Hardening Ratio (HR)"
              value="1.28"
              valueColor="#60a5fa"
              delta={<Trend up>34.6% vs 10 min ago</Trend>}
              icon={TrendingUp}
              iconColor="#60a5fa"
              borderColor="rgba(59,130,246,0.35)"
              bgColor="rgba(30,58,138,0.18)"
            />
            <KpiCard
              label="Hardness Intensity (HI)"
              value="0.74"
              valueColor="#a78bfa"
              delta={<Trend up>18.2% vs 10 min ago</Trend>}
              icon={Activity}
              iconColor="#a78bfa"
              borderColor="rgba(167,139,250,0.35)"
              bgColor="rgba(76,29,149,0.18)"
            />
            <KpiCard
              label="Spectral Index (γ)"
              value="-2.35"
              valueColor="#22d3ee"
              delta={<Trend up={false}>0.24 vs 10 min ago</Trend>}
              icon={TrendingUp}
              iconColor="#22d3ee"
              borderColor="rgba(34,211,238,0.35)"
              bgColor="rgba(22,78,99,0.18)"
            />
            <KpiCard
              label="Energy Flux (15-150 keV)"
              value="2.31 × 10²"
              valueColor="#fb923c"
              unit="erg cm⁻² s⁻¹"
              icon={Activity}
              iconColor="#fb923c"
              borderColor="rgba(251,146,60,0.35)"
              bgColor="rgba(124,45,18,0.18)"
            />
            <KpiCard
              label="Current Phase"
              value="Impulsive"
              valueColor="#f87171"
              unit={
                <span className="font-medium" style={{ fontSize: 11, color: "#f87171" }}>
                  Peak approaching
                </span>
              }
              icon={Activity}
              iconColor="#f87171"
              borderColor="rgba(239,68,68,0.5)"
              bgColor="rgba(127,29,29,0.3)"
            />
          </div>

          {/* ----------------------- charts row ----------------------- */}
          <div className="grid grid-cols-3 gap-4">
            {/* left: two big charts */}
            <div className="col-span-2 space-y-4">
              <CardShell>
                <CardTitle
                  title="Spectral Hardening (Real-time)"
                  right={
                    <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: 12 }}>
                      <span>Time Range:</span>
                      
                      <button className={activeRange === "30 min" ? "rounded-md font-medium text-white" : "text-slate-400 hover:text-slate-200"} onClick={() => setActiveRange("30 min")} style={{ fontSize: 11.5, padding: "4px 10px", backgroundColor: activeRange === "30 min" ? "#2563eb" : "transparent" }}>
                        30 min
                      </button>
                      <button className={activeRange === "1 hr" ? "rounded-md font-medium text-white" : "text-slate-400 hover:text-slate-200"} onClick={() => setActiveRange("1 hr")} style={{ fontSize: 11.5, padding: "4px 10px", backgroundColor: activeRange === "1 hr" ? "#2563eb" : "transparent" }}>
                        1 hr
                      </button>
                      <button className={activeRange === "3 hr" ? "rounded-md font-medium text-white" : "text-slate-400 hover:text-slate-200"} onClick={() => setActiveRange("3 hr")} style={{ fontSize: 11.5, padding: "4px 10px", backgroundColor: activeRange === "3 hr" ? "#2563eb" : "transparent" }}>
                        3 hr
                      </button>
                      <button className={activeRange === "6 hr" ? "rounded-md font-medium text-white" : "text-slate-400 hover:text-slate-200"} onClick={() => setActiveRange("6 hr")} style={{ fontSize: 11.5, padding: "4px 10px", backgroundColor: activeRange === "6 hr" ? "#2563eb" : "transparent" }}>
                        6 hr
                      </button>
                    </div>
                  }
                />
                <div className="mb-2 flex items-center gap-5">
                  <LegendDot color="#60a5fa" label="Hardness Ratio (HR)" />
                  <LegendDot color="#c084fc" label="Hardness Intensity (HI)" />
                  <LegendDot color="#34d399" label="GOES X-ray (1-8 Å)" />
                </div>
                <div style={{ height: 256 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hardeningData} margin={{ top: 10, right: 35, left: 0, bottom: 0 }}>
                      <XAxis
                        dataKey="time"
                        ticks={timeTicks}
                        interval={0}
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        axisLine={{ stroke: "#1e293b" }}
                        tickLine={false}
                        label={{ value: "Time (IST)", position: "insideBottom", offset: -5, fill: "#64748b", fontSize: 11 }}
                      />
                      <YAxis
                        yAxisId="left"
                        domain={[0, 2]}
                        ticks={[0, 0.5, 1, 1.5, 2]}
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        axisLine={{ stroke: "#1e293b" }}
                        tickLine={false}
                        label={{ value: "HR / HI", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 11 }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        scale="log"
                        domain={[0.000001, 0.001]}
                        ticks={[0.000001, 0.00001, 0.0001, 0.001]}
                        tickFormatter={expTick}
                        tick={{ fill: "#34d399", fontSize: 10 }}
                        axisLine={{ stroke: "#1e293b" }}
                        tickLine={false}
                        label={{ value: "W/m²", angle: 90, position: "insideRight", fill: "#34d399", fontSize: 11 }}
                      />
                      <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", fontSize: 12 }} labelStyle={{ color: "#cbd5e1" }} />
                      <ReferenceLine
                        x="12:22"
                        yAxisId="left"
                        stroke="#475569"
                        strokeDasharray="3 3"
                        label={{ value: "Now", position: "top", fill: "#94a3b8", fontSize: 11 }}
                      />
                      <Line yAxisId="left" type="monotone" dataKey="hr" stroke="#60a5fa" strokeWidth={1.75} dot={false} isAnimationActive={false} />
                      <Line yAxisId="left" type="monotone" dataKey="hi" stroke="#c084fc" strokeWidth={1.75} dot={false} isAnimationActive={false} />
                      <Line yAxisId="right" type="monotone" dataKey="goes" stroke="#34d399" strokeWidth={1.75} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardShell>

              <CardShell>
                <CardTitle title="Energy Band Overview (Counts s⁻¹)" />
                <div className="mb-2 flex items-center gap-5">
                  <LegendDot color="#60a5fa" label="Low (4-10 keV)" />
                  <LegendDot color="#34d399" label="Medium (10-20 keV)" />
                  <LegendDot color="#fb923c" label="High (20-50 keV)" />
                  <LegendDot color="#f87171" label="V. High (50-150 keV)" />
                </div>
                <div style={{ height: 224 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={energyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <XAxis dataKey="time" ticks={timeTicks} interval={0} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={{ stroke: "#1e293b" }} tickLine={false} />
                      <YAxis
                        scale="log"
                        domain={[0.1, 100000]}
                        ticks={[0.1, 1, 10, 100, 1000, 10000, 100000]}
                        tickFormatter={expTick}
                        tick={{ fill: "#64748b", fontSize: 10 }}
                        axisLine={{ stroke: "#1e293b" }}
                        tickLine={false}
                      />
                      <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", fontSize: 12 }} labelStyle={{ color: "#cbd5e1" }} />
                      <ReferenceLine x="12:22" stroke="#475569" strokeDasharray="3 3" label={{ value: "Now", position: "top", fill: "#94a3b8", fontSize: 11 }} />
                      <Area type="monotone" dataKey="low" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.15} strokeWidth={1.5} isAnimationActive={false} />
                      <Area type="monotone" dataKey="medium" stroke="#34d399" fill="#34d399" fillOpacity={0.15} strokeWidth={1.5} isAnimationActive={false} />
                      <Area type="monotone" dataKey="high" stroke="#fb923c" fill="#fb923c" fillOpacity={0.15} strokeWidth={1.5} isAnimationActive={false} />
                      <Area type="monotone" dataKey="vhigh" stroke="#f87171" fill="#f87171" fillOpacity={0.15} strokeWidth={1.5} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardShell>
            </div>

            {/* right: flare class forecast only */}
            <CardShell>
              <CardTitle title="Flare Class Forecast" />
              <div className="flex items-center gap-4">
                <ForecastDonut percent={71} label="C2.4" color="#fb923c" />
                <div className="flex-1 space-y-0.5">
                  <InfoRow label="Predicted Class" value="C2.4" color="#fbbf24" />
                  <InfoRow label="Confidence" value="71%" />
                  <InfoRow label="Lead Time" value="~12 min" />
                  <InfoRow label="Predicted Peak Time" value="12:34 IST ± 6 min" />
                  <InfoRow label="Forecast Window" value="12:22 – 13:22 IST" />
                </div>
              </div>

              <p className="font-semibold text-slate-200" style={{ fontSize: 12.5, margin: "16px 0 8px" }}>
                Class Probabilities
              </p>
              <ProbBar label="X-Class" percent={6} color="#ef4444" />
              <ProbBar label="M-Class" percent={23} color="#fb7185" />
              <ProbBar label="C-Class" percent={71} color="#fbbf24" />
              <ProbBar label="B-Class" percent={0} color="#34d399" />
              <ProbBar label="A-Class" percent={0} color="#60a5fa" />
            </CardShell>
          </div>

          {/* ----------------------- bottom row (4 cards) ----------------------- */}
          <div className="sg-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <CardShell>
              <CardTitle title="Hardening Trend" />
              <HardeningGauge value={0.78} />
              <p className="text-center font-bold text-orange-400" style={{ fontSize: 18 }}>
                Rising Fast
              </p>
              <p className="text-center text-slate-500" style={{ fontSize: 12, marginTop: 4 }}>
                Hardening is increasing rapidly. High likelihood of stronger flare.
              </p>
            </CardShell>

            <CardShell>
              <CardTitle title="Key Indicators Trend (Last 30 min)" />
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500" style={{ fontSize: 11 }}>
                    <th className="pb-2 font-normal">Parameter</th>
                    <th className="pb-2 font-normal">Current</th>
                    <th className="pb-2 font-normal">10 min ago</th>
                    <th className="pb-2 font-normal text-right">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {keyIndicators.map((k) => (
                    <tr key={k.p} className="border-t border-slate-800">
                      <td className="py-2 text-slate-200" style={{ fontSize: 11.5 }}>
                        {k.p}
                      </td>
                      <td className="py-2 text-slate-200" style={{ fontSize: 11.5 }}>
                        {k.cur}
                      </td>
                      <td className="py-2 text-slate-500" style={{ fontSize: 11.5 }}>
                        {k.prev}
                      </td>
                      <td className="py-2 text-right">
                        {k.up ? (
                          <ArrowUp className="ml-auto h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <ArrowDown className="ml-auto h-3.5 w-3.5 text-red-400" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardShell>

            <CardShell>
              <CardTitle title="Top Contributing Features" />
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={features} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                    <XAxis type="number" domain={[0, 0.4]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={{ stroke: "#1e293b" }} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#94a3b8", fontSize: 10.5 }} axisLine={{ stroke: "#1e293b" }} tickLine={false} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} isAnimationActive={false} barSize={12}>
                      <LabelList dataKey="value" position="right" fill="#cbd5e1" fontSize={10.5} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-slate-500" style={{ fontSize: 11, marginTop: 4 }}>
                Importance Score
              </p>
            </CardShell>

            <CardShell>
              <CardTitle title="Latest Forecasts" />
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500" style={{ fontSize: 11 }}>
                    <th className="pb-2 font-normal">Time</th>
                    <th className="pb-2 font-normal">Class</th>
                    <th className="pb-2 font-normal">Prob.</th>
                    <th className="pb-2 font-normal text-right">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {latestForecasts.map((f) => (
                    <tr key={f.time} className="border-t border-slate-800">
                      <td className="py-2 text-slate-200" style={{ fontSize: 11.5 }}>
                        {f.time}
                      </td>
                      <td className="py-2 font-semibold" style={{ fontSize: 11.5, color: f.tone }}>
                        {f.cls}
                      </td>
                      <td className="py-2 text-slate-200" style={{ fontSize: 11.5 }}>
                        {f.prob}%
                      </td>
                      <td className="py-2 text-right">
                        <ArrowUp className="ml-auto h-3.5 w-3.5 text-emerald-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => toast("Exporting report...", "success")} className="font-medium text-blue-400 hover:underline" style={{ fontSize: 12, marginTop: 10 }}>
                View Full Forecast History →
              </button>
            </CardShell>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-2 flex items-center justify-between border-t border-slate-800 px-8 py-3 text-slate-500" style={{ fontSize: 12 }}>
          <span className="flex items-center gap-1.5">
            <Info className="h-3 w-3" />
            Forecasts are generated every 60 seconds using real-time SoLEXS &amp; HEL1OS data and the Flare Genome model.
          </span>
          <span>All times in IST</span>
        </footer>
      </div>
    </div>
  );
}