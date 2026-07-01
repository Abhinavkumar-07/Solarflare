import React, { useEffect, useRef, useState, useCallback } from 'react';
import Sidebar from "../components/Sidebar";
import { toast } from "../components/Toast";
import { STATS, ACTIVITIES } from "../data/memoryData";
import { getMemoryData } from "../services/memoryService";

/* ================================================================
   SolarGuard – Solar Memory Database Page
   A single self-contained React component (JSX).
   Requires: react, chart.js (npm i chart.js)
   Usage:    import SolarMemoryDB from './SolarMemoryDB';
             <SolarMemoryDB />
   ================================================================ */

// ─── Chart.js (imported lazily inside effects) ──────────────────
let ChartJS = null;

// ─── Color tokens ───────────────────────────────────────────────
const C = {
  bgDarkest:   '#0a0e1a',
  bgSidebar:   '#0a0e1a',
  bgMain:      '#0a0e1a',
  bgCard:      '#0f1626',
  bgCardHover: '#152036',
  bgInput:     '#0a0e1a',
  border:      '#1c2740',
  borderLight: '#263352',
  textPrimary: '#f1f5f9',
  textSec:     '#94a3b8',
  textMuted:   '#5b6b85',
  textWhite:   '#ffffff',
  cyan:        '#2dd4bf',
  blue:        '#38bdf8',
  purple:      '#c084fc',
  green:       '#22d97a',
  yellow:      '#facc15',
  orange:      '#fb923c',
  red:         '#f87171',
};

const fontSans = "'Inter', system-ui, sans-serif";
const fontMono = "'JetBrains Mono','Fira Code','Consolas',monospace";

// ─── Helpers ────────────────────────────────────────────────────
function lerpColor(a, b, t) {
  return `rgb(${Math.round(a[0]+(b[0]-a[0])*t)},${Math.round(a[1]+(b[1]-a[1])*t)},${Math.round(a[2]+(b[2]-a[2])*t)})`;
}
function genomeColor(v) {
  if (v < .25) return lerpColor([20,50,90],[30,130,180],v/.25);
  if (v < .5)  return lerpColor([30,130,180],[34,211,238],(v-.25)/.25);
  if (v < .75) return lerpColor([34,211,238],[251,191,36],(v-.5)/.25);
  return lerpColor([251,191,36],[239,68,68],(v-.75)/.25);
}
function genomeData(seed) {
  const d=[]; let v=.3;
  for(let i=0;i<64;i++){
    v+=(Math.sin(i*.3+seed)*.15+Math.cos(i*.7+seed*2)*.1);
    v=Math.max(.05,Math.min(1,v+(Math.random()-.5)*.12));
    d.push(v);
  }
  return d;
}
function clusterPts(cx,cy,n,s){
  const p=[];
  for(let i=0;i<n;i++) p.push({x:cx+(Math.random()-.5)*s*2+Math.sin(i*.1)*s*.3,y:cy+(Math.random()-.5)*s*2+Math.cos(i*.1)*s*.3});
  return p;
}

// ─── Sub-components ─────────────────────────────────────────────

/* ---- Genome fingerprint canvas ---- */
function GenomeCanvas({ seed, height = 80 }) {
  const ref = useRef(null);
  const draw = useCallback(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width, h = rect.height, data = genomeData(seed);
    const bw = (w - 4) / 64;
    ctx.clearRect(0, 0, w, h);
    data.forEach((v, i) => {
      const bh = v * (h - 8);
      ctx.fillStyle = genomeColor(v);
      ctx.fillRect(2 + i * bw, h - bh - 2, Math.max(bw - 1, 1.5), bh);
    });
  }, [seed]);

  useEffect(() => { draw(); const h = () => draw(); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, [draw]);
  return <canvas ref={ref} style={{ width: '100%', height }} />;
}

/* ---- Genome scale + legend strip ---- */
function GenomeScale() {
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:C.textMuted, padding:'0 2px', marginBottom:4 }}>
        <span>1</span><span>32</span><span>64</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontSize:9, color:C.textMuted }}>
        <span>Low</span>
        <div style={{ width:80, height:6, borderRadius:3, background:'linear-gradient(90deg,#1e3a5f,#22d3ee,#fbbf24,#ef4444)' }} />
        <span>High</span>
      </div>
    </div>
  );
}

/* ---- Donut chart (Class distribution) ---- */
function DonutChart() {
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
          labels: ['C-Class','M-Class','B-Class','X-Class'],
          datasets: [{
            data: [62.3,28.7,7.3,1.7],
            backgroundColor: [C.cyan,C.yellow,C.blue,C.red],
            borderColor: C.bgCard, borderWidth: 2, hoverOffset: 4,
          }],
        },
        options: {
          responsive: false, cutout: '62%',
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor:'#1a2540', titleColor:C.textPrimary, bodyColor:C.textSec,
              borderColor:'#2a3a5c', borderWidth:1, cornerRadius:6, padding:10,
              titleFont:{ family:fontSans, size:12, weight:600 },
              bodyFont:{ family:fontSans, size:11 },
              callbacks:{ label(ctx){ const c=[537,247,63,16]; return `${ctx.parsed}% (${c[ctx.dataIndex]})`; } }
            }
          },
          animation:{ animateRotate:true, duration:1000, easing:'easeOutQuart' }
        }
      });
    });
    return () => { cancelled = true; if (chartRef.current) chartRef.current.destroy(); };
  }, []);
  return <canvas ref={ref} width={170} height={170} />;
}

/* ---- UMAP scatter chart ---- */
function UMAPChart() {
  const ref = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    import('chart.js/auto').then(mod => {
      if (cancelled) return;
      ChartJS = mod.default || mod.Chart || mod;
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = new ChartJS(ref.current, {
        type: 'scatter',
        data: {
          datasets: [
            { label:'C-Class', data:clusterPts(-3,2,65,2.5), backgroundColor:'rgba(34,211,238,.55)', borderColor:'rgba(34,211,238,.8)', borderWidth:.5, pointRadius:3.5, pointHoverRadius:5, order:4 },
            { label:'M-Class', data:clusterPts(3,-2,30,2.2), backgroundColor:'rgba(251,191,36,.55)', borderColor:'rgba(251,191,36,.8)', borderWidth:.5, pointRadius:3.5, pointHoverRadius:5, order:3 },
            { label:'B-Class', data:clusterPts(-6,-4,12,1.8), backgroundColor:'rgba(59,130,246,.55)', borderColor:'rgba(59,130,246,.8)', borderWidth:.5, pointRadius:3.5, pointHoverRadius:5, order:2 },
            { label:'X-Class', data:clusterPts(7,4,5,1.2), backgroundColor:'rgba(239,68,68,.55)', borderColor:'rgba(239,68,68,.8)', borderWidth:.5, pointRadius:3.5, pointHoverRadius:5, order:1 },
            { label:'Query Event', data:[{x:-1.5,y:1}], backgroundColor:'rgba(34,197,94,.2)', borderColor:'#22c55e', borderWidth:2.5, pointRadius:9, pointHoverRadius:11, order:0 },
            { label:'Similar Events', data:[{x:-2.2,y:2.5},{x:-1.8,y:1.8},{x:-3,y:1.2},{x:-2.5,y:3},{x:-1,y:2.2}], backgroundColor:'rgba(168,85,247,.15)', borderColor:'#a855f7', borderWidth:2, pointRadius:6, pointHoverRadius:8, order:0 },
          ]
        },
        options: {
          responsive:true, maintainAspectRatio:false,
          scales:{
            x:{ title:{ display:true, text:'UMAP-1', color:C.textMuted, font:{family:fontSans,size:11,weight:500} }, min:-10, max:12, ticks:{color:C.textMuted,font:{size:9},stepSize:5}, grid:{color:'rgba(26,37,64,.5)',lineWidth:.5}, border:{color:C.border} },
            y:{ title:{ display:true, text:'UMAP-2', color:C.textMuted, font:{family:fontSans,size:11,weight:500} }, min:-8, max:8, ticks:{color:C.textMuted,font:{size:9},stepSize:4}, grid:{color:'rgba(26,37,64,.5)',lineWidth:.5}, border:{color:C.border} },
          },
          plugins:{
            legend:{display:false},
            tooltip:{ backgroundColor:'#1a2540', titleColor:C.textPrimary, bodyColor:C.textSec, borderColor:'#2a3a5c', borderWidth:1, cornerRadius:6, padding:10,
              titleFont:{family:fontSans,size:11,weight:600}, bodyFont:{family:fontSans,size:10},
              callbacks:{ title(i){ return i[0].dataset.label; }, label(ctx){ return `(${ctx.parsed.x.toFixed(1)}, ${ctx.parsed.y.toFixed(1)})`; } }
            }
          },
          animation:{duration:800,easing:'easeOutQuart'}
        }
      });
    });
    return () => { cancelled = true; if (chartRef.current) chartRef.current.destroy(); };
  }, []);
  return <canvas ref={ref} style={{ width:'100%', height:'100%' }} />;
}



// ─── Inline-style objects ───────────────────────────────────────
const S = {
  /* layout */
  app:         { display:'flex', minHeight:'100vh', fontFamily:fontSans, background:'#080c18', color:'#f1f5f9', WebkitFontSmoothing:'antialiased' },
  sidebar:     { width:220, minWidth:220, background:'#0a0f1e', borderRight:`1px solid #1a2540`, display:'flex', flexDirection:'column', height:'100vh', position:'sticky', top:0, zIndex:10, overflowY:'auto', overflowX:'hidden', transition:'transform .3s ease' },
  sidebarHidden: { transform:'translateX(-100%)' },
  main:        { flex:1, marginLeft:0, padding:'0 20px 20px', minWidth:0, overflowX:'hidden' },
  mainFull:    { marginLeft:0, padding:'0 16px 16px' },

  /* sidebar header */
  sidebarHdr:  { padding:'16px 14px 12px', borderBottom:`1px solid ${C.border}` },
  logoWrap:    { display:'flex', alignItems:'flex-start', gap:10 },
  logoTitle:   { fontSize:'1.2rem', fontWeight:700, color:C.textWhite, letterSpacing:.5, lineHeight:1.2 },
  logoSub:     { fontSize:'.75rem', color:C.textSec, lineHeight:1.3, marginTop:3 },
  logoVer:     { fontSize:'.65rem', color:C.cyan, marginTop:3, fontWeight:500, opacity:.8 },

  /* nav */
  navWrap:     { flex:1, padding:'10px 8px', display:'flex', flexDirection:'column', gap:2 },
  navItem:     { display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, color:C.textSec, textDecoration:'none', fontSize:'.85rem', fontWeight:450, cursor:'pointer', transition:'all .2s', position:'relative', whiteSpace:'nowrap', border:'none', background:'transparent', width:'100%', fontFamily:fontSans },
  navActive:   { color:C.cyan, background:'rgba(34,211,238,.08)', fontWeight:600 },
  navActiveBar:{ content:'', position:'absolute', left:0, top:'20%', width:3, height:'60%', background:C.cyan, borderRadius:'0 3px 3px 0' },
  navIcon:     { width:18, textAlign:'center', fontSize:'.85rem', flexShrink:0 },

  /* db info */
  dbCard:      { background:'rgba(255,255,255,.02)', border:`1px solid ${C.border}`, borderRadius:8, padding:12, margin:'12px 10px 14px' },
  dbTitle:     { fontSize:'.8rem', fontWeight:600, color:C.textPrimary, marginBottom:10, letterSpacing:.3 },
  dbRow:       { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'3px 0', fontSize:'.72rem' },
  dbLabel:     { color:C.textMuted },
  dbVal:       { color:C.textSec, fontWeight:500, textAlign:'right' },

  /* top header */
  header:      { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', gap:16, flexWrap:'wrap' },
  pageTitle:   { fontSize:'1.5rem', fontWeight:700, color:C.textWhite, letterSpacing:.3, lineHeight:1.3 },
  pageSub:     { fontSize:'.8rem', color:C.textSec, marginTop:2 },
  headerRight: { display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' },
  headerCtrl:  { display:'flex', alignItems:'center', gap:6, padding:'7px 12px', background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:8, fontSize:'.78rem', color:C.textSec, whiteSpace:'nowrap' },
  liveBadge:   { display:'flex', alignItems:'center', gap:6, padding:'6px 14px', background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.3)', borderRadius:20, fontSize:'.78rem', color:C.green, fontWeight:600 },
  liveDot:     { width:8, height:8, borderRadius:'50%', background:C.green, animation:'pulseGreen 2s ease-in-out infinite' },
  btnAdd:      { display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:8, color:C.textPrimary, fontSize:'.78rem', cursor:'pointer', fontFamily:fontSans, fontWeight:500, whiteSpace:'nowrap' },

  /* stats row */
  statsRow:    { display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:16 },
  statCard:    { display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, position:'relative', overflow:'hidden', cursor:'default' },
  statBar:     { position:'absolute', top:0, left:0, right:0, height:2 },
  statIcon:    { width:42, height:42, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 },
  statLabel:   { fontSize:'.7rem', color:C.textMuted, fontWeight:500, textTransform:'uppercase', letterSpacing:.5, whiteSpace:'nowrap' },
  statValue:   { fontSize:'1.35rem', fontWeight:700, color:C.textWhite, lineHeight:1.3, whiteSpace:'nowrap' },
  statSub:     { fontSize:'.68rem', color:C.textMuted },

  /* search section */
  search:      { display:'flex', alignItems:'flex-end', gap:14, padding:'14px 16px', background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, marginBottom:16, flexWrap:'wrap' },
  searchGrp:   { display:'flex', flexDirection:'column', gap:5 },
  searchLbl:   { fontSize:'.7rem', color:C.textMuted, fontWeight:500, textTransform:'uppercase', letterSpacing:.3 },
  searchInpW:  { display:'flex', gap:8 },
  searchInp:   { flex:1, padding:'7px 12px', background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:4, color:C.textPrimary, fontSize:'.8rem', fontFamily:fontSans, outline:'none', minWidth:180 },
  btnSearch:   { padding:'7px 18px', background:C.blue, border:'none', borderRadius:4, color:'white', fontSize:'.8rem', fontWeight:600, cursor:'pointer', fontFamily:fontSans, whiteSpace:'nowrap' },
  select:      { padding:'7px 30px 7px 10px', background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:4, color:C.textPrimary, fontSize:'.8rem', fontFamily:fontSans, outline:'none', cursor:'pointer', appearance:'none', WebkitAppearance:'none', backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238892a6' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")", backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center', minWidth:150 },
  selectSmall: { minWidth:60 },
  btnFilter:   { display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:4, color:C.textSec, fontSize:'.8rem', cursor:'pointer', fontFamily:fontSans, whiteSpace:'nowrap' },
  threshWrap:  { display:'flex', alignItems:'center', gap:8 },
  threshVal:   { fontSize:'.75rem', color:C.textMuted, fontWeight:500, minWidth:28 },

  /* panels */
  panel:       { background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' },
  panelHdr:    { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:`1px solid ${C.border}` },
  panelTitle:  { fontSize:'.85rem', fontWeight:600, color:C.textPrimary, whiteSpace:'nowrap' },
  liveInd:     { display:'flex', alignItems:'center', gap:5, fontSize:'.65rem', fontWeight:700, color:C.green, background:'rgba(34,197,94,.1)', padding:'3px 8px', borderRadius:10, letterSpacing:.5 },
  liveIndDot:  { width:6, height:6, borderRadius:'50%', background:C.green, animation:'pulseGreen 2s ease-in-out infinite' },

  /* middle row */
  midRow:      { display:'grid', gridTemplateColumns:'240px 1fr 260px', gap:14, marginBottom:16 },

  /* event details */
  evtDetails:  { padding:'12px 16px' },
  detailRow:   { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 0', gap:8 },
  detailLbl:   { fontSize:'.75rem', color:C.textMuted, whiteSpace:'nowrap' },
  detailVal:   { fontSize:'.78rem', color:C.textPrimary, fontWeight:500, textAlign:'right' },
  mono:        { fontFamily:fontMono },
  highlightY:  { color:C.yellow, fontWeight:600 },
  classBadge:  (type) => ({ display:'inline-block', padding:'2px 8px', borderRadius:4, fontSize:'.72rem', fontWeight:600, letterSpacing:.3,
    background: type==='c'?'rgba(34,211,238,.15)':type==='m'?'rgba(251,191,36,.15)':type==='b'?'rgba(59,130,246,.15)':'rgba(239,68,68,.15)',
    color: type==='c'?C.cyan:type==='m'?C.yellow:type==='b'?C.blue:C.red }),
  classBadgeSmall: (type) => ({ display:'inline-block', padding:'2px 6px', borderRadius:3, fontSize:'.7rem', fontWeight:600,
    background: type==='c'?'rgba(34,211,238,.12)':type==='b'?'rgba(245,158,11,.12)':'rgba(59,130,246,.12)',
    color: type==='c'?C.cyan:type==='b'?C.orange:C.blue }),
  genomeSection: { padding:'10px 16px 14px', borderTop:`1px solid ${C.border}` },
  genomeTitle:   { fontSize:'.75rem', fontWeight:600, color:C.textSec, marginBottom:8 },

  /* table */
  tableWrap:   { flex:1, overflowX:'auto' },
  table:       { width:'100%', borderCollapse:'collapse', fontSize:'.75rem' },
  th:          { padding:'8px 10px', textAlign:'left', fontWeight:600, color:C.textMuted, fontSize:'.68rem', textTransform:'uppercase', letterSpacing:.4, borderBottom:`1px solid ${C.border}`, whiteSpace:'nowrap', background:'rgba(0,0,0,.15)' },
  td:          { padding:'8px 10px', borderBottom:'1px solid rgba(26,37,64,.5)', whiteSpace:'nowrap', color:C.textSec, verticalAlign:'middle' },
  selectedRow: { background:'rgba(34,211,238,.06)' },
  scoreBarC:   { display:'flex', alignItems:'center', gap:8 },
  scoreVal:    { fontWeight:600, color:C.textPrimary, minWidth:30 },
  scoreBar:    { flex:1, height:5, background:'rgba(255,255,255,.06)', borderRadius:3, overflow:'hidden', minWidth:50 },
  scoreFill:   (pct) => ({ height:'100%', borderRadius:3, width:`${pct}%`, background:'linear-gradient(90deg,#22d3ee,#06b6d4)', transition:'width .5s ease' }),
  btnView:     (active) => ({ background:active?'rgba(34,211,238,.1)':'rgba(255,255,255,.05)', border:`1px solid ${active?C.cyan:C.border}`, color:active?C.cyan:C.textMuted, width:28, height:28, borderRadius:4, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem' }),
  viewAll:     { display:'block', textAlign:'center', padding:10, fontSize:'.78rem', color:C.cyan, textDecoration:'none', fontWeight:500, borderTop:`1px solid ${C.border}`, cursor:'pointer', background:'transparent', border:'none', width:'100%', fontFamily:fontSans },

  /* bottom row */
  botRow:      { display:'grid', gridTemplateColumns:'280px 1fr 300px', gap:14 },
  donutContent:{ padding:16, display:'flex', alignItems:'center', gap:20 },
  legend:      { display:'flex', flexDirection:'column', gap:8 },
  legendItem:  { display:'flex', alignItems:'center', gap:8, fontSize:'.75rem', color:C.textSec },
  legendDot:   (bg) => ({ width:10, height:10, borderRadius:'50%', background:bg, flexShrink:0 }),
  legendDotH:  (bc) => ({ width:10, height:10, borderRadius:'50%', background:'transparent', border:`2px solid ${bc}`, flexShrink:0 }),
  legendPct:   { color:C.textMuted, marginLeft:'auto', fontSize:'.7rem' },
  umapContent: { padding:'12px 16px', display:'flex', gap:16 },
  umapChart:   { flex:1, minHeight:220, position:'relative' },
  umapLegend:  { display:'flex', flexDirection:'column', gap:8, justifyContent:'center', minWidth:100 },
  actList:     { flex:1, padding:'8px 0' },
  actRow:      { display:'grid', gridTemplateColumns:'auto auto 1fr', gap:10, padding:'7px 16px', fontSize:'.72rem', alignItems:'center', borderBottom:'1px solid rgba(26,37,64,.3)' },
  actTime:     { color:C.textMuted, fontFamily:fontMono, fontSize:'.65rem', whiteSpace:'nowrap' },
  actAction:   { color:C.textSec, whiteSpace:'nowrap' },
  actDetail:   { color:C.textMuted, fontSize:'.68rem', textAlign:'right', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  actDetailM:  { fontFamily:fontMono, color:C.cyan, opacity:.8 },
  actFooter:   { padding:'12px 16px', borderTop:`1px solid ${C.border}`, marginTop:'auto' },
  btnExport:   { width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'8px 16px', background:'rgba(255,255,255,.04)', border:`1px solid ${C.border}`, borderRadius:8, color:C.textPrimary, fontSize:'.8rem', fontWeight:500, cursor:'pointer', fontFamily:fontSans },

  /* mobile toggle */
  toggle:      { display:'none', position:'fixed', top:14, left:14, zIndex:200, background:C.bgCard, border:`1px solid ${C.border}`, color:C.textPrimary, width:36, height:36, borderRadius:8, cursor:'pointer', alignItems:'center', justifyContent:'center', fontSize:'1rem' },
  overlay:     { display:'none', position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:90 },
};

// ─── Keyframes (inject once) ────────────────────────────────────
const styleId = 'solarguard-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const sheet = document.createElement('style');
  sheet.id = styleId;
  sheet.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');
    @keyframes pulseGreen {
      0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(34,197,94,.4)}
      50%{opacity:.8;box-shadow:0 0 0 4px rgba(34,197,94,0)}
    }
    /* threshold slider */
    input[type=range].sg-slider{-webkit-appearance:none;appearance:none;height:4px;background:#1a2540;border-radius:2px;outline:none;cursor:pointer}
    input[type=range].sg-slider::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#22d3ee;cursor:pointer;box-shadow:0 0 6px rgba(34,211,238,.4)}
    input[type=range].sg-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#22d3ee;cursor:pointer;border:none;box-shadow:0 0 6px rgba(34,211,238,.4)}
    /* scrollbar */
    ::-webkit-scrollbar{width:6px;height:6px}
    ::-webkit-scrollbar-track{background:#060a13}
    ::-webkit-scrollbar-thumb{background:#1e2d4a;border-radius:3px}
    ::-webkit-scrollbar-thumb:hover{background:#2a3a5c}
    /* responsive */
    @media(max-width:1400px){
      .sg-mid-row{grid-template-columns:220px 1fr 240px!important}
      .sg-bot-row{grid-template-columns:250px 1fr 280px!important}
    }
    @media(max-width:1200px){
      .sg-stats-row{grid-template-columns:repeat(3,1fr)!important}
      .sg-mid-row{grid-template-columns:1fr!important}
      .sg-bot-row{grid-template-columns:1fr 1fr!important}
    }
    @media(max-width:1024px){
      .sg-sidebar{transform:translateX(-100%)!important}
      .sg-sidebar.open{transform:translateX(0)!important}
      .sg-toggle{display:flex!important}
      .sg-overlay.active{display:block!important}
      .sg-main{margin-left:0!important;padding:0 16px 16px!important}
      .sg-header{padding-left:48px!important}
      .sg-stats-row{grid-template-columns:repeat(3,1fr)!important}
      .sg-mid-row{grid-template-columns:1fr!important}
      .sg-bot-row{grid-template-columns:1fr!important}
    }
    @media(max-width:768px){
      .sg-stats-row{grid-template-columns:repeat(2,1fr)!important}
      .sg-search{flex-direction:column!important;align-items:stretch!important}
      .sg-donut-content{flex-direction:column!important;align-items:center!important}
      .sg-umap-content{flex-direction:column!important}
      .sg-umap-legend{flex-direction:row!important;flex-wrap:wrap!important;min-width:unset!important}
    }
    @media(max-width:480px){
      .sg-stats-row{grid-template-columns:1fr!important}
      .sg-header{flex-direction:column!important;align-items:flex-start!important}
    }
  `;
  document.head.appendChild(sheet);
}

// ─── Main Component ─────────────────────────────────────────────
export default function SolarMemoryDB() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState("All Classes");
  const [filterRegion, setFilterRegion] = useState("All Regions");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRank, setSelectedRank] = useState(0);
  const [sliderVal, setSliderVal] = useState(75);

  const sliderBg = `linear-gradient(90deg,#22d3ee 0%,#22d3ee ${sliderVal}%,#1a2540 ${sliderVal}%,#1a2540 100%)`;

  const [apiData, setApiData] = useState({
    stats: STATS,
    tableRows: [],
    activities: ACTIVITIES
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMemory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMemoryData();
      setApiData(data);
    } catch (err) {
      setError(err.message || "Failed to load memory data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemory();
  }, []);

  const { stats, tableRows, activities } = apiData;

  // Compute filtered rows based on search query and class filter
  const filteredRows = tableRows.filter(row => {
    const q = searchQuery.toLowerCase();
    const matchQuery = !q || row.id.toLowerCase().includes(q) || row.date.toLowerCase().includes(q) || row.cls.toLowerCase().includes(q);
    const matchClass = filterClass === "All Classes" || filterClass === "Current Event (Live)" || filterClass === "Class" || row.clsType?.toLowerCase() === filterClass.charAt(0).toLowerCase();
    return matchQuery && matchClass;
  });

  return (
    <div style={S.app}>
      {/* ──── Sidebar ──── */}
      <Sidebar activePage="Solar Memory DB" />

      <main className="sg-main" style={S.main}>
        {error && (
          <div style={{ margin: "16px 0 0", background: "rgba(239,68,68,0.15)", border: `1px solid #ef4444`, padding: "10px 14px", borderRadius: 8, color: "#f87171", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Failed to sync live data: {error}</span>
            <button onClick={fetchMemory} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 14px", borderRadius: 5, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Retry Connection</button>
          </div>
        )}
        <div style={{ opacity: isLoading ? 0.6 : 1, transition: "opacity 0.2s" }}>
          {/* Header */}
          <header className="sg-header" style={S.header}>
          <div>
            <h1 style={S.pageTitle}>Solar Memory Database</h1>
            <p style={S.pageSub}>Historical solar flare events stored as 64-D flare genomes</p>
          </div>
          <div style={S.headerRight}>
            <div style={S.headerCtrl}><i className="fas fa-calendar-alt" style={{color:C.textMuted,fontSize:'.75rem'}}/><span>2024-09-02</span></div>
            <div style={S.headerCtrl}><i className="fas fa-clock" style={{color:C.textMuted,fontSize:'.75rem'}}/><span>12:15:30 IST</span></div>
            <div style={S.liveBadge}><span style={S.liveDot}/><span>Live</span></div>
            <button style={S.btnAdd} onClick={() => toast("Add new event modal")}><i className="fas fa-plus" style={{fontSize:'.7rem'}}/><span>Add New Event</span></button>
          </div>
        </header>

        {/* Stats Row */}
        <section className="sg-stats-row" style={S.statsRow}>
          {stats.map((s,i) => (
            <div key={i} style={S.statCard}>
              <div style={{...S.statBar, background:s.grad}} />
              <div style={{...S.statIcon, background:s.bg, color:s.color}}>
                <i className={s.icon} />
              </div>
              <div style={{display:'flex',flexDirection:'column',minWidth:0}}>
                <span style={S.statLabel}>{s.label}</span>
                <span style={S.statValue}>{s.value}</span>
                <span style={S.statSub}>{s.sub}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Search Section */}
        <section className="sg-search" style={S.search}>
          <div style={{...S.searchGrp, flex:1, minWidth:200}}>
            <label style={S.searchLbl}>Search Similar Events</label>
            <div style={S.searchInpW}>
              <input style={S.searchInp} placeholder="Search by Event ID, Date, Class..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <button style={S.btnSearch} onClick={() => toast(`Searching for ${searchQuery}`)}>Search</button>
            </div>
          </div>
          <div style={S.searchGrp}>
            <label style={S.searchLbl}>Search by</label>
            <select style={S.select} value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
              <option>Current Event (Live)</option><option>Event ID</option><option>Date Range</option><option>Class</option>
            </select>
          </div>
          <div style={S.searchGrp}>
            <label style={S.searchLbl}>Top K Results</label>
            <select style={{...S.select,...S.selectSmall}} value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)}>
              <option>5</option><option>10</option><option>15</option><option>20</option>
            </select>
          </div>
          <div style={S.searchGrp}>
            <label style={S.searchLbl}>&nbsp;</label>
            <button style={S.btnFilter} onClick={() => toast("Open advanced filters")}><i className="fas fa-sliders-h"/><span>Filters</span></button>
          </div>
          <div style={{...S.searchGrp, minWidth:200, flex:.7}}>
            <label style={S.searchLbl}>Similarity Threshold</label>
            <div style={S.threshWrap}>
              <span style={S.threshVal}>0.00</span>
              <input type="range" className="sg-slider" min={0} max={100} value={sliderVal} onChange={e => setSliderVal(e.target.value)} style={{flex:1,background:sliderBg}} />
              <span style={S.threshVal}>1.00</span>
            </div>
          </div>
        </section>

        {/* ── Middle Row ── */}
        <section className="sg-mid-row" style={S.midRow}>
          {/* Query Event */}
          <div style={S.panel}>
            <div style={S.panelHdr}>
              <h3 style={S.panelTitle}>Query Event (Current)</h3>
              <span style={S.liveInd}><span style={S.liveIndDot}/> LIVE</span>
            </div>
            <div style={S.evtDetails}>
              {[
                ['Event ID',       <span key="eid" style={{...S.detailVal,...S.mono,fontSize:'.72rem'}}>QRY-2024-09-02-121530</span>],
                ['Date & Time (IST)', '2024-09-02 12:15:30'],
                ['Predicted Class', <span key="pc" style={S.classBadge('c')}>C-Class</span>],
                ['Probability',     <span key="pr" style={S.highlightY}>44.7%</span>],
                ['Hardening Ratio', '1.014'],
                ['Anomaly Score',   <span key="as" style={S.highlightY}>0.18</span>],
                ['Lead Time (Est.)','10 min'],
              ].map(([l,v],i) => (
                <div key={i} style={S.detailRow}>
                  <span style={S.detailLbl}>{l}</span>
                  <span style={S.detailVal}>{v}</span>
                </div>
              ))}
            </div>
            <div style={S.genomeSection}>
              <h4 style={S.genomeTitle}>Query Genome (64-D Fingerprint)</h4>
              <GenomeCanvas seed={42} height={80} />
              <GenomeScale />
            </div>
          </div>

          {/* Similar Events Table */}
          <div style={{...S.panel, display:'flex', flexDirection:'column'}}>
            <div style={S.panelHdr}>
              <h3 style={S.panelTitle}>Top 5 Most Similar Events</h3>
            </div>
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {['Similarity Rank','Historical Event','Observation Time','GOES Class','Similarity %','Peak Flux','Distance','View'].map((h,i) => (
                      <th key={i} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length > 0 ? filteredRows.map((r,i) => (
                    <tr key={i} style={selectedRank===i ? S.selectedRow : {}}>
                      <td style={S.td}>{r.rank}</td>
                      <td style={{...S.td,...S.mono,fontSize:'.68rem',color:C.textPrimary}}>{r.id}</td>
                      <td style={S.td}>{r.date}</td>
                      <td style={S.td}><span style={S.classBadgeSmall(r.clsType)}>{r.cls}</span></td>
                      <td style={S.td}>
                        <div style={S.scoreBarC}>
                          <span style={S.scoreVal}>{(r.score * 100).toFixed(1)}%</span>
                          <div style={S.scoreBar}><div style={S.scoreFill(r.score*100)}/></div>
                        </div>
                      </td>
                      <td style={S.td}>{r.peak_flux ? r.peak_flux.toExponential(2) : "0.00e+0"}</td>
                      <td style={S.td}>{r.distance}</td>
                      <td style={S.td}>
                        <button style={S.btnView(selectedRank===i)} onClick={() => setSelectedRank(i)}>
                          <i className="fas fa-eye"/>
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="8" style={{...S.td, textAlign:'center', padding:'20px', color:C.textMuted}}>
                        No matching events found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <button style={S.viewAll}>View All Similar Events →</button>
          </div>

          {/* Selected Similar Event */}
          <div style={S.panel}>
            <div style={S.panelHdr}>
              <h3 style={S.panelTitle}>Selected Similar Event (Rank #{selectedRank+1})</h3>
            </div>
            <div style={S.evtDetails}>
              {filteredRows.length > 0 ? [
                ['Event ID',       <span key="sid" style={{...S.detailVal,...S.mono,fontSize:'.72rem'}}>{filteredRows[selectedRank]?.id || ''}</span>],
                ['Date & Time (IST)', filteredRows[selectedRank]?.date || ''],
                ['Class',           <span key="sc" style={S.classBadge(filteredRows[selectedRank]?.clsType)}>{filteredRows[selectedRank]?.cls || ''}</span>],
                ['Peak Time',       '12:28:30'],
                ['Peak Flux (Soft)',<span key="pfs">{filteredRows[selectedRank]?.peak_flux ? filteredRows[selectedRank].peak_flux.toExponential(2) : "0.00e+0"} W/m²</span>],
                ['Hardening Ratio', '1.12'],
                ['Distance',   <span key="asm" style={S.highlightY}>{filteredRows[selectedRank]?.distance || ''}</span>],
                ['Lead Time (Actual)', '10 min'],
              ].map(([l,v],i) => (
                <div key={i} style={S.detailRow}>
                  <span style={S.detailLbl}>{l}</span>
                  <span style={S.detailVal}>{v}</span>
                </div>
              )) : (
                <div style={{color:C.textMuted, padding:'10px 0', fontSize:'0.8rem'}}>No event selected</div>
              )}
            </div>
            <div style={S.genomeSection}>
              <h4 style={S.genomeTitle}>Event Genome (64-D Fingerprint)</h4>
              <GenomeCanvas seed={17 + selectedRank * 7} height={80} />
              <GenomeScale />
            </div>
          </div>
        </section>

        {/* ── Bottom Row ── */}
        <section className="sg-bot-row" style={S.botRow}>
          {/* Class Distribution */}
          <div style={S.panel}>
            <div style={S.panelHdr}><h3 style={S.panelTitle}>Class Distribution in DB</h3></div>
            <div className="sg-donut-content" style={S.donutContent}>
              <DonutChart />
              <div style={S.legend}>
                {[
                  [C.cyan,'C-Class','62.3% (537)'],[C.yellow,'M-Class','28.7% (247)'],
                  [C.blue,'B-Class','7.3% (63)'],[C.red,'X-Class','1.7% (16)'],
                ].map(([c,l,p],i) => (
                  <div key={i} style={S.legendItem}>
                    <span style={S.legendDot(c)}/><span>{l}</span><span style={S.legendPct}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* UMAP */}
          <div style={S.panel}>
            <div style={S.panelHdr}><h3 style={S.panelTitle}>Solar Memory Database Map (UMAP Projection)</h3></div>
            <div className="sg-umap-content" style={S.umapContent}>
              <div style={S.umapChart}><UMAPChart /></div>
              <div className="sg-umap-legend" style={S.umapLegend}>
                {[
                  [C.cyan,'C-Class','dot'],[C.yellow,'M-Class','dot'],[C.blue,'B-Class','dot'],[C.red,'X-Class','dot'],
                  [C.green,'Query Event','hollow'],[C.purple,'Similar Events','hollow'],
                ].map(([c,l,t],i) => (
                  <div key={i} style={S.legendItem}>
                    <span style={t==='dot'?S.legendDot(c):S.legendDotH(c)}/><span>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div style={{...S.panel, display:'flex', flexDirection:'column'}}>
            <div style={S.panelHdr}><h3 style={S.panelTitle}>Recent Database Activities</h3></div>
            <div style={S.actList}>
              {activities.map((a,i) => (
                <div key={i} style={S.actRow}>
                  <span style={S.actTime}>{a.time}</span>
                  <span style={S.actAction}>{a.action}</span>
                  <span style={{...S.actDetail,...(a.mono?S.actDetailM:{})}}>{a.detail}</span>
                </div>
              ))}
            </div>
            <div style={S.actFooter}>
              <button style={S.btnExport} onClick={() => toast("Exporting Solar Memory DB")}><i className="fas fa-download" style={{fontSize:'.75rem'}}/><span>Export Database</span></button>
            </div>
          </div>
        </section>
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
        <radialGradient id="sgSunG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="70%" stopColor="#f59e0b"/>
          <stop offset="100%" stopColor="#d97706"/>
        </radialGradient>
      </defs>
      <circle cx={24} cy={24} r={10} fill="url(#sgSunG)"/>
      <circle cx={24} cy={24} r={10} fill="none" stroke="#fbbf2455" strokeWidth={1}/>
      <ellipse cx={24} cy={24} rx={16} ry={6} fill="none" stroke="#22d3ee" strokeWidth={1.2} opacity={.6} transform="rotate(-20 24 24)"/>
      <ellipse cx={24} cy={24} rx={20} ry={8} fill="none" stroke="#3b82f6" strokeWidth={1} opacity={.4} transform="rotate(15 24 24)"/>
      <circle cx={38} cy={18} r={2.5} fill="#22d3ee" opacity={.8}/>
      <circle cx={10} cy={28} r={2} fill="#3b82f6" opacity={.7}/>
    </svg>
  );
}
