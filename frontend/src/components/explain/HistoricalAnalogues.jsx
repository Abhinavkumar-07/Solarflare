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
    padding: '12px',
    borderRadius: '8px',
    borderLeft: '4px solid #10B981',
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
  text: {
    fontSize: '13px',
    color: '#D0D0E0',
    lineHeight: '1.4'
  },
  meta: {
    fontSize: '12px',
    color: '#64748B',
    marginTop: '2px'
  }
};

const HistoricalAnalogues = ({ analogues = [] }) => {
  if (!analogues || analogues.length === 0) return null;

  return (
    <div style={S.card}>
      <div style={S.header}><i className="fas fa-history"></i> Historical Analogues</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
        {analogues.slice(0, 3).map((event, i) => (
          <div key={i} style={S.item}>
            <div style={S.itemHeader}>
              <span>{event.goes_class} Class Event</span>
              <span style={{color: '#10B981'}}>{event.similarity_score.toFixed(1)}% Match</span>
            </div>
            <div style={S.meta}>
              {new Date(event.timestamp).toLocaleString()} | Peak Flux: {event.peak_flux.toExponential(2)}
            </div>
            <div style={S.text}>
              {event.scientific_relevance}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoricalAnalogues;
