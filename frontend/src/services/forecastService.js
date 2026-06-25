import { delay } from './api';
import { 
  hardeningData, energyData, timeTicks, 
  latestForecasts, keyIndicators, features 
} from '../data/forecastData';

export const getForecastData = async () => {
  await delay(150); // Simulate network latency
  return {
    hardeningData,
    energyData,
    timeTicks,
    latestForecasts,
    keyIndicators,
    features
  };
};

export default {
  getForecastData
};
