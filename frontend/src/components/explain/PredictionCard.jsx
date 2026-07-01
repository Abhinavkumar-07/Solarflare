import React from 'react';

const S = {
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  header: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#A0A0C0',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  row: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  pill: {
    padding: '6px 12px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    gap: '6px',
    alignItems: 'center'
  }
};

const PredictionCard = ({ prediction }) => {
  if (!prediction) return null;

  return (
    <div style={S.card}>
      <div style={S.header}><i className="fas fa-bullseye"></i> Prediction</div>
      <div style={S.row}>
        <div style={S.pill}>
          <span style={{color: '#A0A0C0'}}>Class:</span> 
          <span style={{color: '#3B82F6'}}>{prediction.predicted_flare_class}</span>
        </div>
        <div style={S.pill}>
          <span style={{color: '#A0A0C0'}}>Probability:</span> 
          <span style={{color: '#10B981'}}>{(prediction.probability * 100).toFixed(1)}%</span>
        </div>
        <div style={S.pill}>
          <span style={{color: '#A0A0C0'}}>Confidence:</span> 
          <span style={{color: '#F59E0B'}}>{(prediction.confidence * 100).toFixed(1)}%</span>
        </div>
        <div style={S.pill}>
          <span style={{color: '#A0A0C0'}}>Hardening Ratio:</span> 
          <span style={{color: '#8B5CF6'}}>{prediction.hardening_ratio.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;
