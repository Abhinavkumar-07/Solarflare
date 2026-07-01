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
  textBlock: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: '12px',
    borderRadius: '8px',
    borderLeft: '4px solid #8B5CF6',
    fontSize: '13px',
    lineHeight: '1.5',
    color: '#D0D0E0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  pillRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '4px'
  },
  dimPill: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    color: '#D8B4FE',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500'
  }
};

const GenomeSummary = ({ genome }) => {
  if (!genome) return null;

  return (
    <div style={S.card}>
      <div style={S.header}><i className="fas fa-dna"></i> Genome Interpretation</div>
      <div style={S.textBlock}>
        <div><strong>Characteristics:</strong> {genome.genome_characteristics}</div>
        <div><strong>Reconstruction:</strong> {genome.reconstruction_quality}</div>
        <div><strong>Interpretation:</strong> {genome.interpretation}</div>
        
        {genome.dominant_latent_dimensions && genome.dominant_latent_dimensions.length > 0 && (
          <div style={{marginTop: '4px'}}>
            <div style={{fontSize: '12px', color: '#A0A0C0', marginBottom: '4px'}}>Dominant Dimensions:</div>
            <div style={S.pillRow}>
              {genome.dominant_latent_dimensions.map((dim, i) => (
                <div key={i} style={S.dimPill}>{dim}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenomeSummary;
