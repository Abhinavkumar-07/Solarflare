import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const items = [
    ["Dashboard", "/"],
    ["Light Curves", "/light-curves"],
    ["Hardening & Forecast", "/hardening"],
    ["Flare Genome", "/genome"],
    ["Solar Memory DB", "/memory-db"],
    ["Alerts", "/alerts"],
    ["Reports", "/reports"],
    ["Settings", "/settings"],
    ["About", "/about"],
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">☀️ SolarGuard</h1>
      </div>

      <nav className="px-3">
        {items.map(([label, path]) => (
          <NavLink
            key={path}
            to={path}
            className="block p-3 rounded-lg text-slate-300 hover:bg-slate-800"
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}