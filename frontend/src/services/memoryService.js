import { apiClient } from './api';
import { STATS, TABLE_ROWS, ACTIVITIES } from '../data/memoryData';

export const getMemoryData = async () => {
  try {
    const data = await apiClient.get('/memory');
    
    // Map backend metadata to frontend TABLE_ROWS format
    const historicalRows = (data.historical_flare_metadata || []).map((item, idx) => ({
      id: `EV-${idx}`,
      date: item.timestamp || "2024-09-02 12:00:00",
      region: "AR 3724", // Mocked region since metadata doesn't have it
      class: item.goes_class || "C-Class",
      duration: "14m",
      match: data.similarity_scores ? (data.similarity_scores[idx] * 100).toFixed(1) + "%" : "89.2%"
    }));

    return {
      stats: STATS,
      tableRows: historicalRows.length > 0 ? historicalRows : TABLE_ROWS,
      activities: ACTIVITIES
    };
  } catch (error) {
    throw error;
  }
};

export default {
  getMemoryData
};
