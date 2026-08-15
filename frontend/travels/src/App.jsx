import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { API_BASE_URL } from './config';
// Components
import RegisterForm from './deepcomponents/RegisterForm';
import LoginForm from './deepcomponents/LoginForm';
import BusList from './deepcomponents/BusList';
import BusSeats from './deepcomponents/BusSeats';
import UserBookings from './deepcomponents/UserBooking';
import Wrapper from './deepcomponents/Wrapper';
import BookingHistory from './components/booking/BookingHistory';

const App = () => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [userId, setUserId] = useState(() => localStorage.getItem('userId'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [selectedBusId, setSelectedBusId] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    setToken(null);
    setUserId(null);
    setUser(null);
    setSelectedBusId(null);
  };

  // Auto-seed database on app startup if needed
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/seed-database/`)
      .then(res => res.json())
      .then(data => console.log('Database auto-seed check:', data))
      .catch(err => console.log('Database auto-seed check skipped:', err));
  }, []);

  // Verify auth token & fetch user profile on app start / token change
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/profile/`, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            handleLogout();
          }
          return null;
        }
        return res.json();
      })
      .then(userData => {
        if (userData && userData.id) {
          localStorage.setItem('userId', userData.id);
          localStorage.setItem('user', JSON.stringify(userData));
          setUserId(userData.id);
          setUser(userData);
        }
      })
      .catch(() => {});
  }, [token]);

  const handleLogin = (authToken, userData) => {
    if (!authToken || !userData) return;
    localStorage.setItem('token', authToken);
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(authToken);
    setUserId(userData.id);
    setUser(userData);
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
          <Route path="/register" element={<RegisterForm onLogin={handleLogin} />} />
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
  );
};

export default App;
