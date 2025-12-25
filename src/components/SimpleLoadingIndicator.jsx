import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Fade,
} from '@mui/material';

const SimpleLoadingIndicator = ({ 
  isLoading = false, 
  messages = ["Processing...", "Please wait..."],
  size = 40,
  color = '#1a1a1a'
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    if (!isLoading || messages.length <= 1) return;

    const interval = setInterval(() => {
      setFadeKey(prev => prev + 1);
      setTimeout(() => {
        setCurrentMessageIndex(prev => (prev + 1) % messages.length);
      }, 200);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading, messages.length]);

  useEffect(() => {
    if (!isLoading) {
      setCurrentMessageIndex(0);
      setFadeKey(0);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        py: 1
      }}
    >
      <CircularProgress 
        size={size} 
        sx={{ 
          color: color,
          animation: 'pulse 2s ease-in-out infinite',
          '@keyframes pulse': {
            '0%': { opacity: 1 },
            '50%': { opacity: 0.6 },
            '100%': { opacity: 1 },
          },
        }} 
      />
      
      <Fade in={true} timeout={200} key={fadeKey}>
        <Typography 
          sx={{ 
            color: color,
            fontWeight: 500,
            fontSize: '1rem',
          }}
        >
          {messages[currentMessageIndex]}
        </Typography>
      </Fade>
    </Box>
  );
};

export default SimpleLoadingIndicator;