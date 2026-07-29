import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
// Components
import RegisterForm from './deepcomponents/RegisterForm';
import LoginForm from './deepcomponents/LoginForm';
import BusList from './deepcomponents/BusList';
import BusSeats from './deepcomponents/BusSeats';
import UserBookings from './deepcomponents/UserBooking';
import Wrapper from './deepcomponents/Wrapper';
import BookingHistory from './components/booking/BookingHistory';


const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [selectedBusId, setSelectedBusId] = useState(null);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setUserId(userData.id);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    setToken(null);
    setUserId(null);
    setUser(null);
    setSelectedBusId(null);
  };


  const handleUserUpdate = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <div className="app">
      <Wrapper token={token} user={user} onUserUpdate={handleUserUpdate} handleLogout={handleLogout}>
        <Routes>
          {/* Public Routes */}
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />

          {/* Protected Routes */}
          <Route path="/" element={<BusList onSelectBus={(id) => setSelectedBusId(id)} token={token} />} />
          <Route path="/bus/:busId" element={<BusSeats token={token} />} />

          {/* User Account Routes */}
          <Route path="/my-bookings" element={<UserBookings token={token} userId={userId} />} />
          <Route path="/booking-history" element={<BookingHistory />} />
          {/* 404 Route */}
          <Route path="*" element={
            <div className="not-found">
              <h1>404 - Page Not Found</h1>
              <p>The page you're looking for doesn't exist or has been moved.</p>
            </div>
          } />
        </Routes>
      </Wrapper>
    </div>
  )
}

export default App
