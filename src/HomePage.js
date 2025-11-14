import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  InputAdornment,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SimCardIcon from '@mui/icons-material/SimCard';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { checkESIMStatus } from './services/esimService';
import { createRenewalOrder, confirmPayment } from './services/renewalService';
import SimpleRenewalDialog from './components/SimpleRenewalDialog';
import PaymentDialog, { SuccessDialog } from './components/PaymentForm';
import EmailDialog from './components/EmailDialog';
import './App.css';

function HomePage() {
  const [iccid, setIccid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [esimData, setEsimData] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  
  // Renewal state
  const [renewalDialogOpen, setRenewalDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [renewalOrderId, setRenewalOrderId] = useState(null);
  const [renewalLoading, setRenewalLoading] = useState(false);
  const [renewalError, setRenewalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!iccid || iccid.trim().length < 10) {
      setError('Please enter a valid ICCID (minimum 10 digits)');
      return;
    }

    setLoading(true);
    setError(null);
    setEsimData(null);

    try {
      const result = await checkESIMStatus(iccid.trim());
      
      if (result.success) {
        setEsimData(result.data);
      } else {
        setError(result.error?.error || result.error?.details || 'Failed to fetch eSIM details');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch eSIM details');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const parseDataValue = (dataStr) => {
    if (!dataStr || dataStr === 'N/A') return 0;
    const match = dataStr.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  const getChartData = () => {
    const consumed = parseDataValue(esimData?.data_consumed);
    const remaining = parseDataValue(esimData?.data_remaining);
    
    return [
      { name: 'Consumed', value: consumed, color: '#4FC3F7' },
      { name: 'Remaining', value: remaining, color: '#66BB6A' }
    ];
  };

  const getTotalCapacity = () => {
    return parseDataValue(esimData?.data_capacity);
  };

  const getRemainingData = () => {
    return parseDataValue(esimData?.data_remaining);
  };

  // Renewal Handlers
  const handleRenewClick = () => {
    setRenewalDialogOpen(true);
    setRenewalError(null);
  };

  const handlePackageSelect = async (selectedCurrency = 'USD') => {
    setRenewalDialogOpen(false);
    setRenewalLoading(true);
    setRenewalError(null);

    try {
      // Extract country code from plan name or APN
      const extractCountryCode = (planName, apn) => {
        // Country mappings
        const countryMap = {
          'turkey': 'TR', 'india': 'IN', 'usa': 'US', 'uk': 'GB',
          'germany': 'DE', 'france': 'FR', 'spain': 'ES', 'italy': 'IT'
        };
        
        const lowerPlan = planName?.toLowerCase() || '';
        const lowerApn = apn?.toLowerCase() || '';
        
        for (const [country, code] of Object.entries(countryMap)) {
          if (lowerPlan.includes(country) || lowerApn.includes(country)) {
            return code;
          }
        }
        return null;
      };
      
      // Use the current eSIM's details for renewal
      const result = await createRenewalOrder({
        iccid: esimData.iccid,
        provider: esimData.api_provider,
        order_sim_id: esimData.order_sim_id,
        plan_name: esimData.plan_name,
        amount: 10.00,  // Default amount, will be updated based on plan
        currency: selectedCurrency,
        package_name: esimData.plan_name,
        renewal_days: 7,
        country_code: extractCountryCode(esimData.plan_name, esimData.apn),
      });

      if (result.success) {
        // Store order information
        setRenewalOrderId(result.data.order.order_id);
        
        // Redirect to Stripe Checkout
        const checkoutUrl = result.data.payment.checkout_url;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          setRenewalError('No checkout URL received');
        }
      } else {
        setRenewalError(result.error?.details || result.error?.error || 'Failed to create order');
      }
    } catch (err) {
      setRenewalError('An unexpected error occurred');
    } finally {
      setRenewalLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    setPaymentDialogOpen(false);
    setRenewalLoading(true);

    try {
      const result = await confirmPayment(paymentIntent.id);

      if (result.success) {
        setSuccessDialogOpen(true);
        // Refresh eSIM data
        const refreshResult = await checkESIMStatus(esimData.iccid);
        if (refreshResult.success) {
          setEsimData(refreshResult.data);
        }
      } else {
        setRenewalError(result.error?.details || result.error?.error || 'Payment confirmation failed');
      }
    } catch (err) {
      setRenewalError('Failed to confirm payment');
    } finally {
      setRenewalLoading(false);
    }
  };

  const handlePaymentError = (error) => {
    setPaymentDialogOpen(false);
    setRenewalError(error);
  };

  const handleSendEmailClick = () => {
    setSuccessDialogOpen(false);
    setEmailDialogOpen(true);
  };

  const handleEmailDialogClose = () => {
    setEmailDialogOpen(false);
    // Reset renewal state
    setSelectedPackage(null);
    setPaymentInfo(null);
    setRenewalOrderId(null);
  };

  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    // Reset renewal state
    setSelectedPackage(null);
    setPaymentInfo(null);
    setRenewalOrderId(null);
  };

  // Check if eSIM is expired or inactive
  const isExpiredOrInactive = () => {
    if (!esimData) return false;
    const status = esimData.status?.toLowerCase();
    return status === 'inactive' || status === 'expired' || status === 'disabled';
  };

  return (
    <Box className="app-background">
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={2}>
            <SimCardIcon sx={{ fontSize: 48, color: '#1e3a8a' }} />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(90deg, #1e3a8a 0%, #4f46e5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              esimstatus
            </Typography>
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1e3a8a',
              mb: 2,
            }}
          >
            Check eSIM Details
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#475569',
              fontWeight: 400,
              maxWidth: 700,
              mx: 'auto',
            }}
          >
            Enter your ICCID to instantly view activation status,
            <br />
            data balance, and other details of your eSIM.
          </Typography>
        </Box>

        {/* Search Form */}
        {!esimData && !loading && (
          <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
            <form onSubmit={handleSubmit}>
              <Box display="flex" gap={2} alignItems="flex-start">
                <Box flex={1}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: '#1e3a8a',
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    Enter ICCID:
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="893407101001204344"
                    value={iccid}
                    onChange={(e) => setIccid(e.target.value)}
                    variant="outlined"
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#64748b' }} />
                        </InputAdornment>
                      ),
                      sx: {
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        '& fieldset': {
                          borderColor: '#e2e8f0',
                          borderWidth: 2,
                        },
                        '&:hover fieldset': {
                          borderColor: '#cbd5e1 !important',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4f46e5 !important',
                        },
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ opacity: 0, mb: 1 }}
                  >
                    .
                  </Typography>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      px: 4,
                      py: 1.5,
                      backgroundColor: '#1e3a8a',
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#1e40af',
                      },
                    }}
                  >
                    Search
                  </Button>
                </Box>
              </Box>
            </form>

            {error && (
              <Typography
                variant="body2"
                sx={{
                  color: '#dc2626',
                  mt: 2,
                  textAlign: 'center',
                }}
              >
                {error}
              </Typography>
            )}
          </Box>
        )}

        {/* Loading State */}
        {loading && (
          <Box textAlign="center" py={8}>
            <CircularProgress size={60} sx={{ color: '#4f46e5' }} />
            <Typography variant="h6" sx={{ mt: 3, color: '#475569' }}>
              Checking all API providers...
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: '#64748b' }}>
              Querying AirHub, eSIMCard, and TravelRoam APIs
            </Typography>
          </Box>
        )}

        {/* Results */}
        {esimData && !loading && (
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: '#1e3a8a',
                borderRadius: '24px',
                p: 4,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Grid container spacing={4}>
                {/* Left Side - Details */}
                <Grid item xs={12} md={7}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                    }}
                  >
                    eSIM Details
                  </Typography>

                  {/* API Provider Badge */}
                  <Box mb={2}>
                    <Box
                      sx={{
                        display: 'inline-block',
                        backgroundColor: 'rgba(79, 195, 247, 0.2)',
                        color: '#4FC3F7',
                        px: 2,
                        py: 0.5,
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      DATA SOURCE: {esimData.api_provider}
                    </Box>
                  </Box>

                  {/* Order/SIM ID */}
                  <Box mb={2.5}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        mb: 0.5,
                        fontSize: '0.875rem',
                      }}
                    >
                      Order/SIM ID:
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: 'white',
                        color: '#1e3a8a',
                        p: 1.5,
                        borderRadius: '8px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      {esimData.order_sim_id}
                      <Tooltip title={copiedField === 'order_id' ? 'Copied!' : 'Copy'}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(esimData.order_sim_id, 'order_id')}
                          sx={{ color: '#1e3a8a' }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* ICCID */}
                  <Box mb={2.5}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        mb: 0.5,
                        fontSize: '0.875rem',
                      }}
                    >
                      ICCID:
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: 'white',
                        color: '#1e3a8a',
                        p: 1.5,
                        borderRadius: '8px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ wordBreak: 'break-all', pr: 1 }}>{esimData.iccid}</Box>
                      <Tooltip title={copiedField === 'iccid' ? 'Copied!' : 'Copy'}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(esimData.iccid, 'iccid')}
                          sx={{ color: '#1e3a8a' }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Plan Name */}
                  <Box mb={2.5}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        mb: 0.5,
                        fontSize: '0.875rem',
                      }}
                    >
                      Plan Name:
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: 'white',
                        color: '#1e3a8a',
                        p: 1.5,
                        borderRadius: '8px',
                        fontWeight: 500,
                      }}
                    >
                      {esimData.plan_name}
                    </Box>
                  </Box>

                  {/* Status */}
                  <Box mb={2.5}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        mb: 0.5,
                        fontSize: '0.875rem',
                      }}
                    >
                      Status:
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: 'white',
                        color: esimData.status?.toLowerCase() === 'active' ? '#10b981' : '#f59e0b',
                        p: 1.5,
                        borderRadius: '8px',
                        fontWeight: 600,
                      }}
                    >
                      {esimData.status}
                    </Box>
                  </Box>

                  {/* Purchase Date and Validity */}
                  <Grid container spacing={2} mb={2.5}>
                    <Grid item xs={6}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          mb: 0.5,
                          fontSize: '0.875rem',
                        }}
                      >
                        Purchase Date:
                      </Typography>
                      <Box
                        sx={{
                          backgroundColor: 'white',
                          color: '#1e3a8a',
                          p: 1.5,
                          borderRadius: '8px',
                          fontWeight: 500,
                          fontSize: '0.875rem',
                        }}
                      >
                        {esimData.purchase_date}
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          mb: 0.5,
                          fontSize: '0.875rem',
                        }}
                      >
                        Validity:
                      </Typography>
                      <Box
                        sx={{
                          backgroundColor: 'white',
                          color: '#1e3a8a',
                          p: 1.5,
                          borderRadius: '8px',
                          fontWeight: 500,
                          fontSize: '0.875rem',
                        }}
                      >
                        {esimData.validity}
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Data Capacity */}
                  <Box mb={2.5}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        mb: 0.5,
                        fontSize: '0.875rem',
                      }}
                    >
                      Data Capacity:
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: 'white',
                        color: '#1e3a8a',
                        p: 1.5,
                        borderRadius: '8px',
                        fontWeight: 500,
                      }}
                    >
                      {esimData.data_capacity}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2, backgroundColor: 'rgba(255,255,255,0.2)' }} />

                  {/* Activation Code */}
                  <Box mb={2.5}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        mb: 0.5,
                        fontSize: '0.875rem',
                      }}
                    >
                      Activation Code:
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: 'white',
                        color: '#1e3a8a',
                        p: 1.5,
                        borderRadius: '8px',
                        fontWeight: 400,
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        wordBreak: 'break-all',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 1,
                      }}
                    >
                      <Box flex={1}>{esimData.activation_code}</Box>
                      <Tooltip title={copiedField === 'activation' ? 'Copied!' : 'Copy'}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(esimData.activation_code, 'activation')}
                          sx={{ color: '#1e3a8a', mt: -0.5 }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* APN */}
                  <Box mb={3}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        mb: 0.5,
                        fontSize: '0.875rem',
                      }}
                    >
                      APN (Access Point Name):
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: 'white',
                        color: '#1e3a8a',
                        p: 1.5,
                        borderRadius: '8px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      {esimData.apn}
                      <Tooltip title={copiedField === 'apn' ? 'Copied!' : 'Copy'}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(esimData.apn, 'apn')}
                          sx={{ color: '#1e3a8a' }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Check Another Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => {
                      setEsimData(null);
                      setIccid('');
                      setError(null);
                    }}
                    sx={{
                      backgroundColor: '#0891b2',
                      color: 'white',
                      py: 1.5,
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#06b6d4',
                      },
                    }}
                  >
                    Check another eSIM
                  </Button>
                </Grid>

                {/* Right Side - Chart */}
                <Grid item xs={12} md={5}>
                  <Box textAlign="center">
                    <Typography
                      variant="h6"
                      sx={{
                        textAlign: 'right',
                        mb: 2,
                        fontWeight: 600,
                      }}
                    >
                      Status:{' '}
                      <span
                        style={{
                          color: esimData.status?.toLowerCase() === 'active' ? '#66BB6A' : '#FFA726',
                        }}
                      >
                        {esimData.status}
                      </span>
                    </Typography>

                    {/* Data Usage Section */}
                    <Box
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        p: 3,
                        mb: 2,
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Data Usage
                      </Typography>

                      {/* Donut Chart */}
                      {esimData.data_consumed !== 'N/A' && esimData.data_remaining !== 'N/A' ? (
                        <>
                          <Box position="relative" display="inline-block">
                            <ResponsiveContainer width={240} height={240}>
                              <PieChart>
                                <Pie
                                  data={getChartData()}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={70}
                                  outerRadius={100}
                                  paddingAngle={2}
                                  dataKey="value"
                                >
                                  {getChartData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                            <Box
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center',
                              }}
                            >
                              <Typography
                                variant="h4"
                                sx={{
                                  fontWeight: 700,
                                  color: 'white',
                                  lineHeight: 1,
                                }}
                              >
                                {getRemainingData().toFixed(2)} GB
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'rgba(255,255,255,0.8)',
                                  mt: 0.5,
                                }}
                              >
                                left
                              </Typography>
                            </Box>
                          </Box>

                          {/* Legend */}
                          <Box mt={3}>
                            <Box display="flex" justifyContent="center" gap={3} mb={2}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Box
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    backgroundColor: '#4FC3F7',
                                    borderRadius: '4px',
                                  }}
                                />
                                <Typography variant="body2" fontSize="0.875rem">
                                  Consumed
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Box
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    backgroundColor: '#66BB6A',
                                    borderRadius: '4px',
                                  }}
                                />
                                <Typography variant="body2" fontSize="0.875rem">
                                  Remaining
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </>
                      ) : (
                        <Box
                          sx={{
                            height: 240,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                            No usage data available
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            eSIM may be inactive or not yet activated
                          </Typography>
                        </Box>
                      )}

                      {/* Data Stats */}
                      <Divider sx={{ my: 2, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                      
                      <Box textAlign="left">
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Data Consumed:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {esimData.data_consumed}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Data Remaining:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {esimData.data_remaining}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Total Capacity:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {esimData.data_capacity}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Last Updated */}
                    {esimData.last_updated && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255,255,255,0.6)',
                          display: 'block',
                          mt: 2,
                        }}
                      >
                        Last Updated: {new Date(esimData.last_updated).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>

              {/* Renewal Button */}
              {isExpiredOrInactive() && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    onClick={handleRenewClick}
                    variant="contained"
                    size="large"
                    startIcon={<AutorenewIcon />}
                    disabled={renewalLoading}
                    sx={{
                      background: 'linear-gradient(45deg, #0891b2 30%, #06b6d4 90%)',
                      color: 'white',
                      fontWeight: 600,
                      px: 6,
                      py: 1.5,
                      fontSize: '1.1rem',
                      boxShadow: '0 4px 20px rgba(8, 145, 178, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #06b6d4 30%, #0891b2 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 24px rgba(8, 145, 178, 0.5)',
                      },
                      '&:disabled': {
                        background: 'rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.3)',
                      }
                    }}
                  >
                    {renewalLoading ? 'Processing...' : 'Renew Plan'}
                  </Button>
                  
                  {renewalError && (
                    <Alert severity="error" sx={{ mt: 2, maxWidth: 500, mx: 'auto' }}>
                      {renewalError}
                    </Alert>
                  )}
                </Box>
              )}
            </Paper>

            {/* Check Another eSIM Button */}
            <Box textAlign="center" mt={4}>
              <Button
                onClick={() => {
                  setEsimData(null);
                  setError(null);
                  setIccid('');
                }}
                variant="contained"
                sx={{
                  background: 'linear-gradient(45deg, #0891b2 30%, #06b6d4 90%)',
                  color: 'white',
                  fontWeight: 600,
                  px: 4,
                  py: 1,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #06b6d4 30%, #0891b2 90%)',
                  }
                }}
              >
                Check Another eSIM
              </Button>
            </Box>
          </Box>
        )}

        {/* Renewal Dialogs */}
        <SimpleRenewalDialog
          open={renewalDialogOpen}
          onClose={() => setRenewalDialogOpen(false)}
          esimData={esimData}
          onConfirmRenewal={handlePackageSelect}
        />

        <PaymentDialog
          open={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          clientSecret={paymentInfo?.client_secret}
          amount={paymentInfo?.amount}
          currency={paymentInfo?.currency}
          packageName={selectedPackage?.package_name}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />

        <SuccessDialog
          open={successDialogOpen}
          onClose={handleSuccessDialogClose}
          onSendEmail={handleSendEmailClick}
        />

        <EmailDialog
          open={emailDialogOpen}
          onClose={handleEmailDialogClose}
          orderId={renewalOrderId}
        />

        {/* Footer */}
        <Typography
          variant="body2"
          textAlign="center"
          sx={{
            mt: 6,
            color: '#64748b',
          }}
        >
          Copyright © 2025 esimstatus.com
        </Typography>
      </Container>
    </Box>
  );
}

export default HomePage;
