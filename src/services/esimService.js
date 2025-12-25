/**
 * eSIM Service
 * Handles all API calls related to eSIM status checking
 */

import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 240000, // 240 seconds (4 minutes) - For accounts with many eSIMs
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
    console.log('🔍 Checking eSIM status for:', iccid);
    console.log('🌐 API URL:', `${API_BASE_URL}${API_ENDPOINTS.CHECK_ESIM}`);
    
    const response = await apiClient.post(API_ENDPOINTS.CHECK_ESIM, { iccid });
    
    console.log('✅ eSIM status check successful:', response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('❌ eSIM status check failed:', error);
    
    // Enhanced error handling
    let errorDetails = { error: 'Network Error', details: error.message };
    
    if (error.response) {
      // Server responded with error status
      errorDetails = error.response.data || {
        error: `Server Error (${error.response.status})`,
        details: error.response.statusText || 'Unknown server error'
      };
      console.error('Server response:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response received (timeout or network error)
      if (error.code === 'ECONNABORTED') {
        errorDetails = {
          error: 'Request Timeout',
          details: 'The search took longer than 4 minutes. If you have 100+ eSIMs in your account, please try again or contact support.'
        };
      } else {
        errorDetails = {
          error: 'Connection Error',
          details: 'Cannot connect to the backend server. Please check if the server is running.'
        };
      }
      console.error('No response received:', error.request);
    }
    
    return {
      success: false,
      error: errorDetails,
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

