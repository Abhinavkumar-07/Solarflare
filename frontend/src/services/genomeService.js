import { delay } from './api';
import { 
  HEATMAP_DATA, LABELS, SELECTED, TOP_MATCH, 
  ROWS, EVENTS, CONTRIBS 
} from '../data/genomeData';

export const getGenomeData = async () => {
  await delay(150);
  return {
    heatmapData: HEATMAP_DATA,
    labels: LABELS,
    selected: SELECTED,
    topMatch: TOP_MATCH,
    rows: ROWS,
    events: EVENTS,
    contribs: CONTRIBS
  };
};

export default {
  getGenomeData
};
