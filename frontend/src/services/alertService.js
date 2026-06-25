import { apiClient } from './api';
import { 
  TIMELINE, ALERT_DETAILS, ALERT_HISTORY, REGION_INFO 
} from '../data/alertsData';

export const getAlertsData = async () => {
  try {
    const data = await apiClient.get('/alerts');
    
    // Map active alerts to the top of the history
    const mappedHistory = [...ALERT_HISTORY];
    if (data.active_alerts && data.active_alerts.length > 0) {
      mappedHistory.unshift({
        time: data.alert_time || "Now",
        type: data.alert_severity === "High" ? "FLARE_DETECT" : "SYSTEM_WARN",
        region: "AR 3724",
        desc: data.active_alerts[0],
        classVal: "M-Class"
      });
    }

    return {
      timeline: TIMELINE,
      alertDetails: ALERT_DETAILS,
      alertHistory: mappedHistory,
      regionInfo: REGION_INFO
    };
  } catch (error) {
    throw error;
  }
};

export default {
  getAlertsData
};
