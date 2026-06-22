import React from 'react';

/* ================================================================
   SolarGuard – About Page (High Fidelity)
   A single self-contained React component (JSX).
   ================================================================ */

// ─── Color tokens ───────────────────────────────────────────────
const C = {
  bgDarkest:   '#050810',
  bgSidebar:   '#0a0e1a',
  bgCard:      '#0d1322',
  border:      '#1a233a',
  borderLight: '#263352',
  textPrimary: '#e2e8f0',
  textSec:     '#8892a6',
  textMuted:   '#5a6478',
  textWhite:   '#ffffff',
  cyan:        '#22d3ee',
  blue:        '#3b82f6',
  purple:      '#a855f7',
  green:       '#22c55e',
  yellow:      '#fbbf24',
  orange:      '#f59e0b',
  red:         '#ef4444',
};

const fontSans = "'Inter', system-ui, sans-serif";

// ─── Custom SVG Icons (to match the dual-tone line art perfectly) ───
const IconBrain = ({color}) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 0 7 4.5v15A2.5 2.5 0 0 0 9.5 22h5a2.5 2.5 0 0 0 2.5-2.5v-15A2.5 2.5 0 0 0 14.5 2h-5z"/>
    <path d="M7 4.5A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5"/>
    <path d="M17 4.5A2.5 2.5 0 0 1 19.5 7v10A2.5 2.5 0 0 1 17 19.5"/>
    <path d="M9.5 2v20"/><path d="M14.5 2v20"/><path d="M4.5 12h15"/><path d="M7 8h10"/><path d="M7 16h10"/>
  </svg>
);

const IconDNA = ({color}) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2c-4 5-4 15 0 20"/><path d="M16 2c4 5 4 15 0 20"/><path d="M9 6h6"/><path d="M8 12h8"/><path d="M9 18h6"/>
    <circle cx="9" cy="6" r="1.5" fill={color} opacity="0.5" stroke="none"/><circle cx="15" cy="6" r="1.5" fill={color} opacity="0.5" stroke="none"/>
    <circle cx="8" cy="12" r="1.5" fill={color} opacity="0.5" stroke="none"/><circle cx="16" cy="12" r="1.5" fill={color} opacity="0.5" stroke="none"/>
    <circle cx="9" cy="18" r="1.5" fill={color} opacity="0.5" stroke="none"/><circle cx="15" cy="18" r="1.5" fill={color} opacity="0.5" stroke="none"/>
  </svg>
);

const IconDatabase = ({color}) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    <path d="M3 12v7"/><path d="M21 12v7"/>
  </svg>
);

const IconBell = ({color}) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    <path d="M12 2v2" opacity="0.5"/><path d="M5 4l1 1" opacity="0.5"/><path d="M19 4l-1 1" opacity="0.5"/>
  </svg>
);

const IconSoLEXS = ({color}) => (
  <svg width="40" height="40" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="18" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 2" opacity="0.8"/>
    <text x="20" y="24" fontSize="9" fill={color} fontWeight="700" textAnchor="middle" fontFamily={fontSans}>SoLEXS</text>
  </svg>
);

const IconHEL1OS = ({color}) => (
  <svg width="40" height="40" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="18" fill="none" stroke={color} strokeWidth="1" opacity="0.6"/>
    <circle cx="20" cy="20" r="14" fill="none" stroke={color} strokeWidth="1.5"/>
    <path d="M20 2v4M20 34v4M2 20h4M34 20h4M7.27 7.27l2.83 2.83M29.9 29.9l2.83 2.83M7.27 32.73l2.83-2.83M29.9 10.1l2.83-2.83" stroke={color} strokeWidth="1.5" opacity="0.7"/>
    <text x="20" y="23" fontSize="8" fill={color} fontWeight="700" textAnchor="middle" fontFamily={fontSans}>HEL1OS</text>
  </svg>
);

const IconOrbit = ({color}) => (
  <svg width="40" height="40" viewBox="0 0 40 40">
    <ellipse cx="20" cy="20" rx="18" ry="10" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" transform="rotate(-15 20 20)"/>
    <circle cx="20" cy="20" r="4" fill="#1e3a8a" stroke={color} strokeWidth="1"/>
    <circle cx="8" cy="12" r="3" fill={color}/>
  </svg>
);

// ─── Data ───────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon:'fas fa-th-large',    label:'Dashboard' },
  { icon:'fas fa-chart-line',  label:'Light Curves' },
  { icon:'fas fa-chart-bar',   label:'Hardening & Forecast' },
  { icon:'fas fa-dna',         label:'Flare Genome' },
  { icon:'fas fa-database',    label:'Solar Memory DB' },
  { icon:'fas fa-bell',        label:'Alerts' },
  { icon:'fas fa-file-alt',    label:'Reports' },
  { icon:'fas fa-cog',         label:'Settings' },
  { icon:'fas fa-info-circle', label:'About', active:true },
];

const SYS_HIGHLIGHTS = [
  { icon: 'far fa-clock', text: 'Nowcasting with up to 60 min lead time' },
  { icon: 'fas fa-chart-area', text: 'Spectral hardening using SoLEXS X-ray data' },
  { icon: 'fas fa-microchip', text: 'AI models trained on historical flare events' },
  { icon: 'fas fa-fingerprint', text: 'Flare Genome generation (64-D fingerprint)' },
  { icon: 'fas fa-layer-group', text: 'Similarity search using Solar Memory DB' },
  { icon: 'far fa-bell', text: 'Mission-ready alerts & reports' },
];

const KEY_TECH = [
  { icon: 'fas fa-chart-line', color: C.blue, title: 'Spectral Hardening', desc: 'Physical indicator using Hard/Soft X-ray flux ratio' },
  { icon: 'fas fa-brain', color: C.purple, title: 'Machine Learning', desc: 'LSTM, XGBoost, Autoencoders for prediction & anomaly detection' },
  { icon: 'fas fa-dna', color: C.cyan, title: 'Flare Genome', desc: '64-D fingerprint capturing spectral and temporal characteristics' },
  { icon: 'fas fa-search', color: C.green, title: 'Similarity Search', desc: 'Nearest-neighbor search in high-dimensional genome space' },
];

const DATA_SOURCES = [
  { svg: IconSoLEXS, color: C.green, title: 'SoLEXS', sub: 'Solar Low Energy X-ray Spectrometer\n0.5 - 15 keV X-ray flux\nTime resolution: 1 sec' },
  { svg: IconHEL1OS, color: C.orange, title: 'HEL1OS', sub: 'High Energy L1 Orbiting X-ray Spectrometer\n> 15 keV X-ray flux\nTime resolution: 1 sec' },
  { svg: IconOrbit, color: C.blue, title: 'Aditya-L1 Orbit', sub: 'Halo orbit around L1 point\nL1 Distance: ~1.5 million km' },
];

const SYS_INFO = [
  { label: 'System Name', val: 'SolarGuard' },
  { label: 'Version', val: 'v2.1.0' },
  { label: 'Developed For', val: 'ISRO' },
  { label: 'Mission', val: 'Aditya-L1' },
  { label: 'Primary Instruments', val: 'SoLEXS, HEL1OS' },
  { label: 'Developed By', val: 'Team SolarGuard' },
  { label: 'Release Date', val: 'August 2024' },
  { label: 'License', val: 'ISRO Internal Use' },
];

// ─── Inline-style objects ───────────────────────────────────────
const S = {
  app:         { display:'flex', minHeight:'100vh', fontFamily:fontSans, background:C.bgDarkest, color:C.textPrimary, WebkitFontSmoothing:'antialiased' },
  sidebar:     { width:220, minWidth:220, background:C.bgSidebar, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', height:'100vh', position:'fixed', top:0, left:0, zIndex:100, overflowY:'auto' },
  main:        { flex:1, marginLeft:220, padding:'0 24px 24px', minWidth:0, display:'flex', flexDirection:'column' },
  
  // Header
  header:      { display:'flex', alignItems:'flex-end', justifyContent:'space-between', padding:'20px 0 16px', gap:16, flexWrap:'wrap' },
  pageTitle:   { fontSize:'1.6rem', fontWeight:700, color:C.textWhite, letterSpacing:0, lineHeight:1.2, margin:0 },
  headerRight: { display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' },
  headerCtrl:  { display:'flex', alignItems:'center', gap:8, padding:'8px 14px', background:'transparent', border:`1px solid ${C.borderLight}`, borderRadius:8, fontSize:'.75rem', color:C.textSec },
  liveBadge:   { display:'flex', alignItems:'center', gap:6, padding:'7px 16px', background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.2)', borderRadius:20, fontSize:'.75rem', color:C.green, fontWeight:600 },
  liveDot:     { width:6, height:6, borderRadius:'50%', background:C.green, boxShadow:'0 0 8px rgba(34,197,94,0.6)' },

  // Tabs
  tabsWrap:    { display:'flex', gap:32, borderBottom:`1px solid ${C.border}`, marginBottom:24 },
  tabItem:     (active) => ({ padding:'12px 0', fontSize:'.85rem', color:active?C.cyan:C.textSec, fontWeight:active?600:400, cursor:'pointer', borderBottom:active?`2px solid ${C.cyan}`:'2px solid transparent', transition:'all 0.2s' }),

  // Main Card
  mainCard:    { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden', display:'flex', marginBottom:20, position:'relative', minHeight:'360px' },
  mainCardL:   { flex:1.2, padding:'32px', display:'flex', flexDirection:'column', zIndex:2 },
  mainTitle:   { fontSize:'1.3rem', fontWeight:600, color:'#60a5fa', marginBottom:20, letterSpacing:0.5 },
  mainDesc:    { fontSize:'.85rem', color:C.textPrimary, lineHeight:1.7, marginBottom:32, maxWidth:'580px' },
  fourCardsWrap:{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16, marginTop:'auto' },
  fourCard:    { background:'rgba(0,0,0,0.3)', border:`1px solid rgba(255,255,255,0.06)`, borderRadius:10, padding:'16px 12px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:12, backdropFilter:'blur(4px)' },
  fcTitle:     { fontSize:'.75rem', fontWeight:600, color:C.textWhite },
  fcDesc:      { fontSize:'.65rem', color:C.textSec, lineHeight:1.5 },

  // Main Card Right (Aditya Mission)
  mainCardR:   { flex:0.8, background:`linear-gradient(90deg, rgba(13,19,34,1) 0%, rgba(13,19,34,0.6) 20%, rgba(0,0,0,0.2) 100%)`, position:'relative', padding:'32px', display:'flex', flexDirection:'column', justifyContent:'flex-start', borderLeft:`1px solid rgba(255,255,255,0.03)`, zIndex:2 },
  mcRightTitle:{ fontSize:'1.1rem', fontWeight:600, color:'#60a5fa', marginBottom:12 },
  mcRightDesc: { fontSize:'.8rem', color:C.textPrimary, lineHeight:1.6, marginBottom:24, maxWidth:'300px' },
  mcRightKey:  { fontSize:'.9rem', fontWeight:600, color:C.blue, marginBottom:16 },
  keyObjItem:  { display:'flex', alignItems:'flex-start', gap:10, fontSize:'.8rem', color:C.textPrimary, marginBottom:12, lineHeight:1.5 },

  // Middle Grid (4 columns, custom widths)
  middleGrid:  { display:'grid', gridTemplateColumns:'22% 28% 28% 22%', gap:16, marginBottom:20 },
  panel:       { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, display:'flex', flexDirection:'column' },
  pHdr:        { padding:'16px 20px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid rgba(255,255,255,0.03)` },
  pTitle:      { fontSize:'.9rem', fontWeight:600, color:C.textPrimary },
  pBody:       { padding:'20px', flex:1, display:'flex', flexDirection:'column', gap:18 },
  
  hlItem:      { display:'flex', alignItems:'flex-start', gap:12 },
  hlIcon:      { color:C.purple, fontSize:'.9rem', marginTop:2, width:18, textAlign:'center' },
  hlText:      { fontSize:'.78rem', color:C.textPrimary, lineHeight:1.5 },

  techItem:    { display:'flex', gap:14, alignItems:'flex-start' },
  techIconW:   (col) => ({ width:42, height:42, borderRadius:10, background:`${col}15`, color:col, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0, border:`1px solid ${col}30` }),
  techTitle:   (col) => ({ fontSize:'.8rem', fontWeight:600, color:col, marginBottom:6 }),
  techDesc:    { fontSize:'.7rem', color:C.textSec, lineHeight:1.5 },

  dsItem:      { display:'flex', gap:14, alignItems:'flex-start' },
  dsTitle:     (col) => ({ fontSize:'.8rem', fontWeight:600, color:col, marginBottom:6 }),
  dsSub:       { fontSize:'.7rem', color:C.textSec, lineHeight:1.5, whiteSpace:'pre-line' },

  infoRow:     { display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:`1px solid rgba(255,255,255,0.03)` },
  infoLbl:     { fontSize:'.78rem', color:C.textSec },
  infoVal:     { fontSize:'.78rem', color:C.textPrimary, textAlign:'right' },

  // Bottom Banner
  bottomBanner:{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:'24px 32px', display:'flex', alignItems:'center', gap:40 },
  bbLeft:      { flex:1 },
  bbTitle:     { display:'flex', alignItems:'center', gap:12, fontSize:'1.2rem', fontWeight:600, color:C.green, marginBottom:12 },
  bbDesc:      { fontSize:'.85rem', color:C.textSec, lineHeight:1.6, maxWidth:'600px' },
  bbStats:     { display:'flex', gap:30, alignItems:'center' },
  bbStatWrap:  { display:'flex', alignItems:'center', gap:14, paddingLeft:30, borderLeft:`1px solid rgba(255,255,255,0.06)` },
  bbStatIcon:  (col) => ({ width:48, height:48, borderRadius:'50%', background:`${col}10`, color:col, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', border:`1px solid ${col}30` }),
  bbStatVal:   { fontSize:'1.4rem', fontWeight:700, color:C.textWhite, marginBottom:4, letterSpacing:0.5 },
  bbStatLbl:   { fontSize:'.7rem', color:C.textMuted },
};

export default function SolarAbout() {
  return (
    <div style={S.app}>
      {/* ──── Sidebar ──── */}
      <aside style={S.sidebar}>
        <div style={S.sidebarHdr}>
          <div style={S.logoWrap}>
            <SunLogo />
            <div style={{ display:'flex', flexDirection:'column', minWidth:0 }}>
              <span style={S.logoTitle}>SolarGuard</span>
              <span style={S.logoSub}>Solar Flare Forecasting &amp;<br/>Nowcasting System</span>
              <span style={S.logoVer}>Aditya-L1 (SoLEXS + HEL1OS)</span>
            </div>
          </div>
        </div>
        <nav style={S.navWrap}>
          {NAV_ITEMS.map((n,i) => (
            <button key={i} style={S.navItem(n.active)}>
              <i className={n.icon} style={S.navIcon} />
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div style={S.sysStatusBox}>
          <div>
            <div style={S.sysTitle}>System Status</div>
            <div style={S.sysValGreen}><span style={S.dotGreen}/> Operational</div>
          </div>
          <div>
            <div style={S.sysTitle}>Data Source</div>
            <div style={S.sysValGreen} style={{...S.sysValGreen, color:C.green}}>Aditya-L1 (SoLEXS + HEL1OS)</div>
          </div>
          <div>
            <div style={S.sysTitle}>Last Updated</div>
            <div style={{...S.sysVal, color:C.textSec, fontSize:'.75rem'}}>2024-09-02 12:45:30 IST</div>
          </div>
          <div>
            <div style={S.sysTitle}>Version</div>
            <div style={{...S.sysVal, color:C.textSec, fontSize:'.75rem'}}>v2.1.0</div>
          </div>
        </div>
      </aside>

      {/* ──── Main Content ──── */}
      <main style={S.main}>
        <header style={S.header}>
          <h1 style={S.pageTitle}>About SolarGuard</h1>
          <div style={S.headerRight}>
            <div style={S.headerCtrl}>
              <i className="far fa-calendar-alt"/> 2024-09-02 <i className="fas fa-chevron-down" style={{fontSize:'.6rem'}}/>
            </div>
            <div style={S.headerCtrl}>
              <i className="far fa-clock"/> 12:45:30 IST <i className="fas fa-chevron-down" style={{fontSize:'.6rem'}}/>
            </div>
            <div style={S.liveBadge}><span style={S.liveDot}/><span>LIVE</span></div>
          </div>
        </header>

        <div style={S.tabsWrap}>
          {TABS.map((t,i) => (
            <div key={i} style={S.tabItem(t === 'Overview')}>{t}</div>
          ))}
        </div>

        {/* ── Main Banner Card ── */}
        <div style={S.mainCard}>
          {/* Background Graphic */}
          <div style={{ position:'absolute', top:0, right:0, bottom:0, width:'65%', zIndex:1, overflow:'hidden' }}>
            <SunSpaceGraphic />
          </div>

          <div style={S.mainCardL}>
            <h2 style={S.mainTitle}>Powering Space Weather Intelligence</h2>
            <p style={S.mainDesc}>
              SolarGuard is an AI-powered solar flare forecasting and nowcasting system developed for ISRO using real-time data from Aditya-L1 mission instruments SoLEXS and HEL1OS.<br/><br/>
              It combines physical understanding with advanced machine learning to provide early warnings of solar flares and support space weather preparedness for critical missions and infrastructure.
            </p>
            <div style={S.fourCardsWrap}>
              <div style={S.fourCard}>
                <IconBrain color={C.purple} />
                <div style={S.fcTitle}>AI + Physics Hybrid</div>
                <div style={S.fcDesc}>Combines spectral hardening with deep learning</div>
              </div>
              <div style={S.fourCard}>
                <IconDNA color={C.green} />
                <div style={S.fcTitle}>Flare Genome</div>
                <div style={S.fcDesc}>64-D fingerprint for unique flare identification</div>
              </div>
              <div style={S.fourCard}>
                <IconDatabase color={C.cyan} />
                <div style={S.fcTitle}>Solar Memory DB</div>
                <div style={S.fcDesc}>Historical flare genome database for similarity search</div>
              </div>
              <div style={S.fourCard}>
                <IconBell color={C.orange} />
                <div style={S.fcTitle}>Real-time Alerts</div>
                <div style={S.fcDesc}>Early warnings with lead time estimation (5-60 min)</div>
              </div>
            </div>
          </div>

          <div style={S.mainCardR}>
            <div style={S.mcRightTitle}>Aditya-L1 Mission</div>
            <p style={S.mcRightDesc}>
              India's first solar mission to study the Sun from Lagrange Point L1, about 1.5 million km from Earth.
            </p>
            <div style={S.mcRightKey}>Key Objectives</div>
            <div>
              {[
                'Observe solar corona and chromosphere',
                'Monitor solar wind and CMEs',
                'Study space weather in real-time'
              ].map((txt,i) => (
                <div key={i} style={S.keyObjItem}>
                  <i className="fas fa-check-circle" style={{color:C.green, marginTop:2}}/>
                  <span>{txt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Middle Grid ── */}
        <div style={S.middleGrid}>
          {/* System Highlights */}
          <div style={S.panel}>
            <div style={S.pHdr}>
              <i className="far fa-star" style={{color:C.purple, fontSize:'1.1rem'}}/>
              <span style={S.pTitle}>System Highlights</span>
            </div>
            <div style={S.pBody}>
              {SYS_HIGHLIGHTS.map((h,i) => (
                <div key={i} style={S.hlItem}>
                  <i className={h.icon} style={S.hlIcon}/>
                  <span style={S.hlText}>{h.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Technologies */}
          <div style={S.panel}>
            <div style={S.pHdr}>
              <i className="fas fa-cog" style={{color:C.purple, fontSize:'1.1rem'}}/>
              <span style={S.pTitle}>Key Technologies</span>
            </div>
            <div style={S.pBody}>
              {KEY_TECH.map((t,i) => (
                <div key={i} style={S.techItem}>
                  <div style={S.techIconW(t.color)}><i className={t.icon}/></div>
                  <div>
                    <div style={S.techTitle(t.color)}>{t.title}</div>
                    <div style={S.techDesc}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Sources */}
          <div style={S.panel}>
            <div style={S.pHdr}>
              <i className="fas fa-database" style={{color:C.blue, fontSize:'1.1rem'}}/>
              <span style={S.pTitle}>Data Sources</span>
            </div>
            <div style={S.pBody}>
              {DATA_SOURCES.map((d,i) => (
                <div key={i} style={S.dsItem}>
                  <d.svg color={d.color} />
                  <div style={{marginTop:2}}>
                    <div style={S.dsTitle(d.color)}>{d.title}</div>
                    <div style={S.dsSub}>{d.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Information */}
          <div style={S.panel}>
            <div style={S.pHdr}>
              <i className="fas fa-info-circle" style={{color:C.blue, fontSize:'1.1rem'}}/>
              <span style={S.pTitle}>System Information</span>
            </div>
            <div style={{padding:'20px'}}>
              {SYS_INFO.map((info,i) => (
                <div key={i} style={{...S.infoRow, borderBottom: i===SYS_INFO.length-1 ? 'none' : S.infoRow.borderBottom}}>
                  <span style={S.infoLbl}>{info.label}</span>
                  <span style={S.infoVal}>{info.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Banner ── */}
        <div style={S.bottomBanner}>
          <div style={S.bbLeft}>
            <div style={S.bbTitle}><i className="fas fa-shield-check" style={{fontWeight:900}}/> Our Mission</div>
            <p style={S.bbDesc}>
              To deliver accurate, timely, and explainable solar flare predictions that empower ISRO and stakeholders to safeguard satellites, astronauts, communication systems, and power grids from space weather hazards.
            </p>
          </div>
          <div style={S.bbStats}>
            <div style={{...S.bbStatWrap, paddingLeft:0, borderLeft:'none'}}>
              <div style={S.bbStatIcon(C.green)}><i className="far fa-calendar-check"/></div>
              <div>
                <div style={S.bbStatVal}>248+</div>
                <div style={S.bbStatLbl}>Flares Analyzed</div>
              </div>
            </div>
            <div style={S.bbStatWrap}>
              <div style={S.bbStatIcon(C.purple)}><i className="fas fa-bullseye"/></div>
              <div>
                <div style={S.bbStatVal}>89.1%</div>
                <div style={S.bbStatLbl}>Overall Accuracy</div>
              </div>
            </div>
            <div style={S.bbStatWrap}>
              <div style={S.bbStatIcon(C.orange)}><i className="far fa-clock"/></div>
              <div>
                <div style={S.bbStatVal}>10–60 min</div>
                <div style={S.bbStatLbl}>Lead Time Range</div>
              </div>
            </div>
            <div style={S.bbStatWrap}>
              <div style={S.bbStatIcon(C.blue)}><i className="fas fa-shield-alt"/></div>
              <div>
                <div style={S.bbStatVal}>24/7</div>
                <div style={S.bbStatLbl}>Real-time Monitoring</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'.75rem',color:C.textMuted,marginTop:24}}>
          <span/>
          <span>© 2024 ISRO – SolarGuard. All Rights Reserved.</span>
          <span>Built for ISRO Hackathon 2025</span>
        </div>
      </main>
    </div>
  );
}

/* ---- Small left-nav Sun Logo ---- */
function SunLogo() {
  return (
    <svg viewBox="0 0 48 48" width={42} height={42} style={{flexShrink:0,marginTop:2}}>
      <defs>
        <radialGradient id="sgSunGAbt" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="70%" stopColor="#f59e0b"/>
          <stop offset="100%" stopColor="#d97706"/>
        </radialGradient>
      </defs>
      <circle cx={24} cy={24} r={10} fill="url(#sgSunGAbt)"/>
      <circle cx={24} cy={24} r={10} fill="none" stroke="#fbbf2455" strokeWidth={1}/>
      <ellipse cx={24} cy={24} rx={16} ry={6} fill="none" stroke="#22d3ee" strokeWidth={1.2} opacity={.6} transform="rotate(-20 24 24)"/>
      <ellipse cx={24} cy={24} rx={20} ry={8} fill="none" stroke="#3b82f6" strokeWidth={1} opacity={.4} transform="rotate(15 24 24)"/>
      <circle cx={38} cy={18} r={2.5} fill="#22d3ee" opacity={.8}/>
      <circle cx={10} cy={28} r={2} fill="#3b82f6" opacity={.7}/>
    </svg>
  );
}

/* ---- Main Banner Sun & Space Graphic (High Fidelity) ---- */
function SunSpaceGraphic() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bigSunHi" cx="100%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="8%" stopColor="#fef08a"/>
          <stop offset="20%" stopColor="#f59e0b"/>
          <stop offset="40%" stopColor="#9a3412"/>
          <stop offset="65%" stopColor="#450a0a"/>
          <stop offset="100%" stopColor="#00000000"/>
        </radialGradient>
        
        <radialGradient id="flareGlowHi" cx="80%" cy="30%" r="35%">
          <stop offset="0%" stopColor="#fef08a"/>
          <stop offset="30%" stopColor="#ea580c"/>
          <stop offset="100%" stopColor="#00000000"/>
        </radialGradient>

        <linearGradient id="beam" x1="50%" y1="0%" x2="90%" y2="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0"/>
        </linearGradient>
      </defs>
      
      {/* Background space */}
      <rect width="800" height="400" fill="#0d1322" opacity="0.8" />
      
      {/* Sun Body */}
      <circle cx="850" cy="200" r="450" fill="url(#bigSunHi)" opacity="0.95" />
      
      {/* Solar Flares / Eruptions */}
      <path d="M680 150 Q550 50 720 30 Q630 180 680 150" fill="none" stroke="url(#flareGlowHi)" strokeWidth="8" opacity="0.7" filter="blur(3px)"/>
      <path d="M700 170 Q450 100 550 300 Q630 200 700 170" fill="none" stroke="url(#flareGlowHi)" strokeWidth="4" opacity="0.8" filter="blur(1px)"/>
      
      {/* Sun Surface Details */}
      <path d="M800 -50 Q600 150 800 450" fill="none" stroke="#fef08a" strokeWidth="2" opacity="0.4" />
      <path d="M800 20 Q550 200 800 380" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.3" />

      {/* Orbit Line */}
      <path d="M150 250 Q450 200 600 80" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.4" />
      
      {/* Earth */}
      <g transform="translate(150, 250)">
        <circle cx="0" cy="0" r="18" fill="#1e3a8a" />
        <circle cx="0" cy="0" r="18" fill="url(#beam)" opacity="0.5"/>
        <circle cx="0" cy="0" r="18" fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.8" />
        <path d="M-10 -10 Q0 -5 -5 5 Q5 10 10 0" fill="#22c55e" opacity="0.6"/>
        <path d="M5 -12 Q12 -5 8 -2" fill="#22c55e" opacity="0.6"/>
        {/* Glow */}
        <circle cx="-5" cy="-5" r="2" fill="#ffffff" opacity="0.4" filter="blur(1px)"/>
      </g>
      
      {/* Satellite (Aditya-L1 realistic shape) */}
      <g transform="translate(400, 130) scale(0.9) rotate(-20)">
        {/* Solar Panels Gold */}
        <rect x="-40" y="-15" width="30" height="30" fill="#1e3a8a" stroke="#fbbf24" strokeWidth="1" />
        <line x1="-40" y1="-5" x2="-10" y2="-5" stroke="#fbbf24" strokeWidth="0.5" />
        <line x1="-40" y1="5" x2="-10" y2="5" stroke="#fbbf24" strokeWidth="0.5" />
        <line x1="-25" y1="-15" x2="-25" y2="15" stroke="#fbbf24" strokeWidth="0.5" />
        
        <rect x="25" y="-15" width="30" height="30" fill="#1e3a8a" stroke="#fbbf24" strokeWidth="1" />
        <line x1="25" y1="-5" x2="55" y2="-5" stroke="#fbbf24" strokeWidth="0.5" />
        <line x1="25" y1="5" x2="55" y2="5" stroke="#fbbf24" strokeWidth="0.5" />
        <line x1="40" y1="-15" x2="40" y2="15" stroke="#fbbf24" strokeWidth="0.5" />
        
        {/* Main Body */}
        <rect x="-10" y="-12" width="35" height="24" fill="#d97706" stroke="#fcd34d" strokeWidth="1.5" rx="2" />
        <rect x="-5" y="-8" width="25" height="16" fill="#b45309" />
        
        {/* Payload / Instruments */}
        <rect x="0" y="-20" width="15" height="8" fill="#9ca3af" stroke="#d1d5db" strokeWidth="1" />
        <circle cx="7.5" cy="-20" r="3" fill="#3b82f6" />
        
        {/* Antenna */}
        <line x1="15" y1="12" x2="30" y2="30" stroke="#9ca3af" strokeWidth="2" />
        <circle cx="30" cy="30" r="4" fill="#f3f4f6" />
      </g>

      {/* Connection / Distance label */}
      <text x="210" y="235" fill="#3b82f6" fontSize="13" fontWeight="600" fontFamily={fontSans} letterSpacing="0.5">1.5 million km</text>
      <text x="210" y="255" fill="#60a5fa" fontSize="12" fontFamily={fontSans}>from Earth</text>
      <line x1="180" y1="245" x2="200" y2="245" stroke="#3b82f6" strokeWidth="1.5" />
    </svg>
  );
}
