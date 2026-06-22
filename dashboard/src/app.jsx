import { BrowserRouter, Routes, Route } from "react-router-dom";

import SolarGuard_Dashboard from "../../frontend/src/pages/SolarGuard_Dashboard";
import SolarGuard_LightCurves from "../../frontend/src/pages/SolarGuard_LightCurves";
import SolarGuard_HardeningForecast from "../../frontend/src/pages/SolarGuard_HardeningForecast";
import SolarGuard_FlareGenome from "../../frontend/src/pages/SolarGuard_FlareGenome";
import SolarGuard_SolarMemoryDB from "../../frontend/src/pages/SolarGuard_SolarMemoryDB";
import SolarGuard_Alerts from "../../frontend/src/pages/SolarGuard_Alerts";
import SolarGuard_Reports from "../../frontend/src/pages/SolarGuard_Reports";
import SolarGuard_Settings from "../../frontend/src/pages/SolarGuard_Settings";
import SolarGuard_About from "../../frontend/src/pages/SolarGuard_About";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SolarGuard_Dashboard />} />
        <Route path="/light-curves" element={<SolarGuard_LightCurves />} />
        <Route path="/hardening" element={<SolarGuard_HardeningForecast />} />
        <Route path="/genome" element={<SolarGuard_FlareGenome />} />
        <Route path="/memory-db" element={<SolarGuard_SolarMemoryDB />} />
        <Route path="/alerts" element={<SolarGuard_Alerts />} />
        <Route path="/reports" element={<SolarGuard_Reports />} />
        <Route path="/settings" element={<SolarGuard_Settings />} />
        <Route path="/about" element={<SolarGuard_About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;