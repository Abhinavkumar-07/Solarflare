import { apiClient } from './api';
import { 
  HEATMAP_DATA, LABELS, SELECTED, TOP_MATCH, 
  ROWS, EVENTS, CONTRIBS 
} from '../data/genomeData';

export const getGenomeData = async () => {
  try {
    const data = await apiClient.get('/genome');
    
    return {
      heatmapData: data.heatmapData && data.heatmapData.length > 0 ? data.heatmapData : HEATMAP_DATA,
      labels: data.labels && data.labels.length > 0 ? data.labels : LABELS,
      selected: SELECTED,
      topMatch: TOP_MATCH,
      rows: ROWS,
      events: EVENTS,
      contribs: CONTRIBS,
      latentVector: data.latent_vector || [],
      flareGenome: data.flare_genome || "Unknown Genome"
    };
  } catch (error) {
    throw error;
  }
};

export default {
  getGenomeData
};
