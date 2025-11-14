import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import {
  Cancel as CancelIcon,
  Home as HomeIcon,
  Replay as RetryIcon,
} from '@mui/icons-material';

const RenewalCancelled = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRetry = () => {
    navigate('/');
    // Could also navigate to a specific page with retry logic
  };

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
          <CancelIcon sx={{ fontSize: 80, color: '#ef4444', mb: 2 }} />
          
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 1 }}>
            Payment Cancelled
          </Typography>
          
          <Typography variant="body1" sx={{ color: '#64748b', mb: 2 }}>
            Your payment was cancelled. No charges have been made.
          </Typography>

          <Typography variant="body2" sx={{ color: '#64748b', mb: 4 }}>
            If you encountered any issues or have questions, please contact our support team.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={handleRetry}
              startIcon={<RetryIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderColor: '#1e3a8a',
                color: '#1e3a8a',
                '&:hover': {
                  borderColor: '#1e40af',
                  backgroundColor: 'rgba(30, 58, 138, 0.05)',
                },
              }}
            >
              Try Again
            </Button>

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

export default RenewalCancelled;

