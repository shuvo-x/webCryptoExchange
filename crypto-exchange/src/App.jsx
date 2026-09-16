import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Home } from './pages/Home';
import { Markets } from './pages/Markets';
import { Trade } from './pages/Trade';
import { Wallet } from './pages/Wallet';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Admin } from './pages/Admin';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProfileErrorBanner } from './components/ProfileErrorBanner';
import { useMarketDataSocket } from './hooks/useMarketDataSocket';

function App() {
  useMarketDataSocket();

  return (
    <Router>
      <Navbar />
      <ProfileErrorBanner />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/markets" element={<Markets />} />
        <Route path="/trade" element={<Trade />} />
        <Route path="/trade/:symbol" element={<Trade />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;