import { apiClient } from './api';
import { METRICS, CONFUSION_MATRIX } from '../data/reportsData';

export const getReportsData = async () => {
  try {
    const data = await apiClient.get('/reports');
    
    return {
      metrics: METRICS,
      confusionMatrix: CONFUSION_MATRIX,
      latestReport: data.latest_report || "No Report Available",
      reportSummary: data.report_summary || "N/A"
    };
  } catch (error) {
    throw error;
  }
};

export default {
  getReportsData
};
