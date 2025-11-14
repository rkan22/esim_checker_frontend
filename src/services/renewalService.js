import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/esim';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get available renewal packages
 * @param {string} provider - Optional provider filter (AIRHUB, ESIMCARD, TRAVELROAM)
 * @returns {Promise<Object>} Response with packages list
 */
export const getRenewalPackages = async (provider = null) => {
  try {
    const params = provider ? { provider } : {};
    const response = await apiClient.get('/renewal/packages/', { params });
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
 * Create a renewal order
 * @param {Object} orderData - Order details
 * @param {string} orderData.iccid - ICCID of the eSIM
 * @param {string} orderData.package_id - Package ID
 * @param {string} orderData.provider - Provider name
 * @param {number} orderData.amount - Amount to charge
 * @param {string} orderData.currency - Currency code (default: USD)
 * @returns {Promise<Object>} Response with order and payment details
 */
export const createRenewalOrder = async (orderData) => {
  try {
    const response = await apiClient.post('/renewal/create/', orderData);
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
 * Confirm payment and complete renewal order
 * @param {Object} paymentData - Payment data (can include session_id or payment_intent_id)
 * @returns {Promise<Object>} Response with order details
 */
export const confirmPayment = async (paymentData) => {
  try {
    const response = await apiClient.post('/renewal/confirm-payment/', paymentData);
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
 * Get renewal order details
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Response with order details
 */
export const getRenewalOrder = async (orderId) => {
  try {
    const response = await apiClient.get(`/renewal/order/${orderId}/`);
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
 * Send eSIM details via email
 * @param {Object} emailData - Email details
 * @param {string} emailData.order_id - Order ID
 * @param {string} emailData.recipient_email - Recipient's email address
 * @param {string} emailData.email_type - Type of email ('details' or 'confirmation')
 * @returns {Promise<Object>} Response with success status
 */
export const sendESIMEmail = async (emailData) => {
  try {
    const response = await apiClient.post('/email/send/', emailData);
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

export default {
  getRenewalPackages,
  createRenewalOrder,
  confirmPayment,
  getRenewalOrder,
  sendESIMEmail,
};

