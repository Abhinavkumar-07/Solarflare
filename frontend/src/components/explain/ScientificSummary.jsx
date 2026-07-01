import React from 'react';

const S = {
  card: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  header: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#60A5FA',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  textBlock: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#E0E0FF',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  conclusion: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: '4px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(59, 130, 246, 0.2)'
  },
  confidence: {
    fontSize: '12px',
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: '4px'
  }
};

const ScientificSummary = ({ summary, confidence }) => {
  if (!summary) return null;

  return (
    <div style={S.card}>
      <div style={S.header}><i className="fas fa-file-alt"></i> Scientific Summary</div>
      <div style={S.textBlock}>
        <div>{summary.summary}</div>
        <div style={S.conclusion}>{summary.conclusion}</div>
        
        {confidence && (
          <div style={S.confidence}>
            <i className="fas fa-info-circle"></i> {confidence.explanation} (Source: {confidence.source})
          </div>
        )}
      </div>
    </div>
  );
};

export default ScientificSummary;
