import { delay } from './api';
import { SIMILAR_EVENTS } from '../data/dashboardData';

export const getDashboardData = async () => {
  await delay(150);
  return {
    similarEvents: SIMILAR_EVENTS
  };
};

export default {
  getDashboardData
};
