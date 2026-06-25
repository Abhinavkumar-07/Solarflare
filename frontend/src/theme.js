// ── SolarGuard Shared Design Tokens ────────────────────────────────────────
// Single source of truth for colours, fonts, and spacing.
// Import this in every page: import { COLORS, FONT } from "../theme";

export const COLORS = {
  // Backgrounds
  bg:            "var(--sg-bg)",
  panel:         "var(--sg-panel)",
  panelAlt:      "var(--sg-panel-alt)",
  panelBorder:   "var(--sg-panel-border)",
  sidebar:       "var(--sg-sidebar)",

  // Navigation
  navActive:     "var(--sg-nav-active)",

  // Text
  textPrimary:   "var(--sg-text-primary)",
  textSecondary: "var(--sg-text-secondary)",
  textMuted:     "var(--sg-text-muted)",
  textWhite:     "#ffffff",

  // Accent palette (consistent across all pages)
  accentBlue:    "#38bdf8",
  accentGreen:   "#22d97a",
  accentOrange:  "#fb923c",
  accentPurple:  "#c084fc",
  accentTeal:    "#2dd4bf",
  accentYellow:  "#facc15",
  accentRed:     "#f87171",
  accentCyan:    "#22d3ee",

  // Grid / chart
  gridLine:      "var(--sg-grid-line)",

  // ── Backward-compat aliases (for pages using old C.xxx keys) ──────────────
  // These allow SolarMemoryDB, Reports, About, etc. to work without full refactor
  bgCard:    "var(--sg-panel)",
  bgInput:   "var(--sg-bg)",
  bgSidebar: "var(--sg-sidebar)",
  bgDarkest: "var(--sg-bg)",
  bgMain:    "var(--sg-bg)",
  border:    "var(--sg-panel-border)",
  textSec:   "var(--sg-text-secondary)",
  // legacy accent names
  blue:      "#38bdf8",   // == accentBlue
  green:     "#22d97a",   // == accentGreen
  orange:    "#fb923c",   // == accentOrange
  purple:    "#c084fc",   // == accentPurple
  teal:      "#2dd4bf",   // == accentTeal
  yellow:    "#facc15",   // == accentYellow
  red:       "#f87171",   // == accentRed
  cyan:      "#22d3ee",   // == accentCyan
};

export const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// Common layout wrapper styles
export const PAGE_STYLE = {
  display:     "flex",
  minHeight:   "100vh",
  background:  COLORS.bg,
  color:       COLORS.textPrimary,
  fontFamily:  FONT,
  WebkitFontSmoothing: "antialiased",
  overflowX:   "hidden",
};

export const MAIN_STYLE = {
  flex:            1,
  minWidth:        0,
  display:         "flex",
  flexDirection:   "column",
  overflowY:       "auto",
  overflowX:       "hidden",
};
