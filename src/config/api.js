/**
 * API Configuration
 * Centralized API endpoints and base URL configuration
 */

// Base URL for the backend API
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  // eSIM endpoints
  CHECK_ESIM: '/api/esim/check/',
  HEALTH: '/api/esim/health/',
  STATS: '/api/esim/stats/',
};

// Full API URLs
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

// Export for easy access
export default {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: API_ENDPOINTS,
  getUrl: getApiUrl,
};

