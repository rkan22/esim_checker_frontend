import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const SimpleLoader = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
        minHeight: '200px',
      }}
    >
      <CircularProgress size={50} thickness={4} />
      <Typography
        variant="body1"
        sx={{
          marginTop: 2,
          color: 'text.secondary',
          textAlign: 'center',
        }}
      >
        {message}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          marginTop: 1,
          color: 'text.disabled',
          textAlign: 'center',
          maxWidth: '400px',
        }}
      >
        Searching across multiple eSIM providers. This may take up to 4 minutes for large accounts...
      </Typography>
    </Box>
  );
};

export default SimpleLoader;

