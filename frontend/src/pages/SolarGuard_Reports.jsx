import React, { useEffect, useRef, useState, useCallback } from 'react';

/* ================================================================
   SolarGuard – Reports & Analytics Page
   A single self-contained React component (JSX).
   Requires: react, chart.js (npm i chart.js)
   Usage:    import SolarReports from './SolarReports';
             <SolarReports />
   ================================================================ */

let ChartJS = null;

// ─── Color tokens ───────────────────────────────────────────────
const C = {
  bgDarkest:   '#060a13',
  bgSidebar:   '#0a0e1a',
  bgMain:      '#0c1222',
  bgCard:      '#111a2e',
  bgInput:     '#0d1529',
  border:      '#1a2540',
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
  darkGreen:   '#166534',
  darkRed:     '#991b1b',
  darkYellow:  '#854d0e',
};

const fontSans = "'Inter','Segoe UI',system-ui,sans-serif";
const fontMono = "'JetBrains Mono','Fira Code','Consolas',monospace";

// ─── Sub-components: Charts ──────────────────────────────────────

/* ---- Sparkline Canvas ---- */
function Sparkline({ data, color, height = 30 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;
    
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    data.forEach((val, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((val - min) / range) * (h - 4) - 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [data, color]);
  return <canvas ref={ref} style={{ width: '60px', height: `${height}px` }} />;
}

/* ---- Gauge Chart (Accuracy) ---- */
function AccuracyGauge() {
  const ref = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    import('chart.js/auto').then(mod => {
      if (cancelled) return;
      ChartJS = mod.default || mod.Chart || mod;
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = new ChartJS(ref.current, {
        type: 'doughnut',
        data: {
          labels: ['Accuracy', 'Remaining'],
          datasets: [{
            data: [89.1, 10.9],
            backgroundColor: [C.green, '#1a2540'],
            borderWidth: 0,
            circumference: 180,
            rotation: 270,
            borderRadius: [5, 5]
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '80%',
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          animation: { animateRotate: true, duration: 1000, easing: 'easeOutQuart' }
        }
      });
    });
    return () => { cancelled = true; if (chartRef.current) chartRef.current.destroy(); };
  }, []);
  return (
    <div style={{ position: 'relative', width: '160px', height: '90px', margin: '0 auto' }}>
      <canvas ref={ref} />
      <div style={{ position: 'absolute', bottom: 0, left: '0', right: '0', textAlign: 'center' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: C.green }}>89.1%</div>
      </div>
    </div>
  );
}

/* ---- Progress Bar Component ---- */
function ProgressBar({ label, value, color, max = 100 }) {
  const pct = (value / max) * 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
      <span style={{ width: '120px', fontSize: '.75rem', color: C.textSec }}>{label}</span>
      <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px' }} />
      </div>
      <span style={{ width: '40px', textAlign: 'right', fontSize: '.75rem', fontWeight: 600, color: C.textPrimary }}>
        {max === 100 ? `${value.toFixed(1)}%` : value.toFixed(2)}
      </span>
    </div>
  );
}

/* ---- Line Chart: Precision, Recall Over Time ---- */
function MetricsOverTimeChart() {
  const ref = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    import('chart.js/auto').then(mod => {
      if (cancelled) return;
      ChartJS = mod.default || mod.Chart || mod;
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = new ChartJS(ref.current, {
        type: 'line',
        data: {
          labels: ['Aug 27','Aug 28','Aug 29','Aug 30','Aug 31','Sep 01','Sep 02'],
          datasets: [
            { label: 'Precision', data: [80, 78, 88, 85, 89, 75, 87], borderColor: C.blue, backgroundColor: C.blue, tension: 0.3, borderWidth: 2, pointRadius: 3 },
            { label: 'Recall', data: [91, 85, 90, 89, 92, 82, 88], borderColor: C.green, backgroundColor: C.green, tension: 0.3, borderWidth: 2, pointRadius: 3 },
            { label: 'F1-Score', data: [75, 65, 85, 78, 85, 68, 82], borderColor: C.purple, backgroundColor: C.purple, tension: 0.3, borderWidth: 2, pointRadius: 3 },
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: {
            y: { min: 0, max: 100, ticks: { callback: v=>v+'%', color: C.textMuted, font: {size:10} }, grid: { color: 'rgba(26,37,64,0.5)' }, border: {display:false} },
            x: { ticks: { color: C.textMuted, font: {size:10} }, grid: { display: false }, border: {color: C.border} }
          },
          plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: '#1a2540', titleColor: C.textWhite, bodyColor: C.textSec, borderColor: '#2a3a5c', borderWidth: 1 }
          }
        }
      });
    });
    return () => { cancelled = true; if (chartRef.current) chartRef.current.destroy(); };
  }, []);
  return <canvas ref={ref} />;
}

/* ---- Bar Chart: Lead Time Distribution ---- */
function LeadTimeChart() {
  const ref = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    import('chart.js/auto').then(mod => {
      if (cancelled) return;
      ChartJS = mod.default || mod.Chart || mod;
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = new ChartJS(ref.current, {
        type: 'bar',
        data: {
          labels: ['0-2', '2-5', '5-10', '10-20', '20-30', '30-60', '>60'],
          datasets: [{
            data: [15, 35, 80, 62, 22, 5, 2],
            backgroundColor: C.purple,
            borderRadius: 2
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: {
            y: { title: { display:true, text:'Number of Flares', color:C.textMuted, font:{size:9} }, ticks: { color: C.textMuted, font: {size:9} }, grid: { color: 'rgba(26,37,64,0.5)' }, border: {display:false} },
            x: { title: { display:true, text:'Lead Time (minutes)', color:C.textMuted, font:{size:9} }, ticks: { color: C.textMuted, font: {size:9} }, grid: { display: false }, border: {color: C.border} }
          },
          plugins: { legend: { display: false } }
        }
      });
    });
    return () => { cancelled = true; if (chartRef.current) chartRef.current.destroy(); };
  }, []);
  return <canvas ref={ref} />;
}

/* ---- Donut Chart: Flare Class Distribution ---- */
function ClassDistChart() {
  const ref = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    import('chart.js/auto').then(mod => {
      if (cancelled) return;
      ChartJS = mod.default || mod.Chart || mod;
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = new ChartJS(ref.current, {
        type: 'doughnut',
        data: {
          labels: ['B-Class','C-Class','M-Class','X-Class'],
          datasets: [{
            data: [25.8, 53.2, 15.3, 5.6],
            backgroundColor: [C.blue, C.yellow, C.orange, C.red],
            borderColor: C.bgCard, borderWidth: 2, hoverOffset: 4
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '70%',
          plugins: { legend: { display: false } }
        }
      });
    });
    return () => { cancelled = true; if (chartRef.current) chartRef.current.destroy(); };
  }, []);
  return (
    <div style={{ position: 'relative', width: '130px', height: '130px' }}>
      <canvas ref={ref} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: C.textWhite }}>248</span>
        <span style={{ fontSize: '.7rem', color: C.textMuted }}>Total</span>
      </div>
    </div>
  );
}

/* ---- Stacked Bar Chart: Monthly Trend ---- */
function MonthlyTrendChart() {
  const ref = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    import('chart.js/auto').then(mod => {
      if (cancelled) return;
      ChartJS = mod.default || mod.Chart || mod;
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = new ChartJS(ref.current, {
        type: 'bar',
        data: {
          labels: ['Mar 2024','Apr 2024','May 2024','Jun 2024','Jul 2024','Aug 2024','Sep 2024'],
          datasets: [
            { label: 'B-Class', data: [45, 50, 48, 60, 42, 45, 55], backgroundColor: C.blue, stack: 'Stack 0' },
            { label: 'C-Class', data: [55, 10, 80, 85, 60, 62, 50], backgroundColor: C.yellow, stack: 'Stack 0' },
            { label: 'M-Class', data: [15, 10, 30, 25, 15, 18, 12], backgroundColor: C.orange, stack: 'Stack 0' },
            { label: 'X-Class', data: [2, 1, 5, 4, 2, 3, 1], backgroundColor: C.red, stack: 'Stack 0' }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: {
            y: { stacked: true, max: 200, title: { display:true, text:'Number of Flares', color:C.textMuted, font:{size:9} }, ticks: { color: C.textMuted, font: {size:9} }, grid: { color: 'rgba(26,37,64,0.5)' }, border: {display:false} },
            x: { stacked: true, ticks: { color: C.textMuted, font: {size:9} }, grid: { display: false }, border: {color: C.border} }
          },
          plugins: { legend: { display: false } }
        }
      });
    });
    return () => { cancelled = true; if (chartRef.current) chartRef.current.destroy(); };
  }, []);
  return <canvas ref={ref} />;
}

// ─── Data ───────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon:'fas fa-th-large',    label:'Dashboard' },
  { icon:'fas fa-chart-line',  label:'Light Curves' },
  { icon:'fas fa-chart-bar',   label:'Hardening & Forecast' },
  { icon:'fas fa-dna',         label:'Flare Genome' },
  { icon:'fas fa-database',    label:'Solar Memory DB' },
  { icon:'fas fa-bell',        label:'Alerts' },
  { icon:'fas fa-file-alt',    label:'Reports', active:true },
  { icon:'fas fa-cog',         label:'Settings' },
  { icon:'fas fa-info-circle', label:'About' },
];

const METRICS = [
  { title: 'Total Events Analyzed', value: '248', trend: '↗ 12.4% vs last period', trendColor: C.cyan, chart: true, color: C.cyan },
  { title: 'Flares Detected', value: '225', trend: '↗ 10.2% vs last period', trendColor: C.yellow, icon: 'fas fa-sun', color: C.yellow },
  { title: 'True Positives (TP)', value: '207', trend: '↗ 8.7% vs last period', trendColor: C.green, icon: 'fas fa-check-circle', color: C.green },
  { title: 'False Alarms (FP)', value: '18', trend: '↘ -5.3% vs last period', trendColor: C.orange, icon: 'fas fa-exclamation-triangle', color: C.orange },
  { title: 'Missed Events (FN)', value: '21', trend: '↘ -10.6% vs last period', trendColor: C.red, icon: 'fas fa-times-circle', color: C.red },
  { title: 'Average Lead Time', value: '10.3 min', trend: '↗ 1.8 min vs last period', trendColor: C.purple, icon: 'fas fa-clock', color: C.purple },
];

const CONFUSION_MATRIX = [
  { act: 'B', pred: { B: 58, C: 5, M: 1, X: 0 }, tot: 64 },
  { act: 'C', pred: { B: 7, C: 117, M: 7, X: 1 }, tot: 132 },
  { act: 'M', pred: { B: 1, C: 6, M: 31, X: 0 }, tot: 38 },
  { act: 'X', pred: { B: 0, C: 1, M: 1, X: 12 }, tot: 14 },
  { act: 'Total', pred: { B: 66, C: 129, M: 40, X: 13 }, tot: 248 },
];

function cellColor(act, pred, val) {
  if (act === 'Total' || pred === 'tot' || act === 'act') return 'transparent';
  if (act === pred) return `rgba(34, 197, 94, ${val / 117})`; // Green intensity based on max true pos
  if (val > 0) return `rgba(245, 158, 11, ${val / 10})`; // Orange intensity for false pos/neg
  return 'rgba(255,255,255,0.02)';
}

// ─── Inline-style objects ───────────────────────────────────────
const S = {
  app:         { display:'flex', minHeight:'100vh', fontFamily:fontSans, background:C.bgDarkest, color:C.textPrimary, WebkitFontSmoothing:'antialiased' },
  sidebar:     { width:220, minWidth:220, background:C.bgSidebar, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', height:'100vh', position:'fixed', top:0, left:0, zIndex:100, overflowY:'auto', overflowX:'hidden' },
  main:        { flex:1, marginLeft:220, padding:'0 20px 20px', minWidth:0, display:'flex', flexDirection:'column' },
  
  sidebarHdr:  { padding:'16px 14px 12px', borderBottom:`1px solid ${C.border}` },
  logoWrap:    { display:'flex', alignItems:'flex-start', gap:10 },
  logoTitle:   { fontSize:'1.2rem', fontWeight:700, color:C.textWhite, letterSpacing:.5, lineHeight:1.2 },
  logoSub:     { fontSize:'.75rem', color:C.textSec, lineHeight:1.3, marginTop:3 },
  logoVer:     { fontSize:'.65rem', color:C.green, marginTop:3, fontWeight:500, opacity:.8 }, // Note: Green version text in this screenshot

  navWrap:     { flex:1, padding:'10px 8px', display:'flex', flexDirection:'column', gap:2 },
  navItem:     (active) => ({ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, color:active?C.textWhite:C.textSec, textDecoration:'none', fontSize:'.85rem', fontWeight:active?600:450, cursor:'pointer', background:active?C.blue:'transparent', width:'100%', fontFamily:fontSans, border:'none', textAlign:'left' }),
  navIcon:     { width:18, textAlign:'center', fontSize:'.85rem', flexShrink:0 },

  sysStatusBox:{ padding:'16px 14px', borderTop:`1px solid ${C.border}`, display:'flex', flexDirection:'column', gap:'12px' },
  sysTitle:    { fontSize:'.75rem', color:C.textSec },
  sysVal:      { fontSize:'.8rem', color:C.textPrimary, fontWeight:500 },
  sysValGreen: { fontSize:'.8rem', color:C.textPrimary, fontWeight:500, display:'flex', alignItems:'center', gap:6 },
  dotGreen:    { width:8, height:8, borderRadius:'50%', background:C.green },

  header:      { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', gap:16, flexWrap:'wrap' },
  pageTitle:   { fontSize:'1.5rem', fontWeight:700, color:C.textWhite, letterSpacing:.3, lineHeight:1.3 },
  pageSub:     { fontSize:'.8rem', color:C.textSec, marginTop:2 },
  headerRight: { display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' },
  datePicker:  { display:'flex', alignItems:'center', gap:6, padding:'7px 12px', background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:8, fontSize:'.78rem', color:C.textSec, cursor:'pointer' },
  selectClass: { padding:'7px 30px 7px 12px', background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:8, color:C.textPrimary, fontSize:'.78rem', outline:'none', appearance:'none' },
  btnExport:   { display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:C.blue, border:'none', borderRadius:8, color:'white', fontSize:'.78rem', cursor:'pointer', fontWeight:500 },

  metricsGrid: { display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:14, marginBottom:16 },
  metricCard:  { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:10, padding:'14px', display:'flex', flexDirection:'column', gap:8, position:'relative' },
  mTitle:      { fontSize:'.75rem', color:C.textSec, whiteSpace:'nowrap' },
  mBody:       { display:'flex', justifyContent:'space-between', alignItems:'center' },
  mVal:        (c) => ({ fontSize:'1.8rem', fontWeight:700, color:c }),
  mTrend:      (c) => ({ fontSize:'.7rem', color:c }),

  gridRow2:    { display:'grid', gridTemplateColumns:'300px 1fr', gap:14, marginBottom:16 },
  gridRow3:    { display:'grid', gridTemplateColumns:'1fr 1fr 280px', gap:14, marginBottom:16 },
  gridRow4:    { display:'grid', gridTemplateColumns:'1fr 1fr 280px', gap:14, marginBottom:16 },

  panel:       { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:10, display:'flex', flexDirection:'column' },
  pHdr:        { padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`1px solid rgba(255,255,255,0.03)` },
  pTitle:      { fontSize:'.85rem', fontWeight:600, color:C.textPrimary },
  pBody:       { padding:'16px', flex:1 },

  table:       { width:'100%', borderCollapse:'collapse', fontSize:'.75rem' },
  th:          { padding:'8px 10px', textAlign:'right', fontWeight:500, color:C.textMuted, borderBottom:`1px solid rgba(255,255,255,0.05)`, whiteSpace:'nowrap' },
  thLeft:      { padding:'8px 10px', textAlign:'left', fontWeight:500, color:C.textMuted, borderBottom:`1px solid rgba(255,255,255,0.05)` },
  td:          { padding:'10px 10px', textAlign:'right', color:C.textPrimary, borderBottom:`1px solid rgba(255,255,255,0.02)` },
  tdLeft:      { padding:'10px 10px', textAlign:'left', fontWeight:600, borderBottom:`1px solid rgba(255,255,255,0.02)` },
  
  confTable:   { width:'100%', borderCollapse:'collapse', fontSize:'.75rem', textAlign:'center' },
  cTh:         { padding:'6px', color:C.textMuted, fontWeight:500 },
  cTd:         { padding:'8px', border:'1px solid rgba(255,255,255,0.05)', color:C.textPrimary },

  legendDot:   (c) => ({ display:'inline-block', width:8, height:8, borderRadius:'50%', background:c, marginRight:6 }),
  reportLink:  { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px', background:'rgba(255,255,255,0.02)', border:`1px solid rgba(255,255,255,0.05)`, borderRadius:6, marginBottom:8, color:C.textSec, fontSize:'.75rem', cursor:'pointer', textDecoration:'none' },
};

export default function SolarReports() {
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
            <div style={S.sysValGreen}><span style={S.dotGreen}/> Normal</div>
          </div>
          <div>
            <div style={S.sysTitle}>Data Source</div>
            <div style={{...S.sysVal, color:C.green}}>Aditya-L1 (SoLEXS + HEL1OS)</div>
          </div>
          <div>
            <div style={S.sysTitle}>Last Updated</div>
            <div style={{...S.sysVal, color:C.textSec, fontSize:'.75rem'}}>2024-09-02 12:45:30 IST</div>
          </div>
        </div>
        <div style={{ padding:'10px 14px', fontSize:'.65rem', color:C.textMuted }}>All times in IST <i className="fas fa-info-circle"/></div>
      </aside>

      {/* ──── Main Content ──── */}
      <main style={S.main}>
        <header style={S.header}>
          <div>
            <h1 style={S.pageTitle}>Reports &amp; Analytics</h1>
            <p style={S.pageSub}>Performance evaluation and system analytics</p>
          </div>
          <div style={S.headerRight}>
            <div style={S.datePicker}>
              <i className="far fa-calendar-alt"/> 2024-09-02 &nbsp;–&nbsp; 2024-09-02 <i className="fas fa-chevron-down" style={{fontSize:'.6rem'}}/>
            </div>
            <select style={S.selectClass}>
              <option>All Classes</option>
            </select>
            <button style={S.btnExport}><i className="fas fa-download"/> Export Report</button>
          </div>
        </header>

        {/* Top Metrics Grid */}
        <div style={S.metricsGrid}>
          {METRICS.map((m,i) => (
            <div key={i} style={S.metricCard}>
              <div style={S.mTitle}>{m.title}</div>
              <div style={S.mBody}>
                <div style={S.mVal(m.color)}>{m.value}</div>
                {m.chart && <Sparkline data={[10,25,20,40,30,55,45]} color={m.color} />}
                {m.icon && <i className={m.icon} style={{ fontSize:'1.8rem', color:m.color, opacity:0.8 }}/>}
              </div>
              <div style={S.mTrend(m.trendColor)}>{m.trend}</div>
            </div>
          ))}
        </div>

        {/* Row 2: Performance Summary & Metrics Over Time */}
        <div style={S.gridRow2}>
          <div style={S.panel}>
            <div style={S.pHdr}><span style={S.pTitle}>Performance Summary</span></div>
            <div style={{...S.pBody, display:'flex', flexDirection:'column', justifyContent:'center'}}>
              <AccuracyGauge />
              <div style={{ textAlign:'center', fontSize:'.8rem', color:C.textPrimary, marginBottom:4 }}>Overall Accuracy</div>
              <div style={{ textAlign:'center', fontSize:'.7rem', color:C.green, marginBottom:20 }}>↗ 4.2% vs last period</div>
              
              <ProgressBar label="Precision (PPV)" value={92.0} color={C.blue} />
              <ProgressBar label="Recall (TPR)" value={89.6} color={C.green} />
              <ProgressBar label="F1-Score" value={90.7} color={C.purple} />
              <ProgressBar label="True Skill Statistic (TSS)" value={0.82} max={1} color={C.orange} />
              <ProgressBar label="Heidke Skill Score (HSS)" value={0.79} max={1} color={C.cyan} />
            </div>
          </div>
          
          <div style={S.panel}>
            <div style={S.pHdr}>
              <span style={S.pTitle}>Precision, Recall &amp; F1-Score Over Time <i className="fas fa-info-circle" style={{color:C.textMuted,fontSize:'.75rem'}}/></span>
              <div style={{display:'flex',gap:16,alignItems:'center'}}>
                <div style={{fontSize:'.7rem',color:C.textSec,display:'flex',gap:12}}>
                  <span><span style={{color:C.blue}}>—</span> Precision</span>
                  <span><span style={{color:C.green}}>—</span> Recall</span>
                  <span><span style={{color:C.purple}}>—</span> F1-Score</span>
                </div>
                <select style={{...S.selectClass, padding:'3px 20px 3px 8px', fontSize:'.7rem'}}>
                  <option>Daily</option>
                </select>
              </div>
            </div>
            <div style={{...S.pBody, height:'250px', position:'relative'}}>
              <MetricsOverTimeChart />
            </div>
          </div>
        </div>

        {/* Row 3: Detection Stats, Lead Time, Class Dist */}
        <div style={S.gridRow3}>
          <div style={S.panel}>
            <div style={S.pHdr}><span style={S.pTitle}>Detection Statistics by Flare Class</span></div>
            <div style={{padding:'8px 16px', flex:1}}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.thLeft}>Class</th>
                    <th style={S.th}>Total Events</th>
                    <th style={S.th}>Detected (TP)</th>
                    <th style={S.th}>Missed (FN)</th>
                    <th style={S.th}>Precision</th>
                    <th style={S.th}>Recall</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { c:'B-Class', col:C.blue, t:64, d:58, m:6, p:'93.5%', r:'90.6%' },
                    { c:'C-Class', col:C.yellow, t:132, d:117, m:15, p:'91.4%', r:'88.6%' },
                    { c:'M-Class', col:C.orange, t:38, d:31, m:7, p:'86.1%', r:'81.6%' },
                    { c:'X-Class', col:C.red, t:14, d:12, m:2, p:'85.7%', r:'85.7%' },
                  ].map((r,i) => (
                    <tr key={i}>
                      <td style={{...S.tdLeft, color:r.col}}>{r.c}</td>
                      <td style={S.td}>{r.t}</td>
                      <td style={S.td}>{r.d}</td>
                      <td style={S.td}>{r.m}</td>
                      <td style={S.td}>{r.p}</td>
                      <td style={S.td}>{r.r}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{...S.tdLeft, color:C.textWhite}}>Total</td>
                    <td style={{...S.td, color:C.textWhite, fontWeight:600}}>248</td>
                    <td style={{...S.td, color:C.textWhite, fontWeight:600}}>218</td>
                    <td style={{...S.td, color:C.textWhite, fontWeight:600}}>30</td>
                    <td style={{...S.td, color:C.textWhite, fontWeight:600}}>91.2%</td>
                    <td style={{...S.td, color:C.textWhite, fontWeight:600}}>88.2%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={S.panel}>
            <div style={S.pHdr}><span style={S.pTitle}>Lead Time Distribution</span></div>
            <div style={{...S.pBody, position:'relative'}}>
              <LeadTimeChart />
            </div>
          </div>

          <div style={S.panel}>
            <div style={S.pHdr}><span style={S.pTitle}>Flare Class Distribution <i className="fas fa-info-circle" style={{color:C.textMuted,fontSize:'.75rem'}}/></span></div>
            <div style={{...S.pBody, display:'flex', alignItems:'center', gap:16}}>
              <ClassDistChart />
              <div style={{display:'flex', flexDirection:'column', gap:8, flex:1}}>
                {[
                  { l:'B-Class', c:C.blue, p:'25.8%', v:64 },
                  { l:'C-Class', c:C.yellow, p:'53.2%', v:132 },
                  { l:'M-Class', c:C.orange, p:'15.3%', v:38 },
                  { l:'X-Class', c:C.red, p:'5.6%', v:14 },
                ].map((x,i) => (
                  <div key={i} style={{display:'flex', alignItems:'center', fontSize:'.7rem', color:C.textSec}}>
                    <span style={S.legendDot(x.c)}/> <span style={{width:'50px'}}>{x.l}</span>
                    <span style={{marginLeft:'auto', color:C.textMuted}}>{x.p} ({x.v})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Monthly Trend, Confusion Matrix, Downloadable Reports */}
        <div style={S.gridRow4} style={{...S.gridRow4, marginBottom:0}}>
          <div style={S.panel}>
            <div style={S.pHdr}>
              <span style={S.pTitle}>Monthly Trend (Detected Flares)</span>
              <div style={{display:'flex',gap:12,fontSize:'.7rem',color:C.textSec}}>
                <span><span style={S.legendDot(C.blue)}/>B-Class</span>
                <span><span style={S.legendDot(C.yellow)}/>C-Class</span>
                <span><span style={S.legendDot(C.orange)}/>M-Class</span>
                <span><span style={S.legendDot(C.red)}/>X-Class</span>
              </div>
            </div>
            <div style={{...S.pBody, position:'relative'}}>
              <MonthlyTrendChart />
            </div>
          </div>

          <div style={S.panel}>
            <div style={S.pHdr}><span style={S.pTitle}>Confusion Matrix (All Classes)</span></div>
            <div style={{padding:'16px'}}>
              <table style={S.confTable}>
                <thead>
                  <tr>
                    <th style={{...S.cTh, textAlign:'left'}}>Actual \ Predicted</th>
                    <th style={S.cTh}>B</th><th style={S.cTh}>C</th><th style={S.cTh}>M</th><th style={S.cTh}>X</th>
                    <th style={S.cTh}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {CONFUSION_MATRIX.map((row, i) => (
                    <tr key={i}>
                      <td style={{...S.cTd, textAlign:'left', fontWeight:600, color: row.act==='Total'?C.textWhite:['#3b82f6','#fbbf24','#f59e0b','#ef4444'][i] || C.textWhite, border: 'none'}}>{row.act}</td>
                      {['B','C','M','X'].map(p => (
                        <td key={p} style={{...S.cTd, background: cellColor(row.act, p, row.pred[p]), border: row.act==='Total'?'none':S.cTd.border}}>
                          {row.pred[p]}
                        </td>
                      ))}
                      <td style={{...S.cTd, fontWeight:600, border:'none'}}>{row.tot}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={S.panel}>
            <div style={S.pHdr}><span style={S.pTitle}>Downloadable Reports</span></div>
            <div style={{padding:'16px'}}>
              {[
                { icon:'far fa-file-pdf', col:C.red, l:'Performance Summary (PDF)' },
                { icon:'far fa-file-excel', col:C.green, l:'Detailed Metrics (CSV)' },
                { icon:'far fa-file-excel', col:C.green, l:'Event List (CSV)' },
                { icon:'far fa-image', col:C.orange, l:'Confusion Matrix (PNG)' },
                { icon:'far fa-chart-bar', col:C.blue, l:'Monthly Trend (PNG)' },
              ].map((r,i) => (
                <a key={i} href="#" style={S.reportLink}>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <i className={r.icon} style={{color:r.col, width:16, textAlign:'center'}}/>
                    <span>{r.l}</span>
                  </div>
                  <i className="fas fa-chevron-right" style={{fontSize:'.6rem', opacity:0.5}}/>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'.7rem',color:C.textMuted,marginTop:20}}>
          <span/>
          <span>SolarGuard © 2025</span>
          <span>Built for ISRO Hackathon 2025</span>
        </div>
      </main>
    </div>
  );
}

/* ---- Sun Logo SVG ---- */
function SunLogo() {
  return (
    <svg viewBox="0 0 48 48" width={42} height={42} style={{flexShrink:0,marginTop:2}}>
      <defs>
        <radialGradient id="sgSunG2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="70%" stopColor="#f59e0b"/>
          <stop offset="100%" stopColor="#d97706"/>
        </radialGradient>
      </defs>
      <circle cx={24} cy={24} r={10} fill="url(#sgSunG2)"/>
      <circle cx={24} cy={24} r={10} fill="none" stroke="#fbbf2455" strokeWidth={1}/>
      <ellipse cx={24} cy={24} rx={16} ry={6} fill="none" stroke="#22d3ee" strokeWidth={1.2} opacity={.6} transform="rotate(-20 24 24)"/>
      <ellipse cx={24} cy={24} rx={20} ry={8} fill="none" stroke="#3b82f6" strokeWidth={1} opacity={.4} transform="rotate(15 24 24)"/>
      <circle cx={38} cy={18} r={2.5} fill="#22d3ee" opacity={.8}/>
      <circle cx={10} cy={28} r={2} fill="#3b82f6" opacity={.7}/>
    </svg>
  );
}
