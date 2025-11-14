import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  Chip,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  DataUsage as DataUsageIcon,
  DateRange as DateRangeIcon,
  LocalOffer as PriceIcon,
  Close as CloseIcon,
  AttachMoney as CurrencyIcon,
} from '@mui/icons-material';
import { getRenewalPackages } from '../services/renewalService';
import currencyService from '../services/currencyService';

const RenewalDialog = ({ open, onClose, iccid, apiProvider, onSelectPackage }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [convertedPrices, setConvertedPrices] = useState({});

  useEffect(() => {
    if (open) {
      fetchPackages();
      fetchCurrencies();
    }
  }, [open, apiProvider]);

  useEffect(() => {
    if (packages.length > 0 && selectedCurrency !== 'USD') {
      convertPackagePrices();
    } else if (selectedCurrency === 'USD') {
      setConvertedPrices({});
    }
  }, [selectedCurrency, packages]);

  const fetchCurrencies = async () => {
    try {
      const currencies = await currencyService.getSupportedCurrencies();
      setAvailableCurrencies(currencies);
    } catch (error) {
      console.error('Error fetching currencies:', error);
    }
  };

  const convertPackagePrices = async () => {
    try {
      const priceMap = {};
      for (const pkg of packages) {
        const result = await currencyService.convertAmount(
          pkg.price,
          'USD',
          selectedCurrency
        );
        priceMap[pkg.package_id] = result;
      }
      setConvertedPrices(priceMap);
    } catch (error) {
      console.error('Error converting prices:', error);
    }
  };

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getRenewalPackages(apiProvider);
      
      if (result.success) {
        setPackages(result.data);
        if (result.data.length > 0) {
          setSelectedPackage(result.data[0]);
        }
      } else {
        setError(result.error?.details || result.error?.error || 'Failed to fetch packages');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = () => {
    if (selectedPackage) {
      // Include currency and converted price information
      const packageWithCurrency = {
        ...selectedPackage,
        selectedCurrency,
        convertedPrice: convertedPrices[selectedPackage.package_id]?.converted_amount || selectedPackage.price,
        originalPrice: selectedPackage.price,
      };
      onSelectPackage(packageWithCurrency);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
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
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress sx={{ color: '#0891b2' }} />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading available packages...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && packages.length === 0 && (
          <Alert severity="info">
            No packages available at this time. Please try again later.
          </Alert>
        )}

        {!loading && !error && packages.length > 0 && (
          <Box>
            <Typography variant="body1" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
              Select a package to renew your eSIM for ICCID: <strong>{iccid}</strong>
            </Typography>

            {/* Currency Selector */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel 
                id="currency-select-label"
                sx={{ color: 'rgba(255,255,255,0.7)' }}
              >
                Currency
              </InputLabel>
              <Select
                labelId="currency-select-label"
                value={selectedCurrency}
                label="Currency"
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

            <RadioGroup
              value={selectedPackage?.package_id || ''}
              onChange={(e) => {
                const pkg = packages.find(p => p.package_id === e.target.value);
                setSelectedPackage(pkg);
              }}
            >
              <Grid container spacing={2}>
                {packages.map((pkg) => (
                  <Grid item xs={12} key={pkg.package_id}>
                    <Card 
                      sx={{ 
                        backgroundColor: selectedPackage?.package_id === pkg.package_id 
                          ? 'rgba(8, 145, 178, 0.2)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        border: selectedPackage?.package_id === pkg.package_id 
                          ? '2px solid #0891b2' 
                          : '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(8, 145, 178, 0.15)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 20px rgba(8, 145, 178, 0.3)',
                        }
                      }}
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <FormControlLabel
                            value={pkg.package_id}
                            control={<Radio sx={{ color: '#0891b2' }} />}
                            label={
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
                                  {pkg.package_name}
                                </Typography>
                                {pkg.description && (
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>
                                    {pkg.description}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          <Box>
                            {convertedPrices[pkg.package_id] ? (
                              <Box>
                                <Chip 
                                  label={convertedPrices[pkg.package_id].formatted_converted}
                                  color="primary"
                                  sx={{ 
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    backgroundColor: '#0891b2',
                                  }}
                                  icon={<PriceIcon />}
                                />
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    display: 'block', 
                                    color: 'rgba(255,255,255,0.5)', 
                                    mt: 0.5,
                                    textAlign: 'right' 
                                  }}
                                >
                                  Original: ${pkg.price} USD
                                </Typography>
                              </Box>
                            ) : (
                              <Chip 
                                label={`$${pkg.price} ${pkg.currency}`}
                                color="primary"
                                sx={{ 
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                  background: 'linear-gradient(45deg, #0891b2 30%, #06b6d4 90%)',
                                }}
                                icon={<PriceIcon />}
                              />
                            )}
                          </Box>
                        </Box>

                        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <Box display="flex" alignItems="center">
                              <DataUsageIcon sx={{ mr: 1, color: '#0891b2' }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                  Data
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {pkg.data_quantity} {pkg.data_unit}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>

                          <Grid item xs={4}>
                            <Box display="flex" alignItems="center">
                              <DateRangeIcon sx={{ mr: 1, color: '#0891b2' }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                  Validity
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {pkg.validity_days} days
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>

                          <Grid item xs={4}>
                            <Box display="flex" alignItems="center">
                              <PriceIcon sx={{ mr: 1, color: '#0891b2' }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                  Provider
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {pkg.provider}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </RadioGroup>

            {selectedPackage && (
              <Box 
                sx={{ 
                  mt: 3, 
                  p: 2, 
                  backgroundColor: 'rgba(8, 145, 178, 0.15)',
                  borderRadius: 2,
                  border: '1px solid #0891b2',
                }}
              >
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  <strong>Selected Package:</strong> {selectedPackage.package_name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 1 }}>
                  <strong>Total:</strong> ${selectedPackage.price} {selectedPackage.currency}
                </Typography>
              </Box>
            )}
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
          onClick={handleSelectPackage}
          disabled={!selectedPackage || loading}
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #0891b2 30%, #06b6d4 90%)',
            color: 'white',
            fontWeight: 600,
            px: 4,
            '&:hover': {
              background: 'linear-gradient(45deg, #06b6d4 30%, #0891b2 90%)',
            },
            '&:disabled': {
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.3)',
            }
          }}
        >
          Continue to Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenewalDialog;

