import React, { useState } from 'react';
import './App.css';
import { checkESIMStatus } from './services/esimService';
import ESIMResults from './components/ESIMResults';
import SearchForm from './components/SearchForm';

function App() {
  const [iccid, setIccid] = useState('');
  const [loading, setLoading] = useState(false);
  const [esimData, setEsimData] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setEsimData(null);
    
    // Validate ICCID
    if (!iccid.trim()) {
      setError({ error: 'Invalid Input', details: 'Please enter an ICCID' });
      return;
    }
    
    const cleanedICCID = iccid.trim().replace(/\s+/g, '').replace(/-/g, '');
    
    if (cleanedICCID.length < 10) {
      setError({ error: 'Invalid ICCID', details: 'ICCID must be at least 10 characters long' });
      return;
    }
    
    // Fetch eSIM data
    setLoading(true);
    
    try {
      const result = await checkESIMStatus(cleanedICCID);
      
      if (result.success) {
        setEsimData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError({ error: 'Unexpected Error', details: 'Please try again later' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setIccid('');
    setEsimData(null);
    setError(null);
  };

  return (
    <div className="App">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1>🌐 eSIM Status Checker</h1>
          <p>Check your eSIM status across multiple providers instantly</p>
        </div>

        {/* Search Form */}
        <SearchForm
          iccid={iccid}
          onICCIDChange={setIccid}
          onSubmit={handleSubmit}
          loading={loading}
        />

        {/* Loading State */}
        {loading && (
          <div className="search-card">
            <div className="loading">
              <div className="spinner"></div>
              <p>Checking eSIM status across all providers...</p>
              <p style={{ fontSize: '0.9rem', marginTop: '10px', opacity: 0.7 }}>
                This may take a few moments
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="search-card">
            <div className="error-card">
              <h3>❌ {error.error}</h3>
              <p>{error.details}</p>
              {error.iccid && (
                <p style={{ marginTop: '10px', fontSize: '0.9rem', opacity: 0.8 }}>
                  ICCID: {error.iccid}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {esimData && !loading && (
          <ESIMResults data={esimData} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}

export default App;
