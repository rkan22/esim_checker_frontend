import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/esim';

/**
 * Currency Service for handling currency conversions and rates
 */
class CurrencyService {
  /**
   * Get list of supported currencies
   * @returns {Promise<Array>} Array of currency objects
   */
  async getSupportedCurrencies() {
    try {
      const response = await axios.get(`${API_BASE_URL}/currency/supported/`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching supported currencies:', error);
      // Return fallback currencies
      return [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
      ];
    }
  }

  /**
   * Get exchange rate between two currencies
   * @param {string} from - Source currency code
   * @param {string} to - Target currency code
   * @returns {Promise<Object>} Rate information
   */
  async getExchangeRate(from = 'USD', to = 'EUR') {
    try {
      const response = await axios.get(`${API_BASE_URL}/currency/exchange-rate/`, {
        params: { from, to }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      throw new Error(`Failed to get exchange rate: ${error.message}`);
    }
  }

  /**
   * Convert amount between currencies
   * @param {number} amount - Amount to convert
   * @param {string} fromCurrency - Source currency code
   * @param {string} toCurrency - Target currency code
   * @returns {Promise<Object>} Conversion result with original and converted amounts
   */
  async convertAmount(amount, fromCurrency = 'USD', toCurrency = 'EUR') {
    try {
      const response = await axios.post(`${API_BASE_URL}/currency/convert/`, {
        amount: parseFloat(amount),
        from_currency: fromCurrency,
        to_currency: toCurrency
      });
      return response.data.data;
    } catch (error) {
      console.error('Error converting currency:', error);
      throw new Error(`Failed to convert currency: ${error.message}`);
    }
  }

  /**
   * Convert multiple amounts at once (for package list)
   * @param {Array} amounts - Array of amounts to convert
   * @param {string} fromCurrency - Source currency code
   * @param {string} toCurrency - Target currency code
   * @returns {Promise<Array>} Array of conversion results
   */
  async convertMultipleAmounts(amounts, fromCurrency = 'USD', toCurrency = 'EUR') {
    try {
      const promises = amounts.map(amount => 
        this.convertAmount(amount, fromCurrency, toCurrency)
      );
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error converting multiple amounts:', error);
      throw new Error(`Failed to convert amounts: ${error.message}`);
    }
  }

  /**
   * Format currency amount with symbol
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount, currency = 'USD') {
    const symbols = {
      'USD': '$',
      'EUR': '€'
    };

    const symbol = symbols[currency] || currency;
    const formattedAmount = parseFloat(amount).toFixed(2);

    // For currencies with symbol before amount
    if (['USD'].includes(currency)) {
      return `${symbol}${formattedAmount}`;
    }
    // For EUR, symbol after amount
    return `${formattedAmount}${symbol}`;
  }

  /**
   * Get currency symbol
   * @param {string} currency - Currency code
   * @returns {string} Currency symbol
   */
  getCurrencySymbol(currency = 'USD') {
    const symbols = {
      'USD': '$',
      'EUR': '€'
    };
    return symbols[currency] || currency;
  }
}

// Export singleton instance
const currencyService = new CurrencyService();
export default currencyService;

