import { apiClient } from './api';

export const getExplainData = async () => {
  try {
    const data = await apiClient.get('/explain');
    return data;
  } catch (error) {
    throw error;
  }
};

export default {
  getExplainData
};
