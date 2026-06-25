import { delay } from './api';
import { METRICS, CONFUSION_MATRIX } from '../data/reportsData';

export const getReportsData = async () => {
  await delay(150);
  return {
    metrics: METRICS,
    confusionMatrix: CONFUSION_MATRIX
  };
};

export default {
  getReportsData
};
