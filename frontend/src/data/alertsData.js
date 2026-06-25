export const TIMELINE = [
  { time:'12:00:00', title:'Normal', desc:'All parameters within normal range', col:'#22c55e', past:true },
  { time:'12:08:20', title:'Elevated Activity', desc:'Spectral hardening ratio exceeded threshold', col:'#fbbf24', past:true },
  { time:'12:11:05', title:'Forecast Trigger', desc:'Flare probability > 30%', col:'#f59e0b', past:true },
  { time:'12:15:30', title:'Watch Issued', desc:'M-class flare possible (Lead time: 10 min)', col:'#ef4444', past:true },
  { time:'12:25:30', title:'Potential Peak (Est.)', desc:'Estimated time of flare peak', col:'#8892a6', past:false },
  { time:'12:35:30', title:'Event End (Est.)', desc:'Activity expected to return to normal', col:'#8892a6', past:false },
];

export const ALERT_DETAILS = [
  { lbl:'Alert ID', val:'ALT-20240902-121530' },
  { lbl:'Alert Type', val:'Watch' },
  { lbl:'Predicted Class', val:'M-Class' },
  { lbl:'Probability', val:'44.7%' },
  { lbl:'Lead Time', val:'10 min' },
  { lbl:'Issued At', val:'2024-09-02 12:15:30 IST' },
  { lbl:'Data Source', val:'SoLEXS + HEL1OS' },
  { lbl:'Status', val:'Active', badge:'#fbbf24' },
];

export const ALERT_HISTORY = [
  { t:'2024-09-02 12:15:30', ty:'Watch', tyC:'#f59e0b', c:'M-Class', cC:'#f59e0b', p:'44.7%', l:'10 min', s:'Active', sC:'#fbbf24', bC:'rgba(251,191,36,0.1)' },
  { t:'2024-09-01 08:32:10', ty:'Elevated', tyC:'#fbbf24', c:'C-Class', cC:'#fbbf24', p:'28.3%', l:'-', s:'Ended', sC:'#8892a6', bC:'rgba(255,255,255,0.05)' },
  { t:'2024-08-31 15:45:22', ty:'Warning', tyC:'#ef4444', c:'M-Class', cC:'#f59e0b', p:'62.1%', l:'12 min', s:'Ended', sC:'#8892a6', bC:'rgba(255,255,255,0.05)' },
  { t:'2024-08-30 11:20:05', ty:'Watch', tyC:'#f59e0b', c:'C-Class', cC:'#fbbf24', p:'33.6%', l:'8 min', s:'Ended', sC:'#8892a6', bC:'rgba(255,255,255,0.05)' },
  { t:'2024-08-29 07:10:15', ty:'Normal', tyC:'#22c55e', c:'B-Class', cC:'#3b82f6', p:'12.4%', l:'-', s:'Ended', sC:'#8892a6', bC:'rgba(255,255,255,0.05)' },
];

export const REGION_INFO = [
  { l:'Region ID', v:'AR3786', vc:'#e2e8f0' },
  { l:'Location', v:'N15E23', vc:'#e2e8f0' },
  { l:'Area', v:'980 MH', vc:'#e2e8f0' },
  { l:'Magnetic Class', v:'Beta-Gamma-Delta', vc:'#e2e8f0' },
  { l:'Flare Potential', v:'High', vc:'#f59e0b' },
];
