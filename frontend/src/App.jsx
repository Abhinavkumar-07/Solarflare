import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SolarGuardDashboard from "./pages/SolarGuard_Dashboard";
import SolarGuardLightCurves from "./pages/SolarGuard_LightCurves";
import SolarGuardHardening from "./pages/SolarGuard_HardeningForecast";
import SolarGuardGenome from "./pages/SolarGuard_FlareGenome";
import SolarGuardMemoryDB from "./pages/SolarGuard_SolarMemoryDB";
import SolarGuardAlerts from "./pages/SolarGuard_Alerts";
import SolarGuardReports from "./pages/SolarGuard_Reports";
import SolarGuardSettings from "./pages/SolarGuard_Settings";
import SolarGuardAbout from "./pages/SolarGuard_About";

import { ToastContainer } from "./components/Toast";

export default function App() {
  // Load theme on startup
  try {
    const saved = localStorage.getItem("sg_settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.theme) {
        document.documentElement.setAttribute("data-theme", parsed.theme);
      }
    }
  } catch (e) {}

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SolarGuardDashboard />} />
        <Route path="/light-curves" element={<SolarGuardLightCurves />} />
        <Route path="/hardening" element={<SolarGuardHardening />} />
        <Route path="/genome" element={<SolarGuardGenome />} />
        <Route path="/memory-db" element={<SolarGuardMemoryDB />} />
        <Route path="/alerts" element={<SolarGuardAlerts />} />
        <Route path="/reports" element={<SolarGuardReports />} />
        <Route path="/settings" element={<SolarGuardSettings />} />
        <Route path="/about" element={<SolarGuardAbout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}