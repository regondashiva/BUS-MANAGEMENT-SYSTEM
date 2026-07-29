import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCookie } from '../utils/cookies';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/profile/', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const userData = await response.json();
      
      // Store the token in localStorage
      if (userData.token) {
        localStorage.setItem('token', userData.token);
      }
      
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || 
          Object.values(errorData).flat().join(' ') || 
          'Registration failed'
        );
      }

      const data = await response.json();
      setUser(data.user);
      return data;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCookie('csrftoken')
        },
        credentials: 'include',
      });
      
      setUser(null);
      return true;
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to log out. Please try again.');
      return false;
    }
  };

  const updateProfile = async (userData) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/auth/user/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || 
          Object.values(errorData).flat().join(' ') || 
          'Failed to update profile'
        );
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  const changePassword = async (currentPassword, newPassword1, newPassword2) => {
    try {
      const response = await fetch('/api/auth/password/change/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
          old_password: currentPassword,
          new_password1: newPassword1,
          new_password2: newPassword2
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || 
          Object.values(errorData).flat().join(' ') || 
          'Failed to change password'
        );
      }

      return true;
    } catch (err) {
      console.error('Password change error:', err);
      setError(err.message || 'Failed to change password');
      throw err;
    }
  };

  // Helper function to get CSRF token
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
