import React, { useEffect, useState } from 'react';
import { getExplainData } from '../../services/explainService';

import PredictionCard from './PredictionCard';
import EvidenceCard from './EvidenceCard';
import HistoricalAnalogues from './HistoricalAnalogues';
import GenomeSummary from './GenomeSummary';
import ScientificSummary from './ScientificSummary';

const S = {
  container: {
    backgroundColor: '#1E1E2E',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid rgba(255,255,255,0.05)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    color: '#E0E0FF',
    fontFamily: '"Inter", sans-serif',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    height: '100%',
    overflowY: 'auto'
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: '12px'
  },
  loadingText: {
    color: '#A0A0C0',
    fontSize: '14px',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '20px'
  },
  errorText: {
    color: '#EF4444',
    fontSize: '14px',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(239, 68, 68, 0.3)'
  }
};

const ExplainPanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setError(null);
        const res = await getExplainData();
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      } catch (err) {
        console.error("ExplainPanel failed to load", err);
        if (mounted) {
          setError("Failed to fetch explainability data.");
          setLoading(false);
        }
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div style={S.container}>
        <div style={S.title}><i className="fas fa-brain" style={{color: '#8B5CF6'}}></i> Intelligence Engine</div>
        <div style={S.loadingText}>Synthesizing evidence...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={S.container}>
        <div style={S.title}><i className="fas fa-brain" style={{color: '#8B5CF6'}}></i> Intelligence Engine</div>
        <div style={S.errorText}>{error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={S.container}>
      <div style={S.title}>
        <i className="fas fa-brain" style={{color: '#8B5CF6'}}></i> 
        SolarGuard Intelligence Engine
      </div>
      
      <PredictionCard prediction={data.prediction} />
      <EvidenceCard evidence={data.evidence} />
      <HistoricalAnalogues analogues={data.historical_analogues} />
      <GenomeSummary genome={data.genome_summary} />
      <ScientificSummary summary={data.scientific_summary} confidence={data.confidence_explanation} />
      
    </div>
  );
};

export default ExplainPanel;
