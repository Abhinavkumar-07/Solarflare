import React, { useEffect, useRef, useState } from 'react';

/* ================================================================
   SolarGuard – Alerts Page (High Fidelity & Fully Responsive)
   A single self-contained React component (JSX) with embedded CSS.
   ================================================================ */

let ChartJS = null;

// ─── Embedded CSS (Option 1: Fully Responsive, No External Setup required) ───
const styles = `
  /* Global Resets inside the app scope */
  .sg-app {
    display: flex;
    min-height: 100vh;
    font-family: 'Inter', system-ui, sans-serif;
    background: #050810;
    color: #e2e8f0;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  
  .sg-app * {
    box-sizing: border-box;
  }

  /* Typography Utilities */
  .text-white { color: #ffffff; }
  .text-primary { color: #e2e8f0; }
  .text-sec { color: #8892a6; }
  .text-muted { color: #5a6478; }
  
  .text-cyan { color: #22d3ee; }
  .text-blue { color: #3b82f6; }
  .text-purple { color: #a855f7; }
  .text-green { color: #22c55e; }
  .text-yellow { color: #fbbf24; }
  .text-orange { color: #f59e0b; }
  .text-red { color: #ef4444; }
  .text-light-red { color: #f87171; }

  /* Sidebar */
  .sg-sidebar {
    width: 220px;
    min-width: 220px;
    background: #0a0e1a;
    border-right: 1px solid #1a233a;
    display: flex;
    flex-direction: column;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    overflow-y: auto;
    transition: transform 0.3s ease;
  }
  
  .sg-sidebar-hdr { padding: 16px 14px 12px; border-bottom: 1px solid #1a233a; }
  .sg-nav-wrap { flex: 1; padding: 10px 8px; display: flex; flex-direction: column; gap: 2px; }
  .sg-nav-btn {
    display: flex; alignItems: center; gap: 10px; padding: 9px 12px; border-radius: 8px;
    font-size: 0.85rem; cursor: pointer; border: none; text-align: left; transition: all 0.2s;
  }
  .sg-nav-btn.active { background: #3b82f6; color: #ffffff; font-weight: 600; }
  .sg-nav-btn:not(.active) { background: transparent; color: #8892a6; font-weight: 450; }
  .sg-nav-btn:not(.active):hover { background: rgba(255,255,255,0.05); color: #e2e8f0; }
  
  /* Main Content Area */
  .sg-main {
    flex: 1;
    margin-left: 220px;
    padding: 0 24px 24px;
    min-width: 0;
    display: flex;
    flex-direction: column;
    transition: margin-left 0.3s ease;
  }

  /* Header */
  .sg-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 0 20px; gap: 16px; flex-wrap: wrap; }
  .sg-page-title { font-size: 1.6rem; font-weight: 700; color: #ffffff; letter-spacing: 0; line-height: 1.2; margin: 0; }
  .sg-page-sub { font-size: 0.85rem; color: #8892a6; margin-top: 4px; }
  .sg-hdr-right { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  
  .sg-mobile-toggle { display: none; background: transparent; border: 1px solid #263352; color: #e2e8f0; padding: 8px; border-radius: 6px; cursor: pointer; }

  /* Grids */
  .sg-top-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .sg-mid-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .sg-btm-grid { display: grid; grid-template-columns: 1.4fr 0.9fr 0.9fr; gap: 16px; }

  /* Cards */
  .sg-card-red { background: linear-gradient(to right, rgba(42,10,10,0.8), #0d1322); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px; padding: 16px 20px; display: flex; align-items: center; gap: 20px; }
  .sg-card-dark { background: #0d1322; border: 1px solid #1a233a; border-radius: 10px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; gap: 10px;}
  .sg-panel { background: #0d1322; border: 1px solid #1a233a; border-radius: 10px; display: flex; flex-direction: column; overflow: hidden; }
  .sg-p-hdr { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 0.85rem; font-weight: 600; color: #3b82f6; }
  .sg-p-body { padding: 20px; flex: 1; display: flex; flex-direction: column; }

  /* Timeline */
  .sg-tl-item { display: flex; gap: 16px; position: relative; padding-bottom: 20px; }
  .sg-tl-time { width: 65px; font-size: 0.75rem; color: #8892a6; padding-top: 2px; flex-shrink: 0; }
  
  /* Tables */
  .sg-table-responsive { overflow-x: auto; width: 100%; }
  .sg-h-table { width: 100%; border-collapse: collapse; font-size: 0.75rem; min-width: 500px; }
  .sg-h-table th { padding: 10px 8px; text-align: left; font-weight: 500; color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.05); white-space: nowrap; }
  .sg-h-table td { padding: 12px 8px; border-bottom: 1px solid rgba(255,255,255,0.02); white-space: nowrap; }

  /* Region Info Layout */
  .sg-reg-card { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; display: flex; gap: 16px; padding: 16px; }

  /* ================= MEDIA QUERIES for RESPONSIVENESS ================= */
  
  /* Large Tablets / Small Laptops */
  @media (max-width: 1400px) {
    .sg-top-grid { grid-template-columns: 1fr 1fr 1fr; }
    .sg-card-red { grid-column: span 3; } /* Make the red card take full width of the 3 cols */
    .sg-btm-grid { grid-template-columns: 1fr 1fr; }
    .sg-panel-history { grid-column: span 2; } /* Make history table full width of the 2 cols */
  }

  /* Tablets */
  @media (max-width: 1024px) {
    .sg-sidebar { transform: translateX(-100%); } /* Hide sidebar completely */
    .sg-sidebar.open { transform: translateX(0); } /* Show when toggled */
    .sg-main { margin-left: 0; padding: 0 16px 16px; }
    .sg-mobile-toggle { display: block; } /* Show hamburger */
    
    .sg-mid-grid { grid-template-columns: 1fr 1fr; }
    .sg-panel-details { grid-column: span 2; } /* Details stretches */
  }

  /* Mobile */
  @media (max-width: 768px) {
    .sg-top-grid { grid-template-columns: 1fr; }
    .sg-card-red { grid-column: span 1; flex-direction: column; text-align: center; }
    
    .sg-mid-grid { grid-template-columns: 1fr; }
    .sg-panel-details { grid-column: span 1; }
    
    .sg-btm-grid { grid-template-columns: 1fr; }
    .sg-panel-history { grid-column: span 1; }
    
    .sg-reg-card { flex-direction: column; align-items: center; text-align: center; }
    .sg-header { flex-direction: column; align-items: flex-start; }
    .sg-hdr-right { width: 100%; justify-content: space-between; }
  }
`;

// ─── Sub-components: Charts ──────────────────────────────────────

function GaugeChart() {
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
          labels: ['Low', 'Moderate', 'High', 'Extreme'],
          datasets: [{
            data: [33.3, 33.3, 16.7, 16.7],
            backgroundColor: ['#22c55e', '#fbbf24', '#f59e0b', '#ef4444'],
            borderWidth: 0,
            circumference: 180,
            rotation: 270,
            borderRadius: [5, 5]
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '80%',
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
        }
      });
    });
    return () => { cancelled = true; if (chartRef.current) chartRef.current.destroy(); };
  }, []);
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '240px', height: '120px', margin: '0 auto', marginTop: '20px' }}>
      <canvas ref={ref} />
      {/* Gauge Needle pointing to High */}
      <div style={{ position:'absolute', bottom: -5, left:'50%', transform:'translateX(-50%) rotate(40deg)', transformOrigin:'bottom center', width:4, height:'60%', background:'#fff', borderRadius:2, zIndex:2 }}>
        <div style={{ position:'absolute', bottom:-6, left:-4, width:12, height:12, borderRadius:'50%', background:'#fff' }}/>
      </div>
      <div style={{ position:'absolute', top:20, left:-10, fontSize:'.7rem', color:'#8892a6'}}>Low</div>
      <div style={{ position:'absolute', top:-15, left:'50%', transform:'translateX(-50%)', fontSize:'.7rem', color:'#8892a6'}}>Moderate</div>
      <div style={{ position:'absolute', top:20, right:-10, fontSize:'.7rem', color:'#8892a6'}}>High</div>
      <div style={{ position:'absolute', top:80, right:-15, fontSize:'.7rem', color:'#8892a6'}}>Extreme</div>
    </div>
  );
}

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
    ctx.lineWidth = 1.5;
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
  return <canvas ref={ref} style={{ width: '100%', height: `${height}px`, marginTop:'8px' }} />;
}

// ─── Data ───────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon:'fas fa-th-large',    label:'Dashboard' },
  { icon:'fas fa-chart-line',  label:'Light Curves' },
  { icon:'fas fa-chart-bar',   label:'Hardening & Forecast' },
  { icon:'fas fa-dna',         label:'Flare Genome' },
  { icon:'fas fa-database',    label:'Solar Memory DB' },
  { icon:'fas fa-bell',        label:'Alerts', active:true },
  { icon:'fas fa-file-alt',    label:'Reports' },
  { icon:'fas fa-cog',         label:'Settings' },
  { icon:'fas fa-info-circle', label:'About' },
];

const TIMELINE = [
  { time:'12:00:00', title:'Normal', desc:'All parameters within normal range', col:'#22c55e', past:true },
  { time:'12:08:20', title:'Elevated Activity', desc:'Spectral hardening ratio exceeded threshold', col:'#fbbf24', past:true },
  { time:'12:11:05', title:'Forecast Trigger', desc:'Flare probability > 30%', col:'#f59e0b', past:true },
  { time:'12:15:30', title:'Watch Issued', desc:'M-class flare possible (Lead time: 10 min)', col:'#ef4444', past:true },
  { time:'12:25:30', title:'Potential Peak (Est.)', desc:'Estimated time of flare peak', col:'#8892a6', past:false },
  { time:'12:35:30', title:'Event End (Est.)', desc:'Activity expected to return to normal', col:'#8892a6', past:false },
];

const ALERT_DETAILS = [
  { lbl:'Alert ID', val:'ALT-20240902-121530' },
  { lbl:'Alert Type', val:'Watch' },
  { lbl:'Predicted Class', val:'M-Class' },
  { lbl:'Probability', val:'44.7%' },
  { lbl:'Lead Time', val:'10 min' },
  { lbl:'Issued At', val:'2024-09-02 12:15:30 IST' },
  { lbl:'Data Source', val:'SoLEXS + HEL1OS' },
  { lbl:'Status', val:'Active', badge:'#fbbf24' },
];

const ALERT_HISTORY = [
  { t:'2024-09-02 12:15:30', ty:'Watch', tyC:'#f59e0b', c:'M-Class', cC:'#f59e0b', p:'44.7%', l:'10 min', s:'Active', sC:'#fbbf24', bC:'rgba(251,191,36,0.1)' },
  { t:'2024-09-01 08:32:10', ty:'Elevated', tyC:'#fbbf24', c:'C-Class', cC:'#fbbf24', p:'28.3%', l:'-', s:'Ended', sC:'#8892a6', bC:'rgba(255,255,255,0.05)' },
  { t:'2024-08-31 15:45:22', ty:'Warning', tyC:'#ef4444', c:'M-Class', cC:'#f59e0b', p:'62.1%', l:'12 min', s:'Ended', sC:'#8892a6', bC:'rgba(255,255,255,0.05)' },
  { t:'2024-08-30 11:20:05', ty:'Watch', tyC:'#f59e0b', c:'C-Class', cC:'#fbbf24', p:'33.6%', l:'8 min', s:'Ended', sC:'#8892a6', bC:'rgba(255,255,255,0.05)' },
  { t:'2024-08-29 07:10:15', ty:'Normal', tyC:'#22c55e', c:'B-Class', cC:'#3b82f6', p:'12.4%', l:'-', s:'Ended', sC:'#8892a6', bC:'rgba(255,255,255,0.05)' },
];

const REGION_INFO = [
  { l:'Region ID', v:'AR3786', vc:'#e2e8f0' },
  { l:'Location', v:'N15E23', vc:'#e2e8f0' },
  { l:'Area', v:'980 MH', vc:'#e2e8f0' },
  { l:'Magnetic Class', v:'Beta-Gamma-Delta', vc:'#e2e8f0' },
  { l:'Flare Potential', v:'High', vc:'#f59e0b' },
];

export default function SolarAlerts() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <style>{styles}</style>
      <div className="sg-app">
        
        {/* ──── Overlay for Mobile Sidebar ──── */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', zIndex:90 }}
          />
        )}

        {/* ──── Sidebar ──── */}
        <aside className={`sg-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sg-sidebar-hdr">
            <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
              <SunLogo />
              <div style={{ display:'flex', flexDirection:'column', minWidth:0 }}>
                <span style={{ fontSize:'1.2rem', fontWeight:700, color:'#fff', letterSpacing:.5, lineHeight:1.2 }}>SolarGuard</span>
                <span style={{ fontSize:'.75rem', color:'#8892a6', lineHeight:1.3, marginTop:3 }}>Solar Flare Forecasting &amp;<br/>Nowcasting System</span>
                <span style={{ fontSize:'.65rem', color:'#22c55e', marginTop:3, fontWeight:500, opacity:.8 }}>Aditya-L1 (SoLEXS + HEL1OS)</span>
              </div>
            </div>
          </div>
          <nav className="sg-nav-wrap">
            {NAV_ITEMS.map((n,i) => (
              <button key={i} className={`sg-nav-btn ${n.active ? 'active' : ''}`}>
                <i className={n.icon} style={{ width:18, textAlign:'center', fontSize:'.85rem' }} />
                <span>{n.label}</span>
              </button>
            ))}
          </nav>
          <div style={{ padding:'16px 14px', borderTop:'1px solid #1a233a', display:'flex', flexDirection:'column', gap:'12px' }}>
            <div>
              <div style={{ fontSize:'.75rem', color:'#8892a6' }}>System Status</div>
              <div style={{ fontSize:'.8rem', color:'#e2e8f0', fontWeight:500, display:'flex', alignItems:'center', gap:6 }}><span style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e' }}/> Normal</div>
            </div>
            <div>
              <div style={{ fontSize:'.75rem', color:'#8892a6' }}>Data Source</div>
              <div style={{ fontSize:'.8rem', color:'#22c55e', fontWeight:500 }}>Aditya-L1 (SoLEXS + HEL1OS)</div>
            </div>
            <div>
              <div style={{ fontSize:'.75rem', color:'#8892a6' }}>Last Updated</div>
              <div style={{ fontSize:'.75rem', color:'#8892a6', fontWeight:500 }}>2024-09-02 12:45:30 IST</div>
            </div>
          </div>
        </aside>

        {/* ──── Main Content ──── */}
        <main className="sg-main">
          
          <header className="sg-header">
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <button className="sg-mobile-toggle" onClick={() => setSidebarOpen(true)}>
                <i className="fas fa-bars" />
              </button>
              <div>
                <h1 className="sg-page-title">Alerts</h1>
                <p className="sg-page-sub">Monitor real-time alerts and warning notifications</p>
              </div>
            </div>
            <div className="sg-hdr-right">
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', border:'1px solid #263352', borderRadius:8, fontSize:'.75rem', color:'#8892a6' }}>
                <i className="far fa-calendar-alt"/> 2024-09-02 <i className="fas fa-chevron-down" style={{fontSize:'.6rem'}}/>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', border:'1px solid #263352', borderRadius:8, fontSize:'.75rem', color:'#8892a6' }}>
                <i className="far fa-clock"/> 12:45:30 IST <i className="fas fa-chevron-down" style={{fontSize:'.6rem'}}/>
              </div>
              <button style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 20px', background:'#3b82f6', border:'none', borderRadius:8, fontSize:'.75rem', color:'#fff', fontWeight:600, cursor:'pointer' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#fff', boxShadow:'0 0 8px rgba(255,255,255,0.8)' }}/> Live
              </button>
            </div>
          </header>

          {/* ── Top Row Metrics ── */}
          <div className="sg-top-grid">
            {/* Current Alert (Wide Card) */}
            <div className="sg-card-red">
              <div style={{ width:70, height:70, borderRadius:'50%', background:'rgba(239, 68, 68, 0.1)', border:'2px solid rgba(239, 68, 68, 0.5)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <i className="fas fa-exclamation-triangle" style={{ fontSize:'2rem', color:'#f87171' }} />
              </div>
              <div>
                <div style={{ fontSize:'.7rem', color:'#f87171', textTransform:'uppercase', fontWeight:600, letterSpacing:0.5 }}>CURRENT ALERT</div>
                <div style={{ fontSize:'1.6rem', fontWeight:800, color:'#f87171', margin:'2px 0 4px', letterSpacing:0.5 }}>WATCH</div>
                <div style={{ fontSize:'.9rem', color:'#e2e8f0' }}>M-class flare possible<br/>in next 10 minutes</div>
                <div style={{ fontSize:'.7rem', color:'#8892a6', marginTop:4 }}>Issued at 12:15:30 IST</div>
              </div>
            </div>

            <div className="sg-card-dark">
              <div>
                <div style={{ fontSize:'.7rem', color:'#8892a6', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>Alert Level</div>
                <div style={{ fontSize:'1.4rem', fontWeight:700, color:'#fbbf24' }}>Watch</div>
              </div>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'#fbbf2415', color:'#fbbf24', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', border:'1px solid #fbbf2430' }}><i className="fas fa-exclamation-circle"/></div>
            </div>
            <div className="sg-card-dark">
              <div>
                <div style={{ fontSize:'.7rem', color:'#8892a6', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>Predicted Class</div>
                <div style={{ fontSize:'1.4rem', fontWeight:700, color:'#f59e0b' }}>M-Class</div>
              </div>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'#f59e0b15', color:'#f59e0b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', border:'1px solid #f59e0b30' }}><i className="fas fa-sun"/></div>
            </div>
            <div className="sg-card-dark">
              <div>
                <div style={{ fontSize:'.7rem', color:'#8892a6', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>Probability</div>
                <div style={{ fontSize:'1.4rem', fontWeight:700, color:'#a855f7' }}>44.7%</div>
              </div>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'#a855f715', color:'#a855f7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', border:'1px solid #a855f730' }}><i className="fas fa-chart-line"/></div>
            </div>
            <div className="sg-card-dark">
              <div>
                <div style={{ fontSize:'.7rem', color:'#8892a6', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>Lead Time (Est.)</div>
                <div style={{ fontSize:'1.4rem', fontWeight:700, color:'#22c55e' }}>10 min</div>
              </div>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'#22c55e15', color:'#22c55e', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', border:'1px solid #22c55e30' }}><i className="far fa-clock"/></div>
            </div>
          </div>

          {/* ── Middle Grid ── */}
          <div className="sg-mid-grid">
            {/* Alert Timeline */}
            <div className="sg-panel">
              <div className="sg-p-hdr">Alert Timeline (Today)</div>
              <div className="sg-p-body">
                {TIMELINE.map((t,i) => (
                  <div key={i} className="sg-tl-item">
                    <div className="sg-tl-time">{t.time}</div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', position:'relative', zIndex:1 }}>
                      <div style={{ width:10, height:10, borderRadius:'50%', background: !t.past ? '#0d1322' : t.col, border:`2px solid ${t.col}`, zIndex:2, marginTop:4 }} />
                      {i !== TIMELINE.length - 1 && <div style={{ position:'absolute', top:14, bottom:-4, width:2, background:t.past?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.05)', zIndex:1 }} />}
                    </div>
                    <div style={{ flex:1, paddingTop:2 }}>
                      <div style={{ fontSize:'.8rem', fontWeight:600, color:t.col, marginBottom:4 }}>{t.title}</div>
                      <div style={{ fontSize:'.7rem', color:'#8892a6', lineHeight:1.4 }}>{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert Severity */}
            <div className="sg-panel">
              <div className="sg-p-hdr">Alert Severity</div>
              <div className="sg-p-body" style={{ alignItems:'center', justifyContent:'center' }}>
                <GaugeChart />
                <div style={{ fontSize:'1.4rem', fontWeight:700, color:'#f59e0b', marginTop:30 }}>High</div>
                <div style={{ fontSize:'.85rem', color:'#e2e8f0', marginTop:6, textAlign:'center' }}>Enhanced solar activity detected</div>
              </div>
            </div>

            {/* Alert Details */}
            <div className="sg-panel sg-panel-details">
              <div className="sg-p-hdr">Alert Details</div>
              <div className="sg-p-body" style={{ padding: '16px 20px' }}>
                {ALERT_DETAILS.map((d,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom: i===ALERT_DETAILS.length-1 ? 'none' : '1px solid rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize:'.75rem', color:'#8892a6' }}>{d.lbl}</span>
                    {d.badge ? (
                      <span style={{ padding:'2px 8px', background:`${d.badge}20`, color:d.badge, borderRadius:4, fontSize:'.7rem', border:`1px solid ${d.badge}40` }}>{d.val}</span>
                    ) : (
                      <span style={{ fontSize:'.75rem', color:'#e2e8f0', fontWeight:500, textAlign:'right' }}>{d.val}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Bottom Grid ── */}
          <div className="sg-btm-grid">
            {/* Alert History */}
            <div className="sg-panel sg-panel-history">
              <div className="sg-p-hdr">Alert History (Recent 7 Days)</div>
              <div style={{ flex:1, padding:'10px 20px' }} className="sg-table-responsive">
                <table className="sg-h-table">
                  <thead>
                    <tr>
                      <th>Time (IST)</th>
                      <th>Alert Type</th>
                      <th>Predicted Class</th>
                      <th>Probability</th>
                      <th>Lead Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ALERT_HISTORY.map((h,i) => (
                      <tr key={i}>
                        <td>{h.t}</td>
                        <td style={{ color:h.tyC, fontWeight:500 }}>{h.ty}</td>
                        <td style={{ color:h.cC, fontWeight:600 }}>{h.c}</td>
                        <td>{h.p}</td>
                        <td>{h.l}</td>
                        <td>
                          <span style={{ padding:'2px 8px', color:h.sC, borderRadius:4, fontSize:'.7rem', border:`1px solid ${h.sC}40`, background:h.bC }}>{h.s}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ textAlign:'center', padding:'12px', borderTop:'1px solid rgba(255,255,255,0.03)' }}>
                <a href="#" style={{ fontSize:'.75rem', color:'#3b82f6', textDecoration:'none', fontWeight:500 }}>View All Alerts <i className="fas fa-arrow-right" style={{fontSize:'.65rem', marginLeft:4}}/></a>
              </div>
            </div>

            {/* Current Active Region */}
            <div className="sg-panel">
              <div className="sg-p-hdr">Current Active Region (Latest)</div>
              <div className="sg-p-body">
                <div className="sg-reg-card">
                  <div style={{ width:120, height:120, borderRadius:8, overflow:'hidden', position:'relative', border:'1px solid rgba(255,255,255,0.1)', flexShrink:0, margin:'0 auto' }}>
                    <SunImage />
                    {/* Bounding box */}
                    <div style={{ position:'absolute', top:45, left:45, width:30, height:30, border:'1px solid rgba(255,255,255,0.7)', background:'rgba(255,255,255,0.1)' }}>
                      <div style={{ position:'absolute', top:12, left:10, width:6, height:6, background:'#ef4444', borderRadius:'50%', boxShadow:'0 0 6px red' }} />
                    </div>
                  </div>
                  <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
                    {REGION_INFO.map((r,i) => (
                      <div key={i} style={{ marginBottom:10 }}>
                        <div style={{ fontSize:'.65rem', color:'#8892a6', marginBottom:2 }}>{r.l}</div>
                        <div style={{ fontSize:'.75rem', color:r.vc, fontWeight:600 }}>{r.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ textAlign:'center', padding:'12px', borderTop:'1px solid rgba(255,255,255,0.03)' }}>
                <a href="#" style={{ fontSize:'.75rem', color:'#3b82f6', textDecoration:'none', fontWeight:500 }}>View Region Details</a>
              </div>
            </div>

            {/* Alert Metrics */}
            <div className="sg-panel">
              <div className="sg-p-hdr">Alert Metrics (Today)</div>
              <div className="sg-p-body">
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:'.75rem', color:'#8892a6', marginBottom:4 }}>Spectral Hardening Ratio</div>
                  <div style={{ fontSize:'1.1rem', fontWeight:700, color:'#22d3ee' }}>1.014</div>
                  <Sparkline data={[1, 1.002, 1.005, 1.003, 1.010, 1.008, 1.014, 1.012]} color="#22d3ee" height={24} />
                </div>
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:'.75rem', color:'#8892a6', marginBottom:4 }}>Flare Probability</div>
                  <div style={{ fontSize:'1.1rem', fontWeight:700, color:'#a855f7' }}>44.7%</div>
                  <Sparkline data={[10, 15, 12, 25, 20, 35, 44.7, 42]} color="#a855f7" height={24} />
                </div>
                <div>
                  <div style={{ fontSize:'.75rem', color:'#8892a6', marginBottom:4 }}>X-ray Flux (1-8 Å)</div>
                  <div style={{ fontSize:'1.1rem', fontWeight:700, color:'#22c55e' }}>2.35e-6</div>
                  <Sparkline data={[1e-7, 1.2e-7, 1.5e-7, 5e-7, 8e-7, 1.5e-6, 2.35e-6, 2.1e-6]} color="#22c55e" height={24} />
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}

/* ---- Small left-nav Sun Logo ---- */
function SunLogo() {
  return (
    <svg viewBox="0 0 48 48" width={42} height={42} style={{flexShrink:0,marginTop:2}}>
      <defs>
        <radialGradient id="sgSunGA" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="70%" stopColor="#f59e0b"/>
          <stop offset="100%" stopColor="#d97706"/>
        </radialGradient>
      </defs>
      <circle cx={24} cy={24} r={10} fill="url(#sgSunGA)"/>
      <circle cx={24} cy={24} r={10} fill="none" stroke="#fbbf2455" strokeWidth={1}/>
      <ellipse cx={24} cy={24} rx={16} ry={6} fill="none" stroke="#22d3ee" strokeWidth={1.2} opacity={.6} transform="rotate(-20 24 24)"/>
      <ellipse cx={24} cy={24} rx={20} ry={8} fill="none" stroke="#3b82f6" strokeWidth={1} opacity={.4} transform="rotate(15 24 24)"/>
      <circle cx={38} cy={18} r={2.5} fill="#22d3ee" opacity={.8}/>
      <circle cx={10} cy={28} r={2} fill="#3b82f6" opacity={.7}/>
    </svg>
  );
}

/* ---- High Fidelity Sun Placeholder (SDO AIA 304 Style) ---- */
function SunImage() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <radialGradient id="sdo304" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde047"/>
          <stop offset="30%" stopColor="#eab308"/>
          <stop offset="70%" stopColor="#a16207"/>
          <stop offset="90%" stopColor="#451a03"/>
          <stop offset="100%" stopColor="#000000"/>
        </radialGradient>
        <filter id="turb">
          <feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="3" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 0.5 0" in="noise" result="coloredNoise" />
          <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="texture" />
          <feBlend mode="multiply" in="texture" in2="SourceGraphic" />
        </filter>
      </defs>
      <rect width="100" height="100" fill="#000" />
      <circle cx="50" cy="50" r="45" fill="url(#sdo304)" />
      <circle cx="50" cy="50" r="45" fill="url(#sdo304)" filter="url(#turb)" opacity="0.6" />
      <circle cx="60" cy="60" r="8" fill="#fef08a" opacity="0.8" filter="blur(2px)"/>
      <circle cx="40" cy="30" r="5" fill="#fef08a" opacity="0.6" filter="blur(1px)"/>
    </svg>
  );
}
