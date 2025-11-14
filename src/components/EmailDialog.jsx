import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Close as CloseIcon,
  Email as EmailIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { sendESIMEmail } from '../services/renewalService';

const EmailDialog = ({ open, onClose, orderId, defaultEmail = '' }) => {
  const [email, setEmail] = useState(defaultEmail);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSendEmail = async () => {
    if (!email) {
      setEmailError('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await sendESIMEmail({
        order_id: orderId,
        recipient_email: email,
        email_type: 'details',
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          // Reset state
          setEmail('');
          setSuccess(false);
        }, 2000);
      } else {
        setError(result.error?.details || result.error?.error || 'Failed to send email');
      }
    } catch (err) {
      setError('An unexpected error occurred while sending email');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      setEmail('');
      setError(null);
      setSuccess(false);
      setEmailError('');
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
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
        <Box display="flex" alignItems="center">
          <EmailIcon sx={{ mr: 1 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            Send eSIM Details
          </Typography>
        </Box>
        <CloseIcon 
          onClick={handleClose} 
          sx={{ cursor: 'pointer', '&:hover': { color: '#0891b2' } }}
        />
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {success ? (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center"
            py={4}
          >
            <CheckCircleIcon sx={{ fontSize: 60, color: '#10b981', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Email Sent Successfully!
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
              Your eSIM details have been sent to {email}
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255,255,255,0.9)' }}>
              Enter your email address to receive the complete eSIM details including:
            </Typography>

            <Box 
              sx={{ 
                mb: 3, 
                p: 2, 
                backgroundColor: 'rgba(8, 145, 178, 0.15)',
                borderRadius: 1,
                border: '1px solid rgba(8, 145, 178, 0.3)',
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                ✓ ICCID and Order Details
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                ✓ Plan Information
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                ✓ Data Usage Statistics
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                ✓ Activation Code (QR Code)
              </Typography>
              <Typography variant="body2">
                ✓ APN Configuration
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={handleEmailChange}
              error={!!emailError}
              helperText={emailError}
              disabled={sending}
              placeholder="your.email@example.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& input': {
                    color: '#ffffff',
                  }
                }
              }}
              InputLabelProps={{
                sx: { color: 'rgba(255,255,255,0.7)' }
              }}
              FormHelperTextProps={{
                sx: { color: emailError ? '#ef5350' : 'rgba(255,255,255,0.5)' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0891b2',
                  },
                }
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block', 
                mt: 2, 
                color: 'rgba(255,255,255,0.5)',
                textAlign: 'center',
              }}
            >
              Your email will only be used to send eSIM details and will not be stored.
            </Typography>
          </>
        )}
      </DialogContent>

      {!success && (
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleClose}
            disabled={sending}
            sx={{ 
              color: 'rgba(255,255,255,0.7)',
              '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={!email || !!emailError || sending}
            variant="contained"
            startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
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
            {sending ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default EmailDialog;

