import { delay } from './api';
import { STATS, TABLE_ROWS, ACTIVITIES } from '../data/memoryData';

export const getMemoryData = async () => {
  await delay(150);
  return {
    stats: STATS,
    tableRows: TABLE_ROWS,
    activities: ACTIVITIES
  };
};

export default {
  getMemoryData
};
