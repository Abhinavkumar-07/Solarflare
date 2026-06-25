import { apiClient } from './api';
import { 
  hardeningData, energyData, timeTicks, 
  latestForecasts, keyIndicators, features 
} from '../data/forecastData';

export const getForecastData = async () => {
  try {
    const data = await apiClient.get('/forecast');
    
    // Create a new array so we don't mutate the original mock reference directly
    const mergedForecasts = [...latestForecasts];
    if (data.predicted_flare_class) {
      mergedForecasts[0] = {
        ...mergedForecasts[0],
        prob: Math.round((data.flare_probability || 0) * 100),
        class: data.predicted_flare_class,
        trend: 'Live',
        status: data.active_alert ? 'Alert' : 'Nominal'
      };
    }

    // Merge hardening ratio into keyIndicators
    const mergedIndicators = [...keyIndicators];
    mergedIndicators[1] = {
      ...mergedIndicators[1],
      value: (data.hardening_ratio || 1.14).toFixed(2),
      sub: 'Live calculation'
    };

    return {
      hardeningData, // fallback to mock series to keep charts drawn
      energyData,
      timeTicks,
      latestForecasts: mergedForecasts,
      keyIndicators: mergedIndicators,
      features
    };
  } catch (error) {
    throw error;
  }
};

export default {
  getForecastData
};
