import React, { useState, useEffect } from "react";
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

function SelectControl({ value, onChange, options, width = "w-36" }) {
  const list = options.includes(value) ? options : [value, ...options];
  return (
    <div className={`relative ${width}`}>
      <select
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-full appearance-none rounded-md border border-slate-700 bg-[#0a0e1a]/70 py-1.5 pl-3 pr-7 text-[12.5px] text-slate-200 focus:border-blue-500 focus:outline-none"
      >
        {list.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
    </div>
  );
}

function NumberField({ value, onChange, suffix, width = "w-24" }) {
  return (
    <div
      className={`flex items-center ${width} overflow-hidden rounded-md border border-slate-700 bg-[#0a0e1a]/70`}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-full bg-transparent px-3 py-1.5 text-[12.5px] text-slate-200 focus:outline-none"
      />
      {suffix && <span className="pr-3 text-[11.5px] text-slate-500">{suffix}</span>}
    </div>
  );
}

function Slider({ value, onChange, min = 0, max = 1, step = 0.01 }) {
  return (
    <input
      type="range"
      value={value}
      onChange={(e) => onChange && onChange(parseFloat(e.target.value))}
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

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
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

function TabItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
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

const defaultSettings = {
    theme: "Dark",
    language: "English",
    timeFormat: "24 Hour",
    timezone: "Asia/Kolkata (IST)",
    dateFormat: "YYYY-MM-DD",
    refreshInterval: "10 sec",
    soundNotifications: true,
    compactMode: false,
    defaultDashboardView: "Overview",
    defaultTimeRange: "Last 2 Hours",
    autoRefresh: true,
    showDataPoints: true,
    logScaleForLightCurves: true,
    showBackgroundLevel: true,
    enableAlerts: true,
    enableEmailAlerts: true,
    enableDesktopNotifications: true,
    enableSoundAlerts: true,
    alertCooldownPeriod: "5 min",
    minimumFlareClassToAlert: "B-Class",
    alertLeadTimeThreshold: "5 min",
    escalateToHighIfProb: 0.70,
    spectralHardeningThreshold: "1.000",
    forecastProbabilityWatch: "30",
    forecastProbabilityWarning: "60",
    forecastProbabilityCritical: "80",
    anomalyScoreThreshold: "0.20",
    maxLeadTimeMin: "60",
    minDataPointsRequired: "100",
    primaryDataSource: "Aditya-L1",
    solexsInstrument: "Active",
    heliosInstrument: "Active",
    dataLatencyTolerance: "5 sec",
    dataQualityCheck: true,
    backupDataSource: "None",
    activeModel: "Flare Genome v2.1",
    modelConfidenceThreshold: 0.70,
    enableAnomalyDetection: true,
    enableTransferLearning: true,
    autoModelUpdate: false,
    modelRetrainFrequency: "Weekly",
    autoStoreEvents: true,
    minSimilarityScoreToStore: 0.60,
    maxDatabaseSize: "Unlimited",
    autoCleanupOldEvents: true,
    eventsOlderThan: "5 Years",
    backupFrequency: "Daily",
    defaultExportFormat: "CSV",
    includePlotsInReports: true,
    compressExports: true,
    autoExportReports: "Weekly",
    exportDestination: "Local"
};

export default function SolarGuardSettings() {
  const navigate = useNavigate();
  const [activeColor, setActiveColor] = useState(PALETTE[0]);

  const [activeTab, setActiveTab] = useState("General");
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("sg_settings");
      if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
    } catch (e) {}
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("sg_settings", JSON.stringify(settings));
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings]);

  const updateSetting = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  const handleAction = (msg) => {
    toast(msg, "success");
  };
  
  const appStyle = { fontFamily: "'Inter', system-ui, sans-serif" };

  return (
    <div
      style={{ display:"flex", minHeight:"100vh", width:"100%", background:"var(--sg-bg)", color:"var(--sg-text-primary)", ...appStyle }}
    >
      {/* ---------------------------- Sidebar ---------------------------- */}
      <Sidebar activePage="Settings" />


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
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-[13px] text-slate-200">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              2024-09-02
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-[13px] text-slate-200">
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
            <TabItem label="General" active={activeTab === "General"} onClick={() => setActiveTab("General")} />
            <TabItem label="Data & Sources" active={activeTab === "Data & Sources"} onClick={() => setActiveTab("Data & Sources")} />
            <TabItem label="Models & Parameters" active={activeTab === "Models & Parameters"} onClick={() => setActiveTab("Models & Parameters")} />
            <TabItem label="Alerts & Notifications" active={activeTab === "Alerts & Notifications"} onClick={() => setActiveTab("Alerts & Notifications")} />
            <TabItem label="Visualization" active={activeTab === "Visualization"} onClick={() => setActiveTab("Visualization")} />
            <TabItem label="System" active={activeTab === "System"} onClick={() => setActiveTab("System")} />
          </div>
          <button
            onClick={() => { setSettings(defaultSettings); toast("Settings restored to defaults", "success"); }}
            className="mb-2 flex items-center gap-2 rounded-md border border-slate-700 px-3 py-1.5 text-[12.5px] text-slate-200 hover:bg-slate-800">
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
<SelectControl value={settings.theme} options={["Light"]}  onChange={v => updateSetting("theme", v)} />
</Row>
              <Row label="Language">
<SelectControl value={settings.language} options={["Hindi"]}  onChange={v => updateSetting("language", v)} />
</Row>
              <Row label="Time Format">
<SelectControl value={settings.timeFormat} options={["12 Hour"]}  onChange={v => updateSetting("timeFormat", v)} />
</Row>
              <Row label="Timezone">
<SelectControl value={settings.timezone} options={["UTC"]}  onChange={v => updateSetting("timezone", v)} />
</Row>
              <Row label="Date Format">
<SelectControl value={settings.dateFormat} options={["DD-MM-YYYY"]}  onChange={v => updateSetting("dateFormat", v)} />
</Row>
              <Row label="Refresh Interval">
<SelectControl value={settings.refreshInterval} options={["30 sec", "60 sec"]}  onChange={v => updateSetting("refreshInterval", v)} />
</Row>
              <Row label="Sound Notifications">
                <Toggle checked={settings.soundNotifications} onChange={v => updateSetting("soundNotifications", v)} />
              </Row>
              <Row label="Compact Mode">
                <Toggle checked={settings.compactMode} onChange={v => updateSetting("compactMode", v)} />
              </Row>
            </Card>

            <Card>
              <CardHeader icon={TrendingUp} title="Display & Visualization" color="text-blue-400" />
              <Row label="Default Dashboard View">
<SelectControl value={settings.defaultDashboardView} options={["Detailed"]}  onChange={v => updateSetting("defaultDashboardView", v)} />
</Row>
              <Row label="Default Time Range">
<SelectControl value={settings.defaultTimeRange} options={["Last 6 Hours"]}  onChange={v => updateSetting("defaultTimeRange", v)} />
</Row>
              <Row label="Auto Refresh">
                <Toggle checked={settings.autoRefresh} onChange={v => updateSetting("autoRefresh", v)} />
              </Row>
              <Row label="Show Data Points">
                <Toggle checked={settings.showDataPoints} onChange={v => updateSetting("showDataPoints", v)} />
              </Row>
              <Row label="Log Scale for Light Curves">
                <Toggle checked={settings.logScaleForLightCurves} onChange={v => updateSetting("logScaleForLightCurves", v)} />
              </Row>
              <Row label="Show Background Level">
                <Toggle checked={settings.showBackgroundLevel} onChange={v => updateSetting("showBackgroundLevel", v)} />
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
                <Toggle checked={settings.enableAlerts} onChange={v => updateSetting("enableAlerts", v)} />
              </Row>
              <Row label="Enable Email Alerts">
                <Toggle checked={settings.enableEmailAlerts} onChange={v => updateSetting("enableEmailAlerts", v)} />
              </Row>
              <Row label="Enable Desktop Notifications">
                <Toggle checked={settings.enableDesktopNotifications} onChange={v => updateSetting("enableDesktopNotifications", v)} />
              </Row>
              <Row label="Enable Sound Alerts">
                <Toggle checked={settings.enableSoundAlerts} onChange={v => updateSetting("enableSoundAlerts", v)} />
              </Row>
              <Row label="Alert Cooldown Period">
<SelectControl value={settings.alertCooldownPeriod} options={["10 min"]} width="w-24"  onChange={v => updateSetting("alertCooldownPeriod", v)} />
</Row>
              <Row label="Minimum Flare Class to Alert">
<SelectControl value={settings.minimumFlareClassToAlert} options={["C-Class"]} width="w-24"  onChange={v => updateSetting("minimumFlareClassToAlert", v)} />
</Row>
              <Row label="Alert Lead Time Threshold">
<SelectControl value={settings.alertLeadTimeThreshold} options={["10 min"]} width="w-24"  onChange={v => updateSetting("alertLeadTimeThreshold", v)} />
</Row>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[12.5px] text-slate-400">Escalate to High if Prob. &gt;</span>
                <div className="flex items-center gap-2">
                  <Slider value={settings.escalateToHighIfProb} onChange={v => updateSetting("escalateToHighIfProb", v)} />
                  <span className="text-[12.5px] text-slate-200">{Math.round(settings.escalateToHighIfProb * 100)}%</span>
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
                <NumberField value={settings.spectralHardeningThreshold} onChange={v => updateSetting("spectralHardeningThreshold", v)} />
              </Row>
              <Row label="Forecast Probability (Watch)">
<NumberField value={settings.forecastProbabilityWatch} suffix="%"  onChange={v => updateSetting("forecastProbabilityWatch", v)} />
</Row>
              <Row label="Forecast Probability (Warning)">
<NumberField value={settings.forecastProbabilityWarning} suffix="%"  onChange={v => updateSetting("forecastProbabilityWarning", v)} />
</Row>
              <Row label="Forecast Probability (Critical)">
<NumberField value={settings.forecastProbabilityCritical} suffix="%"  onChange={v => updateSetting("forecastProbabilityCritical", v)} />
</Row>
              <Row label="Anomaly Score Threshold">
<NumberField value={settings.anomalyScoreThreshold}  onChange={v => updateSetting("anomalyScoreThreshold", v)} />
</Row>
              <Row label="Max Lead Time (min)">
<NumberField value={settings.maxLeadTimeMin} suffix="min"  onChange={v => updateSetting("maxLeadTimeMin", v)} />
</Row>
              <Row label="Min Data Points Required">
<NumberField value={settings.minDataPointsRequired}  onChange={v => updateSetting("minDataPointsRequired", v)} />
</Row>
            </Card>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader icon={Radio} title="Data & Sources" color="text-cyan-400" />
              <Row label="Primary Data Source">
<SelectControl value={settings.primaryDataSource} options={[]}  onChange={v => updateSetting("primaryDataSource", v)} />
</Row>
              <Row label="SoLEXS Instrument">
<SelectControl value={settings.solexsInstrument} options={["Inactive"]}  onChange={v => updateSetting("solexsInstrument", v)} />
</Row>
              <Row label="HEL1OS Instrument">
<SelectControl value={settings.hel1osInstrument} options={["Inactive"]}  onChange={v => updateSetting("hel1osInstrument", v)} />
</Row>
              <Row label="Data Latency Tolerance">
<SelectControl value={settings.dataLatencyTolerance} options={["10 sec"]}  onChange={v => updateSetting("dataLatencyTolerance", v)} />
</Row>
              <Row label="Data Quality Check">
                <Toggle checked={settings.dataQualityCheck} onChange={v => updateSetting("dataQualityCheck", v)} />
              </Row>
              <Row label="Backup Data Source">
<SelectControl value={settings.backupDataSource} options={[]}  onChange={v => updateSetting("backupDataSource", v)} />
</Row>
              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-blue-600 py-1.5 text-[12.5px] font-medium text-blue-400 hover:bg-blue-500/10"
                onClick={() => handleAction("Testing connection to Aditya-L1 data source...")}
              >
                <Wifi className="h-3.5 w-3.5" />
                Test Connection
              </button>
            </Card>

            <Card>
              <CardHeader icon={Globe} title="Model & AI Settings" color="text-violet-400" />
              <Row label="Active Model">
<SelectControl value={settings.activeModel} options={[]} width="w-40"  onChange={v => updateSetting("activeModel", v)} />
</Row>
              <div className="flex items-center justify-between py-[7px]">
                <span className="text-[12.5px] text-slate-400">Model Confidence Threshold</span>
                <div className="flex items-center gap-2">
                  <Slider value={settings.modelConfidenceThreshold} onChange={v => updateSetting("modelConfidenceThreshold", v)} />
                  <span className="text-[12.5px] text-slate-200">{settings.modelConfidenceThreshold.toFixed(2)}</span>
                </div>
              </div>
              <Row label="Enable Anomaly Detection">
                <Toggle checked={settings.enableAnomalyDetection} onChange={v => updateSetting("enableAnomalyDetection", v)} />
              </Row>
              <Row label="Enable Transfer Learning">
                <Toggle checked={settings.enableTransferLearning} onChange={v => updateSetting("enableTransferLearning", v)} />
              </Row>
              <Row label="Auto Model Update">
                <Toggle checked={settings.autoModelUpdate} onChange={v => updateSetting("autoModelUpdate", v)} />
              </Row>
              <Row label="Model Retrain Frequency">
<SelectControl value={settings.modelRetrainFrequency} options={["Monthly"]}  onChange={v => updateSetting("modelRetrainFrequency", v)} />
</Row>
              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-violet-600 py-1.5 text-[12.5px] font-medium text-violet-400 hover:bg-violet-500/10"
                onClick={() => handleAction("Model retrain initiated — check back in a few minutes.")}
              >
                <Lock className="h-3.5 w-3.5" />
                Retrain Now
              </button>
            </Card>

            <Card>
              <CardHeader icon={Database} title="Solar Memory DB Settings" color="text-blue-400" />
              <Row label="Auto Store Events">
                <Toggle checked={settings.autoStoreEvents} onChange={v => updateSetting("autoStoreEvents", v)} />
              </Row>
              <div className="flex items-center justify-between py-[7px]">
                <span className="text-[12.5px] text-slate-400">Min Similarity Score to Store</span>
                <div className="flex items-center gap-2">
                  <Slider value={settings.minSimilarityScoreToStore} onChange={v => updateSetting("minSimilarityScoreToStore", v)} />
                  <span className="text-[12.5px] text-slate-200">{settings.minSimilarityScoreToStore.toFixed(2)}</span>
                </div>
              </div>
              <Row label="Max Database Size">
<SelectControl value={settings.maxDatabaseSize} options={[]}  onChange={v => updateSetting("maxDatabaseSize", v)} />
</Row>
              <Row label="Auto Cleanup Old Events">
                <Toggle checked={settings.autoCleanupOldEvents} onChange={v => updateSetting("autoCleanupOldEvents", v)} />
              </Row>
              <Row label="Events Older Than">
<SelectControl value={settings.eventsOlderThan} options={["1 Year"]}  onChange={v => updateSetting("eventsOlderThan", v)} />
</Row>
              <Row label="Backup Frequency">
<SelectControl value={settings.backupFrequency} options={["Weekly"]}  onChange={v => updateSetting("backupFrequency", v)} />
</Row>
              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-violet-600 py-1.5 text-[12.5px] font-medium text-violet-400 hover:bg-violet-500/10"
                onClick={() => handleAction("Database backup started.")}
              >
                <Database className="h-3.5 w-3.5" />
                Backup Now
              </button>
            </Card>

            <Card>
              <CardHeader icon={Download} title="Export & Data Management" color="text-emerald-400" />
              <Row label="Default Export Format">
<SelectControl value={settings.defaultExportFormat} options={["JSON"]}  onChange={v => updateSetting("defaultExportFormat", v)} />
</Row>
              <Row label="Include Plots in Reports">
                <Toggle checked={settings.includePlotsInReports} onChange={v => updateSetting("includePlotsInReports", v)} />
              </Row>
              <Row label="Compress Exports">
                <Toggle checked={settings.compressExports} onChange={v => updateSetting("compressExports", v)} />
              </Row>
              <Row label="Auto Export Reports">
<SelectControl value={settings.autoExportReports} options={["Monthly"]}  onChange={v => updateSetting("autoExportReports", v)} />
</Row>
              <Row label="Export Destination">
<SelectControl value={settings.exportDestination} options={["Cloud"]}  onChange={v => updateSetting("exportDestination", v)} />
</Row>
              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-blue-600 py-1.5 text-[12.5px] font-medium text-blue-400 hover:bg-blue-500/10"
                onClick={() => handleAction("Opening export folder...")}
              >
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
                <button
                  onClick={() => handleAction("Cache cleared successfully.")}
                  className="flex-1 rounded-md border border-orange-600 py-1.5 text-[12.5px] font-medium text-orange-400 hover:bg-orange-500/10">
                  Clear All Cache
                </button>
                <button
                  onClick={() => { setSettings(defaultSettings); toast("All settings have been reset.", "success"); }}
                  className="flex-1 rounded-md border border-red-600 py-1.5 text-[12.5px] font-medium text-red-400 hover:bg-red-500/10">
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
          <span className="w-[100px]"></span>
        </footer>
      </div>
    </div>
  );
}