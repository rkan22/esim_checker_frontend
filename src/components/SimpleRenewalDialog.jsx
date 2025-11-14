import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Paper,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import currencyService from '../services/currencyService';

const SimpleRenewalDialog = ({ open, onClose, esimData, onConfirmRenewal }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [convertedPrice, setConvertedPrice] = useState(null);
  const [converting, setConverting] = useState(false);

  // Base price for renewal (can be made dynamic based on provider/plan)
  const basePrice = 10.00;

  useEffect(() => {
    if (open) {
      fetchCurrencies();
    }
  }, [open]);

  useEffect(() => {
    if (selectedCurrency !== 'USD') {
      convertPrice();
    } else {
      setConvertedPrice(null);
    }
  }, [selectedCurrency]);

  const fetchCurrencies = async () => {
    try {
      const currencies = await currencyService.getSupportedCurrencies();
      setAvailableCurrencies(currencies);
    } catch (error) {
      console.error('Error fetching currencies:', error);
    }
  };

  const convertPrice = async () => {
    setConverting(true);
    try {
      const result = await currencyService.convertAmount(
        basePrice,
        'USD',
        selectedCurrency
      );
      setConvertedPrice(result);
    } catch (error) {
      console.error('Error converting price:', error);
    } finally {
      setConverting(false);
    }
  };

  const handleConfirm = () => {
    onConfirmRenewal(selectedCurrency);
  };

  const displayPrice = converting ? '...' : convertedPrice 
    ? convertedPrice.formatted_converted 
    : `$${basePrice.toFixed(2)} USD`;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#ffffff',
          color: '#1a1a1a',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: '#ffffff',
        color: '#1a1a1a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pt: 3,
        pb: 2,
        px: 3,
      }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
          Renew Your eSIM Plan
        </Typography>
        <IconButton 
          onClick={onClose} 
          size="small"
          sx={{ color: '#6b7280', '&:hover': { color: '#1a1a1a', backgroundColor: '#f3f4f6' } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 2 }}>
        {esimData && (
          <Box>
            {/* Current Plan Details */}
            <Typography variant="h6" sx={{ color: '#1a1a1a', mb: 2, fontWeight: 600, fontSize: '1.1rem' }}>
              Current Plan Details
            </Typography>
            
            <Paper 
              elevation={0}
              sx={{ 
                p: 2.5, 
                mb: 3, 
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.95rem' }}>
                  Plan
                </Typography>
                <Typography variant="body2" sx={{ color: '#1a1a1a', fontWeight: 600, fontSize: '0.95rem' }}>
                  {esimData.data_capacity || '5 GB'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.95rem' }}>
                  Data Capacity
                </Typography>
                <Typography variant="body2" sx={{ color: '#1a1a1a', fontWeight: 600, fontSize: '0.95rem' }}>
                  {esimData.data_capacity || '5 GB'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.95rem' }}>
                  Validity
                </Typography>
                <Typography variant="body2" sx={{ color: '#1a1a1a', fontWeight: 600, fontSize: '0.95rem' }}>
                  {esimData.validity || '20 days'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.95rem' }}>
                  Provider
                </Typography>
                <Typography variant="body2" sx={{ color: '#1a1a1a', fontWeight: 600, fontSize: '0.95rem' }}>
                  {esimData.api_provider || 'ExampleTel'}
                </Typography>
              </Box>
            </Paper>

            {/* Info Message */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                mb: 3, 
                backgroundColor: '#eff6ff',
                border: '1px solid #dbeafe',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
              }}
            >
              <InfoIcon sx={{ color: '#3b82f6', fontSize: '1.25rem', mt: 0.2 }} />
              <Typography variant="body2" sx={{ color: '#1e40af', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Your eSIM plan will be renewed immediately after payment is completed.
              </Typography>
            </Paper>

            {/* Payment Currency */}
            <Typography variant="h6" sx={{ color: '#1a1a1a', mb: 1.5, fontWeight: 600, fontSize: '1rem' }}>
              Payment Currency
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <Select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                sx={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e5e7eb',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d1d5db',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1a1a1a',
                  },
                  '& .MuiSelect-select': {
                    color: '#1a1a1a',
                    fontWeight: 500,
                  },
                }}
              >
                {availableCurrencies.map((currency) => (
                  <MenuItem key={currency.code} value={currency.code}>
                    {currency.code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Renewal Price */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#1a1a1a', fontWeight: 600, fontSize: '1rem' }}>
                Renewal Price
              </Typography>
              {converting ? (
                <CircularProgress size={24} sx={{ color: '#1a1a1a' }} />
              ) : (
                <Typography variant="h4" sx={{ color: '#1a1a1a', fontWeight: 700, fontSize: '2rem' }}>
                  {displayPrice}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          fullWidth
          sx={{ 
            color: '#1a1a1a',
            borderColor: '#e5e7eb',
            textTransform: 'none',
            fontWeight: 600,
            py: 1.5,
            borderRadius: '8px',
            fontSize: '1rem',
            '&:hover': { 
              borderColor: '#d1d5db',
              backgroundColor: '#f9fafb'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: '#1a1a1a',
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            py: 1.5,
            borderRadius: '8px',
            fontSize: '1rem',
            '&:hover': {
              backgroundColor: '#2d2d2d',
            }
          }}
        >
          Proceed to Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimpleRenewalDialog;
