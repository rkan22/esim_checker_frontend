/**
 * eSIM Service
 * Handles all API calls related to eSIM status checking
 */

import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds (API calls multiple providers)
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Check eSIM status by ICCID
 * @param {string} iccid - The ICCID to check
 * @returns {Promise} API response with eSIM details
 */
export const checkESIMStatus = async (iccid) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.CHECK_ESIM, { iccid });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { error: 'Network Error', details: error.message },
    };
  }
};

/**
 * Check API health status
 * @returns {Promise} API health status
 */
export const checkHealth = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.HEALTH);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { error: 'Network Error' },
    };
  }
};

/**
 * Get query statistics
 * @returns {Promise} Query statistics
 */
export const getStats = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.STATS);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { error: 'Network Error' },
    };
  }
};

export default {
  checkESIMStatus,
  checkHealth,
  getStats,
};

