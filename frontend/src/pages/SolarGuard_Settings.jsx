import React, { useState } from "react";
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
  Monitor,
  RefreshCw,
  Wifi,
  Globe,
  Download,
  AlertTriangle,
  ChevronDown,
  Calendar,
  Clock,
  Radio,
  Lock,
  FolderOpen,
  RotateCcw,
} from "lucide-react";

/* ----------------------------- small controls ---------------------------- */

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? "bg-emerald-500" : "bg-slate-700"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 py-[7px]">
      <span className="text-[12.5px] text-slate-400">{label}</span>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SelectControl({ value, options, width = "w-36" }) {
  const list = options.includes(value) ? options : [value, ...options];
  return (
    <div className={`relative ${width}`}>
      <select
        defaultValue={value}
        className="w-full appearance-none rounded-md border border-slate-700 bg-slate-950/70 py-1.5 pl-3 pr-7 text-[12.5px] text-slate-200 focus:border-blue-500 focus:outline-none"
      >
        {list.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
    </div>
  );
}

function NumberField({ value, suffix, width = "w-24" }) {
  return (
    <div
      className={`flex items-center ${width} overflow-hidden rounded-md border border-slate-700 bg-slate-950/70`}
    >
      <input
        type="text"
        defaultValue={value}
        className="w-full bg-transparent px-3 py-1.5 text-[12.5px] text-slate-200 focus:outline-none"
      />
      {suffix && <span className="pr-3 text-[11.5px] text-slate-500">{suffix}</span>}
    </div>
  );
}

function Slider({ defaultValue, min = 0, max = 1, step = 0.01 }) {
  return (
    <input
      type="range"
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      style={{ accentColor: "#3b82f6" }}
      className="h-1.5 w-28 cursor-pointer"
    />
  );
}

function CardHeader({ icon: Icon, title, color }) {
  return (
    <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-3">
      <h3 className="text-[14.5px] font-semibold text-slate-100">{title}</h3>
      <Icon className={`h-4 w-4 ${color}`} />
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/40 p-4 ${className}`}>
      {children}
    </div>
  );
}

function NavItem({ icon: Icon, label, active }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] cursor-pointer transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
  );
}

function TabItem({ label, active }) {
  return (
    <button
      className={`relative px-1 pb-3 text-[13.5px] font-medium transition-colors ${
        active ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-blue-500" />
      )}
    </button>
  );
}

const PALETTE = ["#3b82f6", "#22d3ee", "#22c55e", "#eab308", "#f97316", "#ef4444", "#a855f7"];

/* --------------------------------- screen -------------------------------- */

export default function SolarGuardSettings() {
  const [activeColor, setActiveColor] = useState(PALETTE[0]);

  return (
    <div
      className="flex h-screen w-full bg-slate-950 text-slate-200"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* ---------------------------- Sidebar ---------------------------- */}
      <aside className="flex w-60 flex-shrink-0 flex-col border-r border-slate-800 bg-slate-950 overflow-y-auto">
        <div className="flex items-start gap-3 px-5 pt-6 pb-5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg shadow-orange-500/20">
            <Sun className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold leading-tight text-white">SolarGuard</h1>
            <p className="mt-0.5 text-[10.5px] leading-tight text-slate-500">
              Solar Flare Forecasting &amp; Nowcasting System
            </p>
            <p className="mt-1 text-[10.5px] font-medium text-emerald-400">
              Aditya-L1 (SoLEXS + HEL1OS)
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          <NavItem icon={LayoutDashboard} label="Dashboard" />
          <NavItem icon={Activity} label="Light Curves" />
          <NavItem icon={TrendingUp} label="Hardening & Forecast" />
          <NavItem icon={Dna} label="Flare Genome" />
          <NavItem icon={Database} label="Solar Memory DB" />
          <NavItem icon={Bell} label="Alerts" />
          <NavItem icon={FileText} label="Reports" />
          <NavItem icon={SettingsIcon} label="Settings" active />
          <NavItem icon={Info} label="About" />
        </nav>

        <div className="mx-3 mb-4 space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
          <div>
            <p className="text-[10.5px] text-slate-500">System Status</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[12.5px] font-medium text-emerald-400">Normal</span>
            </div>
          </div>
          <div>
            <p className="text-[10.5px] text-slate-500">Data Source</p>
            <p className="mt-0.5 text-[12px] font-medium text-blue-400">
              Aditya-L1 (SoLEXS + HEL1OS)
            </p>
          </div>
          <div>
            <p className="text-[10.5px] text-slate-500">Last Updated</p>
            <p className="mt-0.5 text-[12px] text-slate-300">2024-09-02 12:45:30 IST</p>
          </div>
          <button className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-700 py-1.5 text-[12px] text-slate-300 hover:bg-slate-800">
            <RefreshCw className="h-3.5 w-3.5" />
            Check for Updates
          </button>
          <p className="text-center text-[10.5px] text-slate-600">v2.1.0</p>
        </div>
      </aside>

      {/* ----------------------------- Main ------------------------------ */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Header */}
        <header className="flex items-start justify-between px-8 pt-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Configure system preferences, data sources, alerts and model parameters
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-[13px] text-slate-300">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              2024-09-02
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-[13px] text-slate-300">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              12:45:30 IST
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[13px] font-semibold text-emerald-400">
              <Radio className="h-3.5 w-3.5" />
              LIVE
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="mt-5 flex items-center justify-between border-b border-slate-800 px-8">
          <div className="flex gap-7">
            <TabItem label="General" active />
            <TabItem label="Data & Sources" />
            <TabItem label="Models & Parameters" />
            <TabItem label="Alerts & Notifications" />
            <TabItem label="Visualization" />
            <TabItem label="System" />
          </div>
          <button className="mb-2 flex items-center gap-2 rounded-md border border-slate-700 px-3 py-1.5 text-[12.5px] text-slate-300 hover:bg-slate-800">
            <RotateCcw className="h-3.5 w-3.5" />
            Restore Defaults
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 px-8 py-5">
          {/* Row 1 */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader icon={Monitor} title="Application Preferences" color="text-slate-400" />
              <Row label="Theme">
                <SelectControl value="Dark" options={["Light"]} />
              </Row>
              <Row label="Language">
                <SelectControl value="English" options={["Hindi"]} />
              </Row>
              <Row label="Time Format">
                <SelectControl value="24 Hour" options={["12 Hour"]} />
              </Row>
              <Row label="Timezone">
                <SelectControl value="Asia/Kolkata (IST)" options={["UTC"]} />
              </Row>
              <Row label="Date Format">
                <SelectControl value="YYYY-MM-DD" options={["DD-MM-YYYY"]} />
              </Row>
              <Row label="Refresh Interval">
                <SelectControl value="10 sec" options={["30 sec", "60 sec"]} />
              </Row>
              <Row label="Sound Notifications">
                <Toggle checked={true} onChange={() => {}} />
              </Row>
              <Row label="Compact Mode">
                <Toggle checked={false} onChange={() => {}} />
              </Row>
            </Card>

            <Card>
              <CardHeader icon={TrendingUp} title="Display & Visualization" color="text-blue-400" />
              <Row label="Default Dashboard View">
                <SelectControl value="Overview" options={["Detailed"]} />
              </Row>
              <Row label="Default Time Range">
                <SelectControl value="Last 2 Hours" options={["Last 6 Hours"]} />
              </Row>
              <Row label="Auto Refresh">
                <Toggle checked={true} onChange={() => {}} />
              </Row>
              <Row label="Show Data Points">
                <Toggle checked={true} onChange={() => {}} />
              </Row>
              <Row label="Log Scale for Light Curves">
                <Toggle checked={true} onChange={() => {}} />
              </Row>
              <Row label="Show Background Level">
                <Toggle checked={true} onChange={() => {}} />
              </Row>
              <div className="pt-2">
                <p className="mb-2 text-[12.5px] text-slate-400">Color Palette</p>
                <div className="flex gap-2.5">
                  {PALETTE.map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveColor(c)}
                      style={{ backgroundColor: c }}
                      className={`h-5 w-5 rounded-full transition ${
                        activeColor === c ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900" : ""
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader icon={Bell} title="Alerts & Notifications" color="text-amber-400" />
              <Row label="Enable Alerts">
                <Toggle checked={true} onChange={() => {}} />
              </Row>
              <Row label="Enable Email Alerts">
                <Toggle checked={true} onChange={() => {}} />
              </Row>
              <Row label="Enable Desktop Notifications">
                <Toggle checked={true} onChange={() => {}} />
              </Row>
              <Row label="Enable Sound Alerts">
                <Toggle checked={true} onChange={() => {}} />
              </Row>
              <Row label="Alert Cooldown Period">
                <SelectControl value="5 min" options={["10 min"]} width="w-24" />
              </Row>
              <Row label="Minimum Flare Class to Alert">
                <SelectControl value="B-Class" options={["C-Class"]} width="w-24" />
              </Row>
              <Row label="Alert Lead Time Threshold">
                <SelectControl value="5 min" options={["10 min"]} width="w-24" />
              </Row>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[12.5px] text-slate-400">Escalate to High if Prob. &gt;</span>
                <div className="flex items-center gap-2">
                  <Slider defaultValue={0.7} />
                  <span className="text-[12.5px] text-slate-300">70%</span>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader icon={AlertTriangle} title="Thresholds & Limits" color="text-orange-400" />
              <Row
                label={
                  <span className="flex items-center gap-1">
                    Spectral Hardening Threshold <Info className="h-3 w-3 text-slate-500" />
                  </span>
                }
              >
                <NumberField value="1.000" />
              </Row>
              <Row label="Forecast Probability (Watch)">
                <NumberField value="30" suffix="%" />
              </Row>
              <Row label="Forecast Probability (Warning)">
                <NumberField value="60" suffix="%" />
              </Row>
              <Row label="Forecast Probability (Critical)">
                <NumberField value="80" suffix="%" />
              </Row>
              <Row label="Anomaly Score Threshold">
                <NumberField value="0.20" />
              </Row>
              <Row label="Max Lead Time (min)">
                <NumberField value="60" suffix="min" />
              </Row>
              <Row label="Min Data Points Required">
                <NumberField value="100" />
              </Row>
            </Card>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader icon={Radio} title="Data & Sources" color="text-cyan-400" />
              <Row label="Primary Data Source">
                <SelectControl value="Aditya-L1" options={[]} />
              </Row>
              <Row label="SoLEXS Instrument">
                <SelectControl value="Active" options={["Inactive"]} />
              </Row>
              <Row label="HEL1OS Instrument">
                <SelectControl value="Active" options={["Inactive"]} />
              </Row>
              <Row label="Data Latency Tolerance">
                <SelectControl value="5 sec" options={["10 sec"]} />
              </Row>
              <Row label="Data Quality Check">
                <Toggle checked={true} onChange={() => {}} />
              </Row>
              <Row label="Backup Data Source">
                <SelectControl value="None" options={[]} />
              </Row>
              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-blue-600 py-1.5 text-[12.5px] font-medium text-blue-400 hover:bg-blue-500/10">
                <Wifi className="h-3.5 w-3.5" />
                Test Connection
              </button>
            </Card>

            <Card>
              <CardHeader icon={Globe} title="Model & AI Settings" color="text-violet-400" />
              <Row label="Active Model">
                <SelectControl value="Flare Genome v2.1" options={[]} width="w-40" />
              </Row>
              <div className="flex items-center justify-between py-[7px]">
                <span className="text-[12.5px] text-slate-400">Model Confidence Threshold</span>
                <div className="flex items-center gap-2">
                  <Slider defaultValue={0.7} />
                  <span className="text-[12.5px] text-slate-300">0.70</span>
                </div>
              </div>
              <Row label="Enable Anomaly Detection">
                <Toggle checked={true} onChange={() => {}} />
              </Row>
              <Row label="Enable Transfer Learning">
                <Toggle checked={true} onChange={() => {}} />
              </Row>
              <Row label="Auto Model Update">
                <Toggle checked={false} onChange={() => {}} />
              </Row>
              <Row label="Model Retrain Frequency">
                <SelectControl value="Weekly" options={["Monthly"]} />
              </Row>
              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-violet-600 py-1.5 text-[12.5px] font-medium text-violet-400 hover:bg-violet-500/10">
                <Lock className="h-3.5 w-3.5" />
                Retrain Now
              </button>
            </Card>

            <Card>
              <CardHeader icon={Database} title="Solar Memory DB Settings" color="text-blue-400" />
              <Row label="Auto Store Events">
                <Toggle checked={true} onChange={() => {}} />
              </Row>
              <div className="flex items-center justify-between py-[7px]">
                <span className="text-[12.5px] text-slate-400">Min Similarity Score to Store</span>
                <div className="flex items-center gap-2">
                  <Slider defaultValue={0.6} />
                  <span className="text-[12.5px] text-slate-300">0.60</span>
                </div>
              </div>
              <Row label="Max Database Size">
                <SelectControl value="Unlimited" options={[]} />
              </Row>
              <Row label="Auto Cleanup Old Events">
                <Toggle checked={true} onChange={() => {}} />
              </Row>
              <Row label="Events Older Than">
                <SelectControl value="5 Years" options={["1 Year"]} />
              </Row>
              <Row label="Backup Frequency">
                <SelectControl value="Daily" options={["Weekly"]} />
              </Row>
              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-violet-600 py-1.5 text-[12.5px] font-medium text-violet-400 hover:bg-violet-500/10">
                <Database className="h-3.5 w-3.5" />
                Backup Now
              </button>
            </Card>

            <Card>
              <CardHeader icon={Download} title="Export & Data Management" color="text-emerald-400" />
              <Row label="Default Export Format">
                <SelectControl value="CSV" options={["JSON"]} />
              </Row>
              <Row label="Include Plots in Reports">
                <Toggle checked={true} onChange={() => {}} />
              </Row>
              <Row label="Compress Exports">
                <Toggle checked={true} onChange={() => {}} />
              </Row>
              <Row label="Auto Export Reports">
                <SelectControl value="Weekly" options={["Monthly"]} />
              </Row>
              <Row label="Export Destination">
                <SelectControl value="Local" options={["Cloud"]} />
              </Row>
              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-blue-600 py-1.5 text-[12.5px] font-medium text-blue-400 hover:bg-blue-500/10">
                <FolderOpen className="h-3.5 w-3.5" />
                Open Export Folder
              </button>
            </Card>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-2">
              <div className="mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-400" />
                <h3 className="text-[14.5px] font-semibold text-slate-100">System Information</h3>
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <p className="text-[10.5px] text-slate-500">Application Version</p>
                  <p className="mt-1 text-[13.5px] font-medium text-slate-200">2.1.0</p>
                </div>
                <div>
                  <p className="text-[10.5px] text-slate-500">Build Date</p>
                  <p className="mt-1 text-[13.5px] font-medium text-slate-200">2024-08-30</p>
                </div>
                <div>
                  <p className="text-[10.5px] text-slate-500">Data Source</p>
                  <p className="mt-1 text-[13.5px] font-medium text-blue-400">Aditya-L1</p>
                </div>
                <div>
                  <p className="text-[10.5px] text-slate-500">Instruments</p>
                  <p className="mt-1 text-[13.5px] font-medium text-blue-400">SoLEXS, HEL1OS</p>
                </div>
                <div>
                  <p className="text-[10.5px] text-slate-500">Status</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[13.5px] font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    All Systems Operational
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-red-900/50 bg-red-950/10">
              <h3 className="text-[14.5px] font-semibold text-red-400">Danger Zone</h3>
              <p className="mt-1 text-[12px] text-slate-500">
                These actions are irreversible. Please proceed with caution.
              </p>
              <div className="mt-4 flex gap-3">
                <button className="flex-1 rounded-md border border-orange-600 py-1.5 text-[12.5px] font-medium text-orange-400 hover:bg-orange-500/10">
                  Clear All Cache
                </button>
                <button className="flex-1 rounded-md border border-red-600 py-1.5 text-[12.5px] font-medium text-red-400 hover:bg-red-500/10">
                  Reset All Settings
                </button>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-2 flex items-center justify-between border-t border-slate-800 px-8 py-3 text-[12px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Info className="h-3 w-3" /> All times in IST
          </span>
          <span>SolarGuard © 2025 | Built for ISRO Hackathon 2025</span>
          <span className="flex items-center gap-1.5">
            <Info className="h-3 w-3" /> All times in IST
          </span>
        </footer>
      </div>
    </div>
  );
}