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
      color: '#1a1a1a',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#9ca3af',
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
        <Typography variant="body2" sx={{ mb: 2, color: '#6b7280', fontSize: '0.95rem' }}>
          You are purchasing: <strong style={{ color: '#1a1a1a' }}>{packageName}</strong>
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            mb: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1.5rem' }}>
            Total: ${amount} {currency}
          </Typography>
        </Paper>

        <Box
          sx={{
            p: 2.5,
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
          }}
        >
          <Box display="flex" alignItems="center" mb={1.5}>
            <CreditCardIcon sx={{ mr: 1, color: '#6b7280' }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
              Card Details
            </Typography>
          </Box>
          <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={(e) => setCardComplete(e.complete)}
          />
        </Box>

        <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: '#9ca3af', fontSize: '0.8rem' }}>
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
          variant="outlined"
          sx={{
            color: '#1a1a1a',
            borderColor: '#e5e7eb',
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1.2,
            borderRadius: '8px',
            '&:hover': {
              borderColor: '#d1d5db',
              backgroundColor: '#f9fafb'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || processing || !cardComplete}
          variant="contained"
          sx={{
            backgroundColor: '#1a1a1a',
            color: 'white',
            fontWeight: 600,
            px: 4,
            py: 1.2,
            textTransform: 'none',
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: '#2d2d2d',
            },
            '&:disabled': {
              backgroundColor: '#e5e7eb',
              color: '#9ca3af',
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
          backgroundColor: '#ffffff',
          color: '#1a1a1a',
          borderRadius: '12px',
        }
      }}
    >
      <DialogTitle sx={{
        backgroundColor: '#ffffff',
        color: '#1a1a1a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 2,
        pt: 3,
      }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 700, fontSize: '1.75rem' }}>
          💳 Payment Details
        </Typography>
        <CloseIcon
          onClick={onClose}
          sx={{ cursor: 'pointer', color: '#6b7280', '&:hover': { color: '#1a1a1a' } }}
        />
      </DialogTitle>

      <DialogContent sx={{ mt: 1, pb: 3 }}>
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
            <CircularProgress sx={{ color: '#1a1a1a' }} />
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
          backgroundColor: '#ffffff',
          color: '#1a1a1a',
          borderRadius: '12px',
        }
      }}
    >
      <DialogTitle sx={{
        backgroundColor: '#ffffff',
        color: '#1a1a1a',
        textAlign: 'center',
        pt: 4,
      }}>
        <CheckCircleIcon sx={{ fontSize: 60, mb: 1, color: '#10b981' }} />
        <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
          Payment Successful!
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body1" sx={{ mb: 2, color: '#1a1a1a', fontWeight: 500 }}>
          Your eSIM has been successfully renewed!
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          The renewal is being processed and should be active within a few minutes.
        </Typography>

        <Divider sx={{ my: 3, borderColor: '#e5e7eb' }} />

        <Typography variant="body2" sx={{ mb: 2, color: '#1a1a1a' }}>
          Would you like to receive the eSIM details via email?
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: '#1a1a1a',
            borderColor: '#e5e7eb',
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1,
            borderRadius: '8px',
            '&:hover': {
              borderColor: '#d1d5db',
              backgroundColor: '#f9fafb'
            }
          }}
        >
          No Thanks
        </Button>
        <Button
          onClick={onSendEmail}
          variant="contained"
          sx={{
            backgroundColor: '#1a1a1a',
            color: 'white',
            fontWeight: 600,
            px: 4,
            py: 1,
            textTransform: 'none',
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: '#2d2d2d',
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
