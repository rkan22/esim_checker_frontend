/**
 * API Configuration
 * Centralized API endpoints and base URL configuration
 */

// Determine the appropriate API base URL
const getApiBaseUrl = () => {
  // If environment variable is set, use it (highest priority)
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // Auto-detect based on current environment
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Local development - Django dev server
    return 'http://127.0.0.1:8000';
  } else {
    // Production environment
    return 'https://esim-status-checker-backend.onrender.com';
  }
};

// Base URL for the backend API
export const API_BASE_URL = getApiBaseUrl();

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

// Debug logging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Configuration:', {
    hostname: window.location.hostname,
    apiBaseUrl: API_BASE_URL,
    environment: process.env.NODE_ENV,
    envVariable: process.env.REACT_APP_API_BASE_URL || 'Not set'
  });
}