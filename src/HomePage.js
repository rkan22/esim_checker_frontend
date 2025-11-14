import React, { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SimCardIcon from '@mui/icons-material/SimCard';
import { checkESIMStatus } from './services/esimService';
import { createRenewalOrder, confirmPayment } from './services/renewalService';
import SimpleRenewalDialog from './components/SimpleRenewalDialog';
import PaymentDialog, { SuccessDialog } from './components/PaymentForm';
import EmailDialog from './components/EmailDialog';
import ESIMResults from './components/ESIMResults';
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

      const result = await createRenewalOrder({
        iccid: esimData.iccid,
        provider: esimData.api_provider,
        order_sim_id: esimData.order_sim_id,
        plan_name: esimData.plan_name,
        amount: 10.00,
        currency: selectedCurrency,
        package_name: esimData.plan_name,
        renewal_days: 7,
        country_code: extractCountryCode(esimData.plan_name, esimData.apn),
      });

      if (result.success) {
        setRenewalOrderId(result.data.order.order_id);
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
    setSelectedPackage(null);
    setPaymentInfo(null);
    setRenewalOrderId(null);
  };

  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    setSelectedPackage(null);
    setPaymentInfo(null);
    setRenewalOrderId(null);
  };

  const isExpiredOrInactive = () => {
    if (!esimData) return false;
    const status = esimData.status?.toLowerCase();
    return status === 'inactive' || status === 'expired' || status === 'disabled';
  };

  return (
    <>
      {!esimData && (
        <Box
          sx={{
            minHeight: '100vh',
            backgroundImage: 'url(/background.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Logo */}
          <Box sx={{ p: { xs: 3, md: 5 } }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <SimCardIcon sx={{ fontSize: 48, color: '#3b4d7a' }} />
              <Box>
                <Typography
                  sx={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#2d3748',
                    lineHeight: 1.2,
                  }}
                >
                  esimstatus
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    lineHeight: 1,
                    mt: 0.3,
                  }}
                >
                  .com
                </Typography>
              </Box>
            </Box>
          </Box>

          <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', pb: '10%' }}>
        {/* Main Content */}
        {!esimData && !loading && (
          <Box textAlign="center" sx={{ maxWidth: 900, mx: 'auto', px: 2 }}>
            <Typography
              sx={{
                fontWeight: 800,
                color: '#1e293b',
                mb: 3,
                fontSize: { xs: '3.6rem', md: '5.4rem' },
                lineHeight: 1.1,
              }}
            >
              Check eSIM Details
            </Typography>
            <Typography
              sx={{
                color: '#475569',
                fontWeight: 500,
                mb: 6,
                fontSize: { xs: '1.35rem', md: '1.8rem' },
                lineHeight: 1.5,
              }}
            >
              Enter your ICCID to instantly view activation status,
              <br />
              data balance, and other details of your eSIM.
            </Typography>

            {/* Search Form */}
            <form onSubmit={handleSubmit}>
              <Box display="flex" gap={2} alignItems="center" justifyContent="center" flexWrap="wrap">
                <Typography
                  sx={{
                    color: '#1e293b',
                    fontWeight: 800,
                    fontSize: '1.35rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  Enter ICCID:
                </Typography>
                <TextField
                  placeholder="8901XXXXXXXXXXXXX"
                  value={iccid}
                  onChange={(e) => setIccid(e.target.value)}
                  variant="outlined"
                  disabled={loading}
                  sx={{ width: { xs: '100%', sm: '320px' } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#64748b', fontSize: 24 }} />
                      </InputAdornment>
                    ),
                    sx: {
                      backgroundColor: 'white',
                      borderRadius: '50px',
                      height: '56px',
                      fontSize: '1rem',
                      '& fieldset': {
                        borderColor: '#cbd5e1',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: '#94a3b8 !important',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1e293b !important',
                      },
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    px: 5,
                    py: 1.75,
                    backgroundColor: '#1e293b',
                    borderRadius: '50px',
                    textTransform: 'none',
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    height: '56px',
                    '&:hover': {
                      backgroundColor: '#334155',
                    },
                  }}
                >
                  Search
                </Button>
              </Box>
            </form>

            {error && (
              <Typography
                variant="body2"
                sx={{
                  color: '#dc2626',
                  mt: 3,
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
          </Container>

          {/* Footer */}
          <Box sx={{ pb: 3, textAlign: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
              }}
            >
              Copyright © 2025 esimstatus.com
            </Typography>
          </Box>
        </Box>
      )}

      {/* Results */}
      {esimData && !loading && (
        <Box
          sx={{
            minHeight: '100vh',
            backgroundImage: 'url(/backdround_two.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Logo */}
          <Box sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <SimCardIcon sx={{ fontSize: 48, color: '#3b4d7a' }} />
              <Box>
                <Typography
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#2d3748',
                    lineHeight: 1,
                  }}
                >
                  esimstatus
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    lineHeight: 1,
                  }}
                >
                  .com
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: -2 }}>
            <ESIMResults
              esimData={esimData}
              copiedField={copiedField}
              handleCopy={handleCopy}
              parseDataValue={parseDataValue}
              onCheckAnother={() => {
                setEsimData(null);
                setIccid('');
                setError(null);
              }}
              onRenewPackage={handleRenewClick}
            />
          </Box>

          {/* Footer */}
          <Box sx={{ pb: 2, textAlign: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                fontSize: '0.75rem',
              }}
            >
              Copyright © 2025 esimstatus.com
            </Typography>
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
    </>
  );
}

export default HomePage;
