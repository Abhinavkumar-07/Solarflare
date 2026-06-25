import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Activity, TrendingUp, Dna, Database,
  Bell, FileText, Settings, Info, Sun, Menu, X,
} from "lucide-react";
import { COLORS, FONT } from "../theme";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",           path: "/" },
  { icon: Activity,        label: "Light Curves",         path: "/light-curves" },
  { icon: TrendingUp,      label: "Hardening & Forecast", path: "/hardening" },
  { icon: Dna,             label: "Flare Genome",         path: "/genome" },
  { icon: Database,        label: "Solar Memory DB",      path: "/memory-db" },
  { icon: Bell,            label: "Alerts",               path: "/alerts" },
  { icon: FileText,        label: "Reports",              path: "/reports" },
  { icon: Settings,        label: "Settings",             path: "/settings" },
  { icon: Info,            label: "About",                path: "/about" },
];

/** Unified sidebar — used by every page. */
export default function Sidebar({ activePage }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const sidebarContent = (
    <aside
      style={{
        width:          236,
        minWidth:       236,
        flexShrink:     0,
        display:        "flex",
        flexDirection:  "column",
        background:     COLORS.sidebar,
        borderRight:    `1px solid ${COLORS.panelBorder}`,
        fontFamily:     FONT,
        overflowY:      "auto",
        overflowX:      "hidden",
        position:       "fixed",
        top:            0,
        left:           0,
        height:         "100vh",
        zIndex:         200,
        transform:      isMobile ? (open ? "translateX(0)" : "translateX(-100%)") : "none",
        transition:     "transform 0.3s ease",
      }}
    >
      {/* ── Logo / brand ── */}
      <div style={{ padding: "18px 16px 10px", borderBottom: `1px solid ${COLORS.panelBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: "linear-gradient(135deg, #fbbf24, #f97316)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Sun size={20} color="#1a1206" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>SolarGuard</div>
            <div style={{ fontSize: 10.5, color: COLORS.textSecondary, marginTop: 2, lineHeight: 1.4 }}>
              Solar Flare Forecasting & Nowcasting
            </div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: COLORS.accentGreen, fontWeight: 600, marginTop: 8 }}>
          Aditya-L1 SoLEXS + HEL1OS
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ padding: "10px 10px", display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          // Prefer path matching; fall back to activePage label for legacy pages
          const isActive = activePage
            ? item.label === activePage
            : (item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path));
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                display:     "flex",
                alignItems:  "center",
                gap:         10,
                padding:     "9px 12px",
                borderRadius: 8,
                border:      "none",
                background:  isActive ? COLORS.navActive : "transparent",
                color:       isActive ? "#fff" : COLORS.textSecondary,
                fontSize:    13,
                fontWeight:  isActive ? 600 : 500,
                cursor:      "pointer",
                textAlign:   "left",
                width:       "100%",
                fontFamily:  FONT,
                transition:  "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "#141d33";
                  e.currentTarget.style.color = COLORS.textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = COLORS.textSecondary;
                }
              }}
            >
              <item.icon size={16} strokeWidth={2} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* ── Footer info box ── */}
      <div
        style={{
          margin: "0 10px 16px",
          background: "#0f1d18",
          border: `1px solid ${COLORS.accentGreen}33`,
          borderRadius: 10,
          padding: "12px 14px",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.accentGreen, marginBottom: 6 }}>
          About SolarGuard
        </div>
        <div style={{ fontSize: 10.5, color: COLORS.textSecondary, lineHeight: 1.6, marginBottom: 8 }}>
          AI-powered nowcasting & forecasting of solar flares using spectral hardening, flare genome & similarity search.
        </div>
        <div style={{ fontSize: 10.5, color: COLORS.accentGreen, fontWeight: 600 }}>
          ISRO Hackathon 2025
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Hamburger button — only visible on mobile */}
      {isMobile && (
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            position: "fixed",
            top: 14,
            left: 14,
            zIndex: 300,
            background: COLORS.panel,
            border: `1px solid ${COLORS.panelBorder}`,
            borderRadius: 8,
            color: COLORS.textPrimary,
            width: 36,
            height: 36,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Toggle navigation"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      )}

      {/* Overlay backdrop on mobile */}
      {isMobile && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 190,
          }}
        />
      )}

      {sidebarContent}

      {/* Desktop spacer: reserves sidebar width in the flex layout */}
      {!isMobile && (
        <div style={{ width: 236, minWidth: 236, flexShrink: 0 }} aria-hidden="true" />
      )}
    </>
  );
}