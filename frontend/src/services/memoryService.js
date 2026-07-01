import { apiClient } from './api';
import { STATS, ACTIVITIES } from '../data/memoryData';

export const getMemoryData = async () => {
  try {
    const data = await apiClient.get('/memory');
    
    // Map backend metadata to frontend TABLE_ROWS format
    const nearestEvents = data.nearest_historical_events || [];
    
    const tableRows = nearestEvents.map((item, idx) => ({
      rank: item.rank || idx + 1,
      id: item.event_id || `EVT-${idx}`,
      date: item.timestamp || "2024-09-02 12:00:00",
      cls: item.goes_class || "C1.0",
      clsType: (item.goes_class && item.goes_class.charAt(0).toLowerCase()) || 'c',
      score: item.similarity_score || 0,
      peak_flux: item.peak_flux || 0,
      distance: (1.0 - (item.similarity_score || 0)).toFixed(3)
    }));

    return {
      stats: STATS,
      tableRows: tableRows,
      activities: ACTIVITIES
    };
  } catch (error) {
    throw error;
  }
};

export default {
  getMemoryData
};
