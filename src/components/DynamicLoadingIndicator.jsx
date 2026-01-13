import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Fade,
  LinearProgress,
} from '@mui/material';

const DynamicLoadingIndicator = ({ isLoading = false }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  const loadingMessages = [
    { text: "Initializing search...", duration: 1500 },
    { text: "Connecting to eSIM providers...", duration: 2000 },
    { text: "Querying Vodafone database...", duration: 2500 },
    { text: "Checking Orange network...", duration: 2500 },
    { text: "Searching Roam2world catalog...", duration: 2500 },
    { text: "Analyzing provider responses...", duration: 2000 },
    { text: "Merging data sources...", duration: 1500 },
    { text: "Finalizing results...", duration: 1000 },
  ];

  useEffect(() => {
    if (!isLoading) {
      setCurrentMessageIndex(0);
      setProgress(0);
      setFadeKey(0);
      return;
    }

    let messageTimer;
    let progressTimer;
    let fadeTimer;

    const startMessageCycle = () => {
      const currentMessage = loadingMessages[currentMessageIndex];
      const totalDuration = currentMessage.duration;
      const progressIncrement = 100 / (totalDuration / 50); // Update every 50ms

      // Progress animation
      let currentProgress = 0;
      progressTimer = setInterval(() => {
        currentProgress += progressIncrement;
        setProgress(Math.min(currentProgress, 100));
      }, 50);

      // Message change timer
      messageTimer = setTimeout(() => {
        // Trigger fade out
        setFadeKey(prev => prev + 1);
        
        // Change message after fade out
        fadeTimer = setTimeout(() => {
          setCurrentMessageIndex(prev => {
            const nextIndex = (prev + 1) % loadingMessages.length;
            return nextIndex;
          });
          setProgress(0);
        }, 300); // Fade duration
      }, totalDuration);
    };

    startMessageCycle();

    return () => {
      clearTimeout(messageTimer);
      clearTimeout(fadeTimer);
      clearInterval(progressTimer);
    };
  }, [currentMessageIndex, isLoading]);

  if (!isLoading) return null;

  return (
    <Box 
      textAlign="center" 
      py={8}
      className="loading-container"
      sx={{
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Main Loading Spinner */}
      <Box sx={{ position: 'relative', mb: 4 }} className="loading-spinner">
        <CircularProgress 
          size={80} 
          thickness={3}
          sx={{ 
            color: '#4f46e5',
          }} 
        />
        
        {/* Inner progress indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: `conic-gradient(#4f46e5 ${progress * 3.6}deg, #e5e7eb 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#4f46e5',
              }}
            >
              {Math.round(progress)}%
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Dynamic Message with Fade Effect */}
      <Box sx={{ height: '60px', display: 'flex', alignItems: 'center' }}>
        <Fade 
          in={true} 
          timeout={300}
          key={fadeKey}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#475569',
              fontWeight: 500,
              fontSize: '1.1rem',
              textAlign: 'center',
              minHeight: '28px',
            }}
          >
            {loadingMessages[currentMessageIndex]?.text}
          </Typography>
        </Fade>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ width: '300px', mt: 3 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: '#e5e7eb',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#4f46e5',
              borderRadius: 3,
              transition: 'transform 0.1s ease-out',
            },
          }}
        />
      </Box>

      {/* Subtitle */}
      <Typography 
        variant="body2" 
        sx={{ 
          mt: 2,
          color: '#9ca3af',
          fontSize: '0.9rem',
          fontStyle: 'italic',
        }}
      >
        This may take up to 15 seconds...
      </Typography>

      {/* Animated Dots */}
      <Box sx={{ mt: 2, display: 'flex', gap: 0.5 }} className="loading-dots">
        {[0, 1, 2].map((dot) => (
          <Box
            key={dot}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#4f46e5',
              animation: `bounce 1.4s ease-in-out ${dot * 0.16}s infinite both`,
              '@keyframes bounce': {
                '0%, 80%, 100%': {
                  transform: 'scale(0.8)',
                  opacity: 0.5,
                },
                '40%': {
                  transform: 'scale(1)',
                  opacity: 1,
                },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default DynamicLoadingIndicator;