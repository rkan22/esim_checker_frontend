import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  CreditCard as CreditCardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Load Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51Ru78dI1g8LlVdIJzVNdYoRxS2600fVj97j86WMKoxtzB5dHNYOyDkyo0YdFiK8f3XqDrXTUkzTehT7XRYwodbMh00ndBjsMwm');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: 'rgba(255, 255, 255, 0.5)',
      },
    },
    invalid: {
      color: '#ef5350',
      iconColor: '#ef5350',
    },
  },
  hidePostalCode: false,
};

const CheckoutForm = ({ clientSecret, amount, currency, packageName, onSuccess, onError, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!cardComplete) {
      setError('Please enter complete card details');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        onError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      onError('An unexpected error occurred');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
          You are purchasing: <strong>{packageName}</strong>
        </Typography>
        
        <Paper 
          elevation={0}
          sx={{ 
            p: 2, 
            backgroundColor: 'rgba(8, 145, 178, 0.15)',
            border: '1px solid #0891b2',
            mb: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#0891b2' }}>
            Total: ${amount} {currency}
          </Typography>
        </Paper>

        <Box
          sx={{
            p: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 1,
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Box display="flex" alignItems="center" mb={1}>
            <CreditCardIcon sx={{ mr: 1, color: '#0891b2' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Card Details
            </Typography>
          </Box>
          <CardElement 
            options={CARD_ELEMENT_OPTIONS}
            onChange={(e) => setCardComplete(e.complete)}
          />
        </Box>

        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'rgba(255,255,255,0.5)' }}>
          Test Card: 4242 4242 4242 4242 | Any future date | Any 3 digits
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" gap={2}>
        <Button
          onClick={onClose}
          disabled={processing}
          sx={{ 
            color: 'rgba(255,255,255,0.7)',
            '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || processing || !cardComplete}
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #059669 30%, #10b981 90%)',
            color: 'white',
            fontWeight: 600,
            px: 4,
            '&:hover': {
              background: 'linear-gradient(45deg, #10b981 30%, #059669 90%)',
            },
            '&:disabled': {
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.3)',
            }
          }}
        >
          {processing ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
              Processing...
            </>
          ) : (
            `Pay $${amount}`
          )}
        </Button>
      </Box>
    </form>
  );
};

const PaymentDialog = ({ 
  open, 
  onClose, 
  clientSecret, 
  amount, 
  currency, 
  packageName,
  onSuccess,
  onError 
}) => {
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
          💳 Payment Details
        </Typography>
        <CloseIcon 
          onClick={onClose} 
          sx={{ cursor: 'pointer', '&:hover': { color: '#0891b2' } }}
        />
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {clientSecret ? (
          <Elements stripe={stripePromise}>
            <CheckoutForm
              clientSecret={clientSecret}
              amount={amount}
              currency={currency}
              packageName={packageName}
              onSuccess={onSuccess}
              onError={onError}
              onClose={onClose}
            />
          </Elements>
        ) : (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress sx={{ color: '#0891b2' }} />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export const SuccessDialog = ({ open, onClose, onSendEmail }) => {
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
        background: 'linear-gradient(45deg, #059669 30%, #10b981 90%)',
        color: 'white',
        textAlign: 'center',
      }}>
        <CheckCircleIcon sx={{ fontSize: 60, mb: 1 }} />
        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
          Payment Successful!
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Your eSIM has been successfully renewed!
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          The renewal is being processed and should be active within a few minutes.
        </Typography>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Typography variant="body2" sx={{ mb: 2 }}>
          Would you like to receive the eSIM details via email?
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
        <Button
          onClick={onClose}
          sx={{ 
            color: 'rgba(255,255,255,0.7)',
            '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          No Thanks
        </Button>
        <Button
          onClick={onSendEmail}
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #0891b2 30%, #06b6d4 90%)',
            color: 'white',
            fontWeight: 600,
            px: 4,
            '&:hover': {
              background: 'linear-gradient(45deg, #06b6d4 30%, #0891b2 90%)',
            }
          }}
        >
          Send Email
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;

