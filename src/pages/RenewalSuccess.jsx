import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Divider,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { confirmPayment } from '../services/renewalService';

const RenewalSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');

      if (!sessionId) {
        setError('No session ID found');
        setLoading(false);
        return;
      }

      try {
        const result = await confirmPayment({ session_id: sessionId });

        if (result.success) {
          setOrderData(result.data.order);
        } else {
          setError(result.error?.details || result.error?.error || 'Payment verification failed');
        }
      } catch (err) {
        setError('An error occurred while verifying payment');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress size={60} sx={{ color: '#0891b2', mb: 3 }} />
          <Typography variant="h6" sx={{ color: '#64748b' }}>
            Verifying your payment...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            py: 4,
          }}
        >
          <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={handleGoHome}
            startIcon={<HomeIcon />}
            sx={{
              backgroundColor: '#1e3a8a',
              '&:hover': { backgroundColor: '#1e40af' },
            }}
          >
            Return to Home
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
            width: '100%',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          }}
        >
          {orderData?.status === 'PROVIDER_FAILED' ? (
            <WarningIcon sx={{ fontSize: 80, color: '#f59e0b', mb: 2 }} />
          ) : (
            <SuccessIcon sx={{ fontSize: 80, color: '#10b981', mb: 2 }} />
          )}
          
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 1 }}>
            Payment Successful!
          </Typography>
          
          {orderData?.status === 'PROVIDER_FAILED' ? (
            <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
              Your payment was successful, but there was an issue with the provider. 
              Our support team will process your renewal manually within 24 hours.
            </Typography>
          ) : (
            <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
              Your eSIM renewal has been processed successfully.
            </Typography>
          )}

          <Divider sx={{ my: 3 }} />

          {orderData && (
            <Box sx={{ textAlign: 'left', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e3a8a', mb: 2 }}>
                Order Details
              </Typography>
              
              <Box sx={{ display: 'grid', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Order ID:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {orderData.order_id}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    ICCID:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {orderData.iccid}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Provider:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {orderData.provider}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Amount:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {orderData.amount} {orderData.currency}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Status:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      color: orderData.status === 'COMPLETED' 
                        ? '#10b981' 
                        : orderData.status === 'PROVIDER_FAILED' 
                          ? '#f59e0b' 
                          : orderData.status === 'PAID'
                            ? '#0891b2'
                            : '#64748b'
                    }}
                  >
                    {orderData.status === 'PROVIDER_FAILED' 
                      ? 'Payment Confirmed - Processing Pending' 
                      : orderData.status}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {orderData?.status === 'PROVIDER_FAILED' ? (
            <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3, textAlign: 'left' }}>
              <strong>Payment received successfully!</strong><br />
              There was a temporary issue with the provider API. Your renewal will be processed 
              manually within 24 hours. You'll receive a confirmation email once completed.
            </Alert>
          ) : (
            <Alert severity="info" icon={<EmailIcon />} sx={{ mb: 3, textAlign: 'left' }}>
              A confirmation email with your eSIM details will be sent to you shortly.
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={handleGoHome}
              startIcon={<HomeIcon />}
              sx={{
                px: 4,
                py: 1.5,
                backgroundColor: '#1e3a8a',
                '&:hover': { backgroundColor: '#1e40af' },
              }}
            >
              Return to Home
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RenewalSuccess;

