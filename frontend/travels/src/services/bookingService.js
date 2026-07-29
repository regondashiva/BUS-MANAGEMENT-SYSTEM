import { getCookie } from '../utils/cookies';

const API_BASE_URL = '/api';

// Helper function to handle API requests
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCookie('csrftoken'),
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Something went wrong');
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// Booking related API calls
export const bookingService = {
  // Get all bookings for the current user
  getMyBookings: async () => {
    return fetchWithAuth('/bookings/');
  },

  // Get upcoming bookings
  getUpcomingBookings: async () => {
    return fetchWithAuth('/bookings/upcoming/');
  },

  // Get past bookings
  getPastBookings: async () => {
    return fetchWithAuth('/bookings/past/');
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    return fetchWithAuth(`/bookings/${bookingId}/`);
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    return fetchWithAuth('/bookings/', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // Cancel a booking
  cancelBooking: async (bookingId, cancellationData) => {
    return fetchWithAuth(`/bookings/${bookingId}/cancel/`, {
      method: 'POST',
      body: JSON.stringify(cancellationData),
    });
  },

  // Get available seats for a bus
  getAvailableSeats: async (busId) => {
    return fetchWithAuth(`/buses/${busId}/seats/`);
  },

  // Lock a seat
  lockSeat: async (busId, seatId) => {
    return fetchWithAuth(`/buses/${busId}/lock_seat/`, {
      method: 'POST',
      body: JSON.stringify({ seat_id: seatId }),
    });
  },

  // Unlock a seat
  unlockSeat: async (busId, seatId) => {
    return fetchWithAuth(`/buses/${busId}/unlock_seat/`, {
      method: 'POST',
      body: JSON.stringify({ seat_id: seatId }),
    });
  },

  // Search buses
  searchBuses: async (searchParams) => {
    const queryParams = new URLSearchParams(searchParams).toString();
    return fetchWithAuth(`/buses/search/?${queryParams}`);
  },

  // Get user profile
  getUserProfile: async () => {
    return fetchWithAuth('/profile/');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return fetchWithAuth('/profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

export default bookingService;
