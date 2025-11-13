import React from 'react';

const SearchForm = ({ iccid, onICCIDChange, onSubmit, loading }) => {
  return (
    <div className="search-card">
      <form className="search-form" onSubmit={onSubmit}>
        <div className="input-group">
          <label htmlFor="iccid">Enter ICCID</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="iccid"
              placeholder="e.g., 89001012345678901234"
              value={iccid}
              onChange={(e) => onICCIDChange(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
            <span className="input-icon">📱</span>
          </div>
          <small style={{ color: '#666', fontSize: '0.85rem' }}>
            Enter the ICCID of your eSIM (typically 19-20 digits)
          </small>
        </div>
        
        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading || !iccid.trim()}
        >
          {loading ? 'Checking...' : 'Check eSIM Status'}
        </button>
      </form>
    </div>
  );
};

export default SearchForm;

