import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import RenewalSuccess from './pages/RenewalSuccess';
import RenewalCancelled from './pages/RenewalCancelled';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/renewal/success" element={<RenewalSuccess />} />
        <Route path="/renewal/cancelled" element={<RenewalCancelled />} />
      </Routes>
    </Router>
  );
}

export default App;
