import { apiClient } from './api';
import { SIMILAR_EVENTS } from '../data/dashboardData';

export const getDashboardData = async () => {
  try {
    const data = await apiClient.get('/dashboard');
    return {
      similarEvents: SIMILAR_EVENTS, // keep mock similar events
      current_solar_status: data.current_solar_status || 'Unknown',
      mission_status: data.mission_status || 'Unknown',
      hardening_index: data.hardening_index || 0,
      last_update_time: data.last_update_time || '',
      forecast_probability: data.forecast_probability || 0,
      active_alert: !!data.active_alert
    };
  } catch (error) {
    throw error;
  }
};

export default {
  getDashboardData
};
