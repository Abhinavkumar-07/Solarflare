import { delay } from './api';
import { 
  TIMELINE, ALERT_DETAILS, ALERT_HISTORY, REGION_INFO 
} from '../data/alertsData';

export const getAlertsData = async () => {
  await delay(150);
  return {
    timeline: TIMELINE,
    alertDetails: ALERT_DETAILS,
    alertHistory: ALERT_HISTORY,
    regionInfo: REGION_INFO
  };
};

export default {
  getAlertsData
};
