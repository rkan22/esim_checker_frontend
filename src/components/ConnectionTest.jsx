import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { API_BASE_URL } from '../config/api';
import { checkHealth } from '../services/esimService';

const ConnectionTest = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [autoTested, setAutoTested] = useState(false);

  // Auto-test connection on component mount
  useEffect(() => {
    if (!autoTested) {
      testConnection();
      setAutoTested(true);
    }
  }, [autoTested]);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);

    try {
      console.log('🔍 Testing connection to:', API_BASE_URL);
      
      const healthResult = await checkHealth();
      
      if (healthResult.success) {
        setResult({
          success: true,
          message: 'Backend connection successful!',
          details: healthResult.data
        });
      } else {
        setResult({
          success: false,
          message: 'Backend health check failed',
          error: healthResult.error
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Connection test failed',
        error: { error: 'Network Error', details: error.message }
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        🔧 Backend Connection Test
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          API URL: <Chip label={API_BASE_URL} size="small" />
        </Typography>
      </Box>

      <Button
        variant="outlined"
        onClick={testConnection}
        disabled={testing}
        startIcon={testing ? <CircularProgress size={16} /> : null}
        sx={{ mb: 2 }}
      >
        {testing ? 'Testing...' : 'Test Connection'}
      </Button>

      {result && (
        <Alert 
          severity={result.success ? 'success' : 'error'}
          sx={{ mt: 1 }}
        >
          <Typography variant="body2" fontWeight="bold">
            {result.message}
          </Typography>
          
          {result.success && result.details && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" display="block">
                Service: {result.details.service || 'eSIM Status Checker'}
              </Typography>
              <Typography variant="caption" display="block">
                Version: {result.details.version || '1.0.0'}
              </Typography>
            </Box>
          )}
          
          {!result.success && result.error && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" display="block">
                Error: {result.error.error}
              </Typography>
              <Typography variant="caption" display="block">
                Details: {result.error.details}
              </Typography>
            </Box>
          )}
        </Alert>
      )}

      {!result?.success && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            💡 Troubleshooting tips:
          </Typography>
          <ul style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            <li>Make sure Django backend is running on {API_BASE_URL}</li>
            <li>Check that CORS is properly configured</li>
            <li>Verify no firewall is blocking the connection</li>
          </ul>
        </Box>
      )}
    </Box>
  );
};

export default ConnectionTest;