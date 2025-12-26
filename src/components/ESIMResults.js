import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  Button,
  Tabs,
  Tab,
  Chip,
  Paper,
  Divider,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

function ESIMResults({ 
  esimData, 
  copiedField, 
  handleCopy, 
  parseDataValue,
  onCheckAnother,
  onRenewPackage,
}) {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Extract validity period from plan name if N/A
  const getValidityPeriod = () => {
    if (esimData.validity && esimData.validity !== 'N/A') {
      return esimData.validity;
    }
    
    // Try to extract from plan_name
    const planName = esimData.plan_name || '';
    const daysMatch = planName.match(/(\d+)\s*Days?/i);
    if (daysMatch) {
      return `${daysMatch[1]} Days`;
    }
    
    return 'N/A';
  };

  // Extract data capacity from plan name if N/A
  const getDataCapacity = () => {
    if (esimData.data_capacity && esimData.data_capacity !== 'N/A') {
      return esimData.data_capacity;
    }
    
    // Try to extract from plan_name (e.g., "100GB", "5GB", "1GB")
    const planName = esimData.plan_name || '';
    const dataMatch = planName.match(/(\d+)\s*(GB|MB)/i);
    if (dataMatch) {
      return `${dataMatch[1]} ${dataMatch[2]}`;
    }
    
    return 'N/A';
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') {
      return 'N/A';
    }
    
    try {
      // Handle ISO format
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if can't parse
      }
      
      // Format: Dec 25, 2025 at 11:43 AM
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) + ' at ' + date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return dateString;
    }
  };

  const getChartData = () => {
    const consumed = parseDataValue(esimData?.data_consumed);
    const remaining = parseDataValue(esimData?.data_remaining);

    return [
      { name: 'Consumed', value: consumed, color: '#64748b' },
      { name: 'Remaining', value: remaining, color: '#1e293b' }
    ];
  };

  const getRemainingData = () => {
    return parseDataValue(esimData?.data_remaining);
  };

  // Compact data field component
  const CompactField = ({ label, value, copyable = false, copyKey = '' }) => (
    <Box>
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
        {label}
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        mt: 0.5
      }}>
        <Typography variant="body2" sx={{ 
          fontWeight: 600, 
          color: '#1e293b',
          fontSize: '0.95rem',
          wordBreak: 'break-word'
        }}>
          {value}
        </Typography>
        {copyable && (
          <Tooltip title={copiedField === copyKey ? 'Copied!' : 'Copy'}>
            <IconButton 
              size="small" 
              onClick={() => handleCopy(value, copyKey)} 
              sx={{ 
                padding: '4px',
                color: '#64748b',
                '&:hover': { color: '#1e293b', backgroundColor: '#f1f5f9' }
              }}
            >
              <ContentCopyIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      width: '100%',
    }}>
      {/* Compact Header */}
      <Box sx={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e2e8f0',
        px: { xs: 2, md: 4 },
        py: 2
      }}>
        <Box sx={{ maxWidth: '1800px', mx: 'auto' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                color: '#1e293b'
              }}>
                eSIM Status Report
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Provider: {esimData.api_provider}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label={esimData.status}
                size="small"
                sx={{ 
                  backgroundColor: esimData.status?.toLowerCase() === 'active' || esimData.status?.toLowerCase() === 'released' ? '#dcfce7' : '#fef3c7',
                  color: esimData.status?.toLowerCase() === 'active' || esimData.status?.toLowerCase() === 'released' ? '#166534' : '#92400e',
                  fontWeight: 700,
                }}
              />
              <Button 
                variant="outlined" 
                size="small"
                onClick={onCheckAnother} 
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#e2e8f0',
                  color: '#1e293b'
                }}
              >
                Check Another
              </Button>
              <Button 
                variant="contained" 
                size="small"
                onClick={onRenewPackage} 
                sx={{ 
                  backgroundColor: '#1e293b',
                  textTransform: 'none'
                }}
              >
                Renew
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: '#e2e8f0', backgroundColor: 'white' }}>
        <Box sx={{ maxWidth: '1800px', mx: 'auto', px: { xs: 2, md: 4 } }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                color: '#64748b',
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 48,
                px: 3,
              },
              '& .Mui-selected': {
                color: '#1e293b !important',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#1e293b',
                height: 3,
              },
            }}
          >
            <Tab label="Overview Dashboard" />
            <Tab label="Complete Details" />
          </Tabs>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: '1800px', mx: 'auto', px: { xs: 2, md: 4 }, py: 3 }}>
        {/* Tab 0: Overview */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Left: Quick Info Cards */}
            <Grid item xs={12} lg={9}>
              <Grid container spacing={2}>
                {/* Quick Stats Row */}
                <Grid item xs={6} sm={6} md={3}>
                  <Paper sx={{ p: 2, height: '100%', border: '1px solid #e2e8f0' }} elevation={0}>
                    <CompactField label="Data Capacity" value={getDataCapacity()} />
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                  <Paper sx={{ p: 2, height: '100%', border: '1px solid #e2e8f0' }} elevation={0}>
                    <CompactField label="Data Consumed" value={esimData.data_consumed} />
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                  <Paper sx={{ p: 2, height: '100%', border: '1px solid #e2e8f0' }} elevation={0}>
                    <CompactField label="Data Remaining" value={esimData.data_remaining} />
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                  <Paper sx={{ p: 2, height: '100%', border: '1px solid #e2e8f0' }} elevation={0}>
                    <CompactField label="Validity" value={getValidityPeriod()} />
                  </Paper>
                </Grid>

                {/* Details Card */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, border: '1px solid #e2e8f0' }} elevation={0}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
                      eSIM Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={6} lg={3}>
                        <CompactField label="ICCID" value={esimData.iccid} copyable copyKey="iccid" />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} lg={3}>
                        <CompactField label="Order/SIM ID" value={esimData.order_sim_id} copyable copyKey="order_id" />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} lg={3}>
                        <CompactField label="Purchase Date" value={formatDate(esimData.purchase_date)} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} lg={3}>
                        <CompactField label="Status" value={esimData.status} />
                      </Grid>
                      <Grid item xs={12}>
                        <CompactField label="Plan Description" value={esimData.plan_name} />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>

            {/* Right: Chart */}
            <Grid item xs={12} lg={3}>
              <Paper sx={{ p: 2, textAlign: 'center', height: '100%', border: '1px solid #e2e8f0' }} elevation={0}>
                {esimData.data_consumed !== 'N/A' && esimData.data_remaining !== 'N/A' ? (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>
                      Usage Overview
                    </Typography>
                    
                    <Box position="relative" display="inline-block" sx={{ width: '100%', maxWidth: 200 }}>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie 
                            data={getChartData()} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={50} 
                            outerRadius={85} 
                            paddingAngle={2} 
                            dataKey="value"
                          >
                            {getChartData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <Box sx={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)', 
                        textAlign: 'center' 
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>
                          {getRemainingData().toFixed(1)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                          GB left
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" justifyContent="center" gap={2} mt={2}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Box sx={{ width: 12, height: 12, backgroundColor: '#64748b', borderRadius: '2px' }} />
                        <Typography variant="caption" sx={{ color: '#64748b' }}>Consumed</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Box sx={{ width: 12, height: 12, backgroundColor: '#1e293b', borderRadius: '2px' }} />
                        <Typography variant="caption" sx={{ color: '#64748b' }}>Remaining</Typography>
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      No usage data available
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Tab 1: Complete Details - HORIZONTAL LAYOUT */}
        {activeTab === 1 && (
          <Box>
            <Paper sx={{ p: 3, border: '1px solid #e2e8f0', overflow: 'auto' }} elevation={0}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1e293b' }}>
                Complete eSIM Details
              </Typography>

              {/* Responsive Grid Layout */}
              <Grid container spacing={2}>
                {/* Row 1: Identifiers */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, height: '100%' }}>
                    <CompactField label="Order/SIM ID" value={esimData.order_sim_id} copyable copyKey="order_id" />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, height: '100%' }}>
                    <CompactField label="ICCID" value={esimData.iccid} copyable copyKey="iccid" />
                  </Box>
                </Grid>

                {/* Row 2: Status & Date */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, height: '100%' }}>
                    <CompactField label="Status" value={esimData.status} />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, height: '100%' }}>
                    <CompactField label="Purchase Date" value={formatDate(esimData.purchase_date)} />
                  </Box>
                </Grid>

                {/* Row 3: Plan Details */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, height: '100%' }}>
                    <CompactField label="Validity Period" value={getValidityPeriod()} />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, height: '100%' }}>
                    <CompactField label="Data Capacity" value={getDataCapacity()} />
                  </Box>
                </Grid>

                {/* Row 4: Usage */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, height: '100%' }}>
                    <CompactField label="Data Consumed" value={esimData.data_consumed} />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, height: '100%' }}>
                    <CompactField label="Data Remaining" value={esimData.data_remaining} />
                  </Box>
                </Grid>

                {/* Row 5: Plan Description (Full Width) */}
                <Grid item xs={12}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                    <CompactField label="Plan Description" value={esimData.plan_name} />
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Configuration Details - Horizontal */}
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1e293b' }}>
                Configuration Details
              </Typography>

              {/* Configuration in responsive grid */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                    <CompactField 
                      label="Activation Code" 
                      value={esimData.activation_code} 
                      copyable 
                      copyKey="activation_code" 
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                    <CompactField 
                      label="APN (Access Point Name)" 
                      value={esimData.apn} 
                      copyable 
                      copyKey="apn" 
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ESIMResults;
