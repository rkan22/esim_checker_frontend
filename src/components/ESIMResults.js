import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Button,
  Tabs,
  Tab,
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

  const getChartData = () => {
    const consumed = parseDataValue(esimData?.data_consumed);
    const remaining = parseDataValue(esimData?.data_remaining);

    return [
      { name: 'Consumed', value: consumed, color: '#6b7280' },
      { name: 'Remaining', value: remaining, color: '#1a1a1a' }
    ];
  };

  const getRemainingData = () => {
    return parseDataValue(esimData?.data_remaining);
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
      }}
    >
        <Paper
          elevation={0}
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            p: 0,
            color: '#1a1a1a',
            position: 'relative',
            overflow: 'hidden',
            maxWidth: 950,
            width: '100%',
          }}
        >
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: '#e5e7eb' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  color: '#6b7280',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  minHeight: 48,
                },
                '& .Mui-selected': {
                  color: '#1a1a1a !important',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#1a1a1a',
                },
              }}
            >
              <Tab label="Overview" />
              <Tab label="Details" />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>
            {/* Tab 0: Overview (Compact View) */}
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.75rem', color: '#1a1a1a' }}>
                      eSIM Details
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      Status:{' '}
                      <span style={{ color: esimData.status?.toLowerCase() === 'active' ? '#10b981' : '#ef5350' }}>
                        {esimData.status}
                      </span>
                    </Typography>
                  </Box>

                  <Box mb={2}>
                    <Box sx={{ display: 'inline-block', backgroundColor: '#f3f4f6', color: '#6b7280', px: 2, py: 0.5, borderRadius: '8px', fontSize: '0.7rem', fontWeight: 600 }}>
                      DATA SOURCE: {esimData.api_provider}
                    </Box>
                  </Box>

                  {/* ICCID */}
                  <Box mb={1.5}>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>
                      ICCID:
                    </Typography>
                    <Box sx={{ backgroundColor: '#f9fafb', color: '#1a1a1a', p: 1.2, borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <Box sx={{ wordBreak: 'break-all', pr: 1 }}>{esimData.iccid}</Box>
                      <Tooltip title={copiedField === 'iccid' ? 'Copied!' : 'Copy'}>
                        <IconButton size="small" onClick={() => handleCopy(esimData.iccid, 'iccid')} sx={{ color: '#6b7280' }}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Box mb={1.5}>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>
                      Description:
                    </Typography>
                    <Box sx={{ backgroundColor: '#f9fafb', color: '#1a1a1a', p: 1.2, borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: 500, fontSize: '0.875rem' }}>
                      {esimData.plan_name}
                    </Box>
                  </Box>

                  {/* Start/End Time */}
                  <Grid container spacing={2} mb={1.5}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>
                        Start Time:
                      </Typography>
                      <Box sx={{ backgroundColor: '#f9fafb', color: '#1a1a1a', p: 1.2, borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: 500, fontSize: '0.875rem' }}>
                        {esimData.purchase_date}
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>
                        End Time:
                      </Typography>
                      <Box sx={{ backgroundColor: '#f9fafb', color: '#1a1a1a', p: 1.2, borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: 500, fontSize: '0.875rem' }}>
                        {esimData.validity}
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Unlimited/Status */}
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>
                        Unlimited:
                      </Typography>
                      <Box sx={{ backgroundColor: '#f9fafb', color: '#1a1a1a', p: 1.2, borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: 500, fontSize: '0.875rem' }}>
                        No
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>
                        Status:
                      </Typography>
                      <Box sx={{ backgroundColor: '#f9fafb', color: esimData.status?.toLowerCase() === 'active' ? '#10b981' : '#f59e0b', p: 1.2, borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: 600, fontSize: '0.875rem' }}>
                        {esimData.status}
                      </Box>
                    </Grid>
                  </Grid>

                  <Box display="flex" gap={2}>
                    <Button variant="outlined" fullWidth onClick={onCheckAnother} sx={{ color: '#1a1a1a', borderColor: '#e5e7eb', py: 1.2, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.9rem', '&:hover': { borderColor: '#d1d5db', backgroundColor: '#f9fafb' } }}>
                      Check another eSIM
                    </Button>
                    <Button variant="contained" fullWidth onClick={onRenewPackage} sx={{ backgroundColor: '#1a1a1a', color: 'white', py: 1.2, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.9rem', '&:hover': { backgroundColor: '#2d2d2d' } }}>
                      Renew Package
                    </Button>
                  </Box>
                </Grid>

                {/* Right Side - Chart */}
                <Grid item xs={12} md={6}>
                  <Box textAlign="center">
                    {esimData.data_consumed !== 'N/A' && esimData.data_remaining !== 'N/A' ? (
                      <>
                        <Box position="relative" display="inline-block" mb={2} mt={2}>
                          <ResponsiveContainer width={240} height={240}>
                            <PieChart>
                              <Pie data={getChartData()} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={0} dataKey="value">
                                {getChartData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <Typography variant="h3" sx={{ fontWeight: 700, color: '#1a1a1a', lineHeight: 1, fontSize: '2rem' }}>
                              {getRemainingData().toFixed(2)} MB
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#6b7280', mt: 0.5, fontWeight: 600 }}>
                              left
                            </Typography>
                          </Box>
                        </Box>

                        <Box display="flex" justifyContent="center" gap={3} mb={2}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box sx={{ width: 10, height: 10, backgroundColor: '#6b7280', borderRadius: '50%' }} />
                            <Typography variant="body2" fontSize="0.75rem" color="#6b7280">Quantity Consumed</Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box sx={{ width: 10, height: 10, backgroundColor: '#1a1a1a', borderRadius: '50%' }} />
                            <Typography variant="body2" fontSize="0.75rem" color="#6b7280">Remaining</Typography>
                          </Box>
                        </Box>

                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, fontSize: '0.875rem', color: '#1a1a1a' }}>
                          Initial Quantity: {esimData.data_capacity}
                        </Typography>

                        <Box textAlign="left" sx={{ px: 2 }}>
                          <Box display="flex" justifyContent="space-between" mb={0.8}>
                            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>Data Consumed:</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem', color: '#1a1a1a' }}>{esimData.data_consumed}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" mb={0.8}>
                            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>Data Remaining:</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem', color: '#1a1a1a' }}>{esimData.data_remaining}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>Total Capacity:</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem', color: '#1a1a1a' }}>{esimData.data_capacity}</Typography>
                          </Box>
                        </Box>

                        {esimData.last_updated && (
                          <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', fontSize: '0.65rem' }}>
                            Last Updated: {new Date(esimData.last_updated).toLocaleString()}
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Box sx={{ height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>No usage data available</Typography>
                        <Typography variant="body2" sx={{ color: '#9ca3af' }}>eSIM may be inactive or not yet activated</Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            )}

            {/* Tab 1: Details (Full View) */}
            {activeTab === 1 && (
              <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, fontSize: '2rem', color: '#1a1a1a' }}>
                    eSIM Details
                  </Typography>

                  <Box mb={2}>
                    <Box sx={{ display: 'inline-block', backgroundColor: '#f3f4f6', color: '#6b7280', px: 2, py: 0.5, borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>
                      DATA SOURCE: {esimData.api_provider}
                    </Box>
                  </Box>

                  {/* Order/SIM ID */}
                  <Box mb={2.5}>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5, fontSize: '0.875rem' }}>Order/SIM ID:</Typography>
                    <Box sx={{ backgroundColor: '#f9fafb', color: '#1a1a1a', p: 1.5, borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {esimData.order_sim_id}
                      <Tooltip title={copiedField === 'order_id' ? 'Copied!' : 'Copy'}>
                        <IconButton size="small" onClick={() => handleCopy(esimData.order_sim_id, 'order_id')} sx={{ color: '#6b7280' }}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* ICCID */}
                  <Box mb={2.5}>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5, fontSize: '0.875rem' }}>ICCID:</Typography>
                    <Box sx={{ backgroundColor: '#f9fafb', color: '#1a1a1a', p: 1.5, borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ wordBreak: 'break-all', pr: 1 }}>{esimData.iccid}</Box>
                      <Tooltip title={copiedField === 'iccid' ? 'Copied!' : 'Copy'}>
                        <IconButton size="small" onClick={() => handleCopy(esimData.iccid, 'iccid')} sx={{ color: '#6b7280' }}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Plan Name */}
                  <Box mb={2.5}>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5, fontSize: '0.875rem' }}>Plan Name:</Typography>
                    <Box sx={{ backgroundColor: '#f9fafb', color: '#1a1a1a', p: 1.5, borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: 500 }}>
                      {esimData.plan_name}
                    </Box>
                  </Box>

                  {/* Status */}
                  <Box mb={2.5}>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5, fontSize: '0.875rem' }}>Status:</Typography>
                    <Box sx={{ backgroundColor: '#f9fafb', color: esimData.status?.toLowerCase() === 'active' ? '#10b981' : '#f59e0b', p: 1.5, borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: 600 }}>
                      {esimData.status}
                    </Box>
                  </Box>

                  {/* Purchase Date and Validity */}
                  <Grid container spacing={2} mb={2.5}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5, fontSize: '0.875rem' }}>Purchase Date:</Typography>
                      <Box sx={{ backgroundColor: '#f9fafb', color: '#1a1a1a', p: 1.5, borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: 500, fontSize: '0.875rem' }}>
                        {esimData.purchase_date}
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5, fontSize: '0.875rem' }}>Validity:</Typography>
                      <Box sx={{ backgroundColor: '#f9fafb', color: '#1a1a1a', p: 1.5, borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: 500, fontSize: '0.875rem' }}>
                        {esimData.validity}
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Data Capacity */}
                  <Box mb={2.5}>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5, fontSize: '0.875rem' }}>Data Capacity:</Typography>
                    <Box sx={{ backgroundColor: '#f9fafb', color: '#1a1a1a', p: 1.5, borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: 500 }}>
                      {esimData.data_capacity}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2, backgroundColor: '#e5e7eb' }} />

                  {/* Activation Code */}
                  <Box mb={2.5}>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5, fontSize: '0.875rem' }}>Activation Code:</Typography>
                    <Box sx={{ backgroundColor: '#f9fafb', color: '#1a1a1a', p: 1.5, borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: 400, fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                      <Box flex={1}>{esimData.activation_code}</Box>
                      <Tooltip title={copiedField === 'activation' ? 'Copied!' : 'Copy'}>
                        <IconButton size="small" onClick={() => handleCopy(esimData.activation_code, 'activation')} sx={{ color: '#6b7280', mt: -0.5 }}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* APN */}
                  <Box mb={3}>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5, fontSize: '0.875rem' }}>APN (Access Point Name):</Typography>
                    <Box sx={{ backgroundColor: '#f9fafb', color: '#1a1a1a', p: 1.5, borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {esimData.apn}
                      <Tooltip title={copiedField === 'apn' ? 'Copied!' : 'Copy'}>
                        <IconButton size="small" onClick={() => handleCopy(esimData.apn, 'apn')} sx={{ color: '#6b7280' }}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box display="flex" gap={2}>
                    <Button variant="outlined" fullWidth onClick={onCheckAnother} sx={{ color: '#1a1a1a', borderColor: '#e5e7eb', py: 1.5, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '1rem', '&:hover': { borderColor: '#d1d5db', backgroundColor: '#f9fafb' } }}>
                      Check another eSIM
                    </Button>
                    <Button variant="contained" fullWidth onClick={onRenewPackage} sx={{ backgroundColor: '#1a1a1a', color: 'white', py: 1.5, borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '1rem', '&:hover': { backgroundColor: '#2d2d2d' } }}>
                      Renew Package
                    </Button>
                  </Box>
                </Grid>

                {/* Right Side - Chart */}
                <Grid item xs={12} md={5}>
                  <Box textAlign="center">
                    <Typography variant="h6" sx={{ textAlign: 'right', mb: 3, fontWeight: 600, fontSize: '1.125rem' }}>
                      Status:{' '}
                      <span style={{ color: esimData.status?.toLowerCase() === 'active' ? '#10b981' : '#ef5350' }}>
                        {esimData.status}
                      </span>
                    </Typography>

                    {esimData.data_consumed !== 'N/A' && esimData.data_remaining !== 'N/A' ? (
                      <>
                        <Box position="relative" display="inline-block" mb={2}>
                          <ResponsiveContainer width={280} height={280}>
                            <PieChart>
                              <Pie data={getChartData()} cx="50%" cy="50%" innerRadius={85} outerRadius={130} paddingAngle={0} dataKey="value">
                                {getChartData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <Typography variant="h3" sx={{ fontWeight: 700, color: '#1a1a1a', lineHeight: 1, fontSize: '2.5rem' }}>
                              {getRemainingData().toFixed(2)} MB
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#6b7280', mt: 1, fontWeight: 600 }}>
                              left
                            </Typography>
                          </Box>
                        </Box>

                        <Box display="flex" justifyContent="center" gap={4} mb={3}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box sx={{ width: 12, height: 12, backgroundColor: '#6b7280', borderRadius: '50%' }} />
                            <Typography variant="body2" fontSize="0.875rem" color="#6b7280">Quantity Consumed</Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box sx={{ width: 12, height: 12, backgroundColor: '#1a1a1a', borderRadius: '50%' }} />
                            <Typography variant="body2" fontSize="0.875rem" color="#6b7280">Remaining</Typography>
                          </Box>
                        </Box>

                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                          Initial Quantity: {esimData.data_capacity}
                        </Typography>

                        <Divider sx={{ my: 2, backgroundColor: '#e5e7eb' }} />

                        <Box textAlign="left">
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>Data Consumed:</Typography>
                            <Typography variant="body2" fontWeight={600} color="#1a1a1a">{esimData.data_consumed}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>Data Remaining:</Typography>
                            <Typography variant="body2" fontWeight={600} color="#1a1a1a">{esimData.data_remaining}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>Total Capacity:</Typography>
                            <Typography variant="body2" fontWeight={600} color="#1a1a1a">{esimData.data_capacity}</Typography>
                          </Box>
                        </Box>

                        {esimData.last_updated && (
                          <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mt: 2 }}>
                            Last Updated: {new Date(esimData.last_updated).toLocaleString()}
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Box sx={{ height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>No usage data available</Typography>
                        <Typography variant="body2" sx={{ color: '#9ca3af' }}>eSIM may be inactive or not yet activated</Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            )}
          </Box>
        </Paper>
    </Box>
  );
}

export default ESIMResults;
