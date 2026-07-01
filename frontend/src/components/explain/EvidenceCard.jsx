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
  item: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: '12px 16px',
    borderRadius: '8px',
    borderLeft: '4px solid #3B82F6',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: '#FFFFFF'
  },
  explanation: {
    fontSize: '13px',
    lineHeight: '1.5',
    color: '#D0D0E0'
  },
  meta: {
    display: 'flex',
    gap: '12px',
    fontSize: '11px',
    color: '#64748B',
    marginTop: '4px'
  }
};

const EvidenceCard = ({ evidence = [] }) => {
  if (!evidence || evidence.length === 0) return null;

  return (
    <div style={S.card}>
      <div style={S.header}><i className="fas fa-microscope"></i> Deterministic Evidence</div>
      {evidence.map((ev, i) => (
        <div key={i} style={S.item}>
          <div style={S.itemHeader}>
            <span>{ev.title}</span>
            <span style={{color: '#3B82F6'}}>{typeof ev.value === 'number' ? ev.value.toFixed(2) : ev.value}</span>
          </div>
          <div style={S.explanation}>{ev.explanation}</div>
          <div style={S.meta}>
            <span><i className="fas fa-code-branch"></i> {ev.source}</span>
            <span><i className="fas fa-microchip"></i> Stage: {ev.pipeline_stage}</span>
            <span><i className="far fa-clock"></i> {new Date(ev.generated_at).toLocaleTimeString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EvidenceCard;
