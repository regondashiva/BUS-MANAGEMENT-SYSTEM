import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import WebSocketService from '../services/websocket';
import AuthContext from './AuthContext';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [busDetails, setBusDetails] = useState(null);
  const [seatMap, setSeatMap] = useState([]);
  const [lockedSeats, setLockedSeats] = useState({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: Select Seats, 2: Passenger Details, 3: Payment
  const [passengerDetails, setPassengerDetails] = useState([{ name: '', age: '', gender: '' }]);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [bookingStatus, setBookingStatus] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // Initialize WebSocket connection when bus details are loaded
  useEffect(() => {
    if (busDetails?.id) {
      connectWebSocket(busDetails.id);
      
      // Clean up WebSocket on unmount
      return () => {
        WebSocketService.disconnect();
      };
    }
  }, [busDetails?.id]);

  const connectWebSocket = useCallback((busId) => {
    if (!busId) return;
    
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      // Disconnect any existing connection
      WebSocketService.disconnect();
      
      // Connect to WebSocket
      WebSocketService.connect(busId);
      
      // Set up callbacks
      WebSocketService.addCallback('seat_status_update', handleSeatStatusUpdate);
      
      // Handle initial connection state
      const checkConnection = setInterval(() => {
        if (WebSocketService.socket && WebSocketService.socket.readyState === WebSocket.OPEN) {
          setIsConnecting(false);
          clearInterval(checkConnection);
        } else if (WebSocketService.reconnectAttempts >= WebSocketService.maxReconnectAttempts) {
          setConnectionError('Unable to connect to the server. Please refresh the page.');
          setIsConnecting(false);
          clearInterval(checkConnection);
        }
      }, 500);
      
      return () => clearInterval(checkConnection);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setConnectionError('Failed to connect to the server. Please try again.');
      setIsConnecting(false);
    }
  }, []);

  const handleSeatStatusUpdate = useCallback((data) => {
    if (data.seat_id && data.status) {
      setLockedSeats(prev => ({
        ...prev,
        [data.seat_id]: data.status === 'locked' 
          ? { locked: true, locked_by: data.locked_by, locked_until: data.locked_until }
          : { locked: false }
      }));
    }
  }, []);

  const selectSeat = useCallback((seatId) => {
    if (!busDetails?.id || !user?.id) return;
    
    const seatIndex = selectedSeats.findIndex(id => id === seatId);
    const isSeatLocked = lockedSeats[seatId]?.locked && lockedSeats[seatId]?.locked_by !== user.id;
    
    if (isSeatLocked) {
      alert('This seat is currently being booked by another user. Please select another seat.');
      return;
    }
    
    if (seatIndex === -1) {
      // Lock the seat
      const locked = WebSocketService.lockSeat(busDetails.id, seatId, user.id);
      if (locked) {
        setSelectedSeats(prev => [...prev, seatId]);
      }
    } else {
      // Unlock the seat
      const unlocked = WebSocketService.unlockSeat(busDetails.id, seatId, user.id);
      if (unlocked) {
        setSelectedSeats(prev => prev.filter(id => id !== seatId));
      }
    }
  }, [busDetails?.id, user?.id, selectedSeats, lockedSeats]);

  const loadBusDetails = useCallback(async (busId) => {
    if (!busId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/buses/${busId}/`);
      
      if (!response.ok) {
        throw new Error('Failed to load bus details');
      }
      
      const data = await response.json();
      setBusDetails(data);
      
      // Initialize seat map based on bus layout
      if (data.seats) {
        const seats = Array.isArray(data.seats) ? data.seats : Object.values(data.seats);
        setSeatMap(seats);
        
        // Initialize locked seats
        const initialLocked = {};
        seats.forEach(seat => {
          if (seat.status === 'locked') {
            initialLocked[seat.id] = {
              locked: true,
              locked_by: seat.locked_by,
              locked_until: seat.locked_until
            };
          }
        });
        setLockedSeats(initialLocked);
      }
    } catch (error) {
      console.error('Error loading bus details:', error);
      setConnectionError('Failed to load bus details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePassengerDetails = useCallback((index, field, value) => {
    setPassengerDetails(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const addPassenger = useCallback(() => {
    if (passengerDetails.length < selectedSeats.length) {
      setPassengerDetails(prev => [...prev, { name: '', age: '', gender: '' }]);
    }
  }, [passengerDetails.length, selectedSeats.length]);

  const removePassenger = useCallback((index) => {
    if (passengerDetails.length > 1) {
      setPassengerDetails(prev => prev.filter((_, i) => i !== index));
    }
  }, [passengerDetails.length]);

  const createBooking = useCallback(async () => {
    if (!busDetails?.id || !user?.id || selectedSeats.length === 0) return;
    
    try {
      setLoading(true);
      setBookingStatus(null);
      setBookingError(null);
      
      const bookingData = {
        bus: busDetails.id,
        seats: selectedSeats,
        passengers: passengerDetails,
        payment_method: paymentMethod,
        total_amount: selectedSeats.length * (busDetails.price || 0)
      };
      
      const response = await fetch('/api/bookings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(bookingData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create booking');
      }
      
      const booking = await response.json();
      setBookingStatus('success');
      setBookingStep(3); // Move to payment/confirmation step
      
      // Clear selected seats after successful booking
      setSelectedSeats([]);
      
      return booking;
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError(error.message || 'Failed to create booking');
      setBookingStatus('error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [busDetails, user, selectedSeats, passengerDetails, paymentMethod]);

  const cancelBooking = useCallback(async (bookingId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/bookings/${bookingId}/cancel/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to cancel booking');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Cancellation error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

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

  const resetBooking = useCallback(() => {
    setSelectedSeats([]);
    setPassengerDetails([{ name: '', age: '', gender: '' }]);
    setBookingStep(1);
    setBookingStatus(null);
    setBookingError(null);
  }, []);

  const value = {
    // State
    selectedSeats,
    busDetails,
    seatMap,
    lockedSeats,
    isConnecting,
    connectionError,
    loading,
    bookingStep,
    passengerDetails,
    paymentMethod,
    bookingStatus,
    bookingError,
    
    // Actions
    loadBusDetails,
    selectSeat,
    setBookingStep,
    updatePassengerDetails,
    addPassenger,
    removePassenger,
    setPaymentMethod,
    createBooking,
    cancelBooking,
    resetBooking
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export default BookingContext;
