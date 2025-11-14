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
  Alert,
  Paper,
} from '@mui/material';
import {
  AttachMoney as CurrencyIcon,
  Close as CloseIcon,
  Refresh as RenewIcon,
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

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1e3a8a',
          color: '#ffffff',
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(45deg, #1e3a8a 30%, #0891b2 90%)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
          🔄 Renew Your eSIM Plan
        </Typography>
        <CloseIcon 
          onClick={onClose} 
          sx={{ cursor: 'pointer', '&:hover': { color: '#0891b2' } }}
        />
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {esimData && (
          <Box>
            <Paper sx={{ p: 2, mb: 3, backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <Typography variant="h6" sx={{ color: '#0891b2', mb: 1 }}>
                Current Plan Details
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Plan:</strong> {esimData.plan_name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Data Capacity:</strong> {esimData.data_capacity}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Validity:</strong> {esimData.validity}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Provider:</strong> {esimData.api_provider}
              </Typography>
            </Paper>

            <Alert severity="info" sx={{ mb: 3 }}>
              You will renew the same plan for your eSIM. Select your preferred currency and proceed to payment.
            </Alert>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel 
                id="currency-select-label"
                sx={{ color: 'rgba(255,255,255,0.7)' }}
              >
                Payment Currency
              </InputLabel>
              <Select
                labelId="currency-select-label"
                value={selectedCurrency}
                label="Payment Currency"
                onChange={(e) => setSelectedCurrency(e.target.value)}
                startAdornment={<CurrencyIcon sx={{ mr: 1, color: '#0891b2' }} />}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0891b2',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'rgba(255,255,255,0.7)',
                  },
                }}
              >
                {availableCurrencies.map((currency) => (
                  <MenuItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Paper sx={{ p: 2, backgroundColor: 'rgba(8, 145, 178, 0.15)', border: '1px solid #0891b2' }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Renewal Price:
              </Typography>
              {converting ? (
                <CircularProgress size={20} sx={{ color: '#0891b2' }} />
              ) : convertedPrice ? (
                <Box>
                  <Typography variant="h5" sx={{ color: '#0891b2', fontWeight: 700 }}>
                    {convertedPrice.formatted_converted}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Original: {convertedPrice.formatted_original}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="h5" sx={{ color: '#0891b2', fontWeight: 700 }}>
                  ${basePrice.toFixed(2)} USD
                </Typography>
              )}
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            color: 'rgba(255,255,255,0.7)',
            '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          startIcon={<RenewIcon />}
          sx={{
            px: 4,
            background: 'linear-gradient(45deg, #0891b2 30%, #06b6d4 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #0891b2 50%, #06b6d4 100%)',
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

