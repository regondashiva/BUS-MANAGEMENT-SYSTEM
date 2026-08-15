import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBus, FaUser, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaChair, FaMoneyBillWave, FaInfoCircle, FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useBooking } from '../../contexts/BookingContext';
import { API_BASE_URL } from '../../config';
import './BookingHistory.css';

const BookingHistory = () => {
  const { user } = useAuth();
  const { cancelBooking } = useBooking();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigate = useNavigate();

  // Fetch user's booking history
  useEffect(() => {
    const fetchBookings = async () => {
      console.log('Fetching bookings...');
      if (!user) {
        console.log('No user found, skipping fetch');
        return;
      }
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        console.log('Using token:', token ? 'Token exists' : 'No token found');
        
        // Get all bookings
        const [upcomingResponse, pastResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/bookings/upcoming/`, {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          }),
          fetch(`${API_BASE_URL}/api/bookings/past/`, {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          })
        ]);

        console.log('Upcoming status:', upcomingResponse.status);
        console.log('Past status:', pastResponse.status);
        
        if (!upcomingResponse.ok || !pastResponse.ok) {
          const errorText = await (upcomingResponse.ok ? pastResponse : upcomingResponse).text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch bookings: ${upcomingResponse.status} ${upcomingResponse.statusText}`);
        }
        
        const [upcomingData, pastData] = await Promise.all([
          upcomingResponse.json(),
          pastResponse.json()
        ]);
        
        console.log('Upcoming data:', upcomingData);
        console.log('Past data:', pastData);
        
        // Combine and sort bookings
        const allBookings = [
          ...(Array.isArray(upcomingData) ? upcomingData : upcomingData.results || []),
          ...(Array.isArray(pastData) ? pastData : pastData.results || [])
        ];
        
        setBookings(allBookings);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [user]);

  // Handle booking cancellation
  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const confirmCancellation = async () => {
    if (!selectedBooking || !cancellationReason.trim()) return;
    
    try {
      setCancellingId(selectedBooking.id);
      
      await cancelBooking(selectedBooking.id, {
        reason: cancellationReason,
        refund_method: 'original_payment',
        notify_user: true
      });
      
      // Update the local state to reflect the cancellation
      setBookings(bookings.map(booking => 
        booking.id === selectedBooking.id 
          ? { ...booking, status: 'cancelled', cancellation_date: new Date().toISOString() } 
          : booking
      ));
      
      // Reset states
      setShowCancelModal(false);
      setCancellationReason('');
      setSelectedBooking(null);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  // Format date to a readable string
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Calculate time until departure
  const getTimeUntilDeparture = (departureTime) => {
    const now = new Date();
    const departure = new Date(departureTime);
    const diffMs = departure - now;
    
    if (diffMs <= 0) return 'Departed';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `In ${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours} hr${diffHours !== 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `In ${diffHours} hr${diffHours !== 1 ? 's' : ''} ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
    } else {
      return `In ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'status-badge confirmed';
      case 'cancelled':
        return 'status-badge cancelled';
      case 'completed':
        return 'status-badge completed';
      case 'pending':
        return 'status-badge pending';
      default:
        return 'status-badge';
    }
  };

  // Filter bookings by status
  const upcomingBookings = bookings.filter(
    booking => booking.status.toLowerCase() === 'confirmed' && 
    new Date(booking.departure_time) > new Date()
  );
  
  const pastBookings = bookings.filter(
    booking => booking.status.toLowerCase() === 'completed' || 
    booking.status.toLowerCase() === 'cancelled' ||
    new Date(booking.departure_time) <= new Date()
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h3>Error Loading Bookings</h3>
        <p>{error}</p>
        <button 
          className="btn btn-primary" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="booking-history">
      <div className="page-header">
        <h1>My Bookings</h1>
        <p>View and manage your upcoming and past bus bookings</p>
      </div>

      {/* Upcoming Bookings */}
      <section className="bookings-section">
        <h2>Upcoming Journeys</h2>
        
        {upcomingBookings.length > 0 ? (
          <div className="bookings-grid">
            {upcomingBookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div className="booking-id">Booking #{booking.booking_number}</div>
                  <div className={getStatusBadgeClass(booking.status)}>
                    {booking.status}
                  </div>
                </div>
                
                <div className="booking-route">
                  <div className="route-dot start"></div>
                  <div className="route-line"></div>
                  <div className="route-dot end"></div>
                  
                  <div className="route-info">
                    <div className="route-from">
                      <div className="time">
                        {new Date(booking.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="location">{booking.source}</div>
                    </div>
                    
                    <div className="route-duration">
                      {booking.duration || '--h --m'}
                    </div>
                    
                    <div className="route-to">
                      <div className="time">
                        {new Date(booking.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="location">{booking.destination}</div>
                    </div>
                  </div>
                </div>
                
                <div className="booking-details">
                  <div className="detail-item">
                    <FaBus className="detail-icon" />
                    <div>
                      <div className="detail-label">Bus</div>
                      <div className="detail-value">
                        {booking.bus?.operator_name || 'N/A'} • {booking.bus?.bus_type || 'AC Sleeper'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <FaCalendarAlt className="detail-icon" />
                    <div>
                      <div className="detail-label">Travel Date</div>
                      <div className="detail-value">
                        {new Date(booking.departure_time).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <FaUser className="detail-icon" />
                    <div>
                      <div className="detail-label">Passengers</div>
                      <div className="detail-value">
                        {booking.passengers?.length || 1} {booking.passengers?.length === 1 ? 'Passenger' : 'Passengers'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <FaChair className="detail-icon" />
                    <div>
                      <div className="detail-label">Seats</div>
                      <div className="detail-value seats-list">
                        {booking.seats?.map((seat, idx) => (
                          <span key={idx} className="seat-tag">{seat.seat_number}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <FaMoneyBillWave className="detail-icon" />
                    <div>
                      <div className="detail-label">Total Amount</div>
                      <div className="detail-value amount">
                        ₹{booking.total_amount?.toLocaleString('en-IN') || '0'}
                        {booking.payment_status === 'refunded' && (
                          <span className="refund-badge">Refunded</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="booking-actions">
                  <div className="departure-time">
                    <FaClock className="time-icon" />
                    <span>{getTimeUntilDeparture(booking.departure_time)}</span>
                  </div>
                  
                  <div className="action-buttons">
                    <button 
                      className="btn btn-outline"
                      onClick={() => navigate(`/bookings/${booking.id}`)}
                    >
                      View Details
                    </button>
                    
                    {booking.status.toLowerCase() === 'confirmed' && (
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleCancelClick(booking)}
                        disabled={cancellingId === booking.id}
                      >
                        {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    )}
                  </div>
                </div>
                
                {booking.cancellation_policy && (
                  <div className="cancellation-policy">
                    <FaInfoCircle className="info-icon" />
                    <span>{booking.cancellation_policy}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-bookings">
            <div className="no-bookings-icon">
              <FaBus />
            </div>
            <h3>No Upcoming Journeys</h3>
            <p>You don't have any upcoming bus bookings.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/search')}
            >
              Book a Bus
            </button>
          </div>
        )}
      </section>
      
      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <section className="bookings-section past-bookings">
          <h2>Past Journeys</h2>
          
          <div className="bookings-grid">
            {pastBookings.map(booking => (
              <div key={booking.id} className="booking-card past">
                <div className="booking-header">
                  <div className="booking-id">Booking #{booking.booking_number}</div>
                  <div className={getStatusBadgeClass(booking.status)}>
                    {booking.status}
                  </div>
                </div>
                
                <div className="booking-route">
                  <div className="route-dot start"></div>
                  <div className="route-line"></div>
                  <div className="route-dot end"></div>
                  
                  <div className="route-info">
                    <div className="route-from">
                      <div className="location">{booking.source}</div>
                      <div className="time">
                        {new Date(booking.departure_time).toLocaleDateString('short')}
                      </div>
                    </div>
                    
                    <div className="route-to">
                      <div className="location">{booking.destination}</div>
                      <div className="time">
                        {new Date(booking.arrival_time).toLocaleDateString('short')}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="booking-actions">
                  <div className="travel-date">
                    <FaCalendarAlt className="calendar-icon" />
                    <span>
                      {new Date(booking.departure_time).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="action-buttons">
                    <button 
                      className="btn btn-outline"
                      onClick={() => navigate(`/bookings/${booking.id}`)}
                    >
                      View Details
                    </button>
                    
                    {booking.status.toLowerCase() === 'completed' && (
                      <button 
                        className="btn btn-outline"
                        onClick={() => {
                          // Handle download ticket
                        }}
                      >
                        Download Ticket
                      </button>
                    )}
                  </div>
                </div>
                
                {booking.status.toLowerCase() === 'cancelled' && booking.cancellation_date && (
                  <div className="cancellation-details">
                    <FaTimes className="cancellation-icon" />
                    <div>
                      <div className="cancellation-label">Cancelled on</div>
                      <div className="cancellation-date">
                        {new Date(booking.cancellation_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {booking.cancellation_reason && (
                        <div className="cancellation-reason">
                          <strong>Reason:</strong> {booking.cancellation_reason}
                        </div>
                      )}
                      {booking.refund_amount > 0 && (
                        <div className="refund-amount">
                          <strong>Refunded:</strong> ₹{booking.refund_amount.toLocaleString('en-IN')}
                          {booking.refund_status === 'pending' && (
                            <span className="refund-pending">(Processing)</span>
                          )}
                          {booking.refund_status === 'completed' && (
                            <span className="refund-completed">(Completed)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Cancellation Modal */}
      {showCancelModal && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Cancel Booking</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                  setCancellationReason('');
                }}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <p>Are you sure you want to cancel this booking?</p>
              
              <div className="booking-summary">
                <div className="summary-item">
                  <span className="summary-label">Booking #:</span>
                  <span className="summary-value">{selectedBooking.booking_number}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Route:</span>
                  <span className="summary-value">
                    {selectedBooking.source} to {selectedBooking.destination}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Date:</span>
                  <span className="summary-value">
                    {new Date(selectedBooking.departure_time).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Seats:</span>
                  <span className="summary-value">
                    {selectedBooking.seats?.map(s => s.seat_number).join(', ')}
                  </span>
                </div>
                
                <div className="refund-info">
                  <FaInfoCircle className="info-icon" />
                  <div>
                    <p><strong>Cancellation Policy:</strong></p>
                    <p>{selectedBooking.cancellation_policy || 'Standard cancellation policy applies.'}</p>
                    {selectedBooking.refund_amount > 0 ? (
                      <p className="refund-amount">
                        Estimated Refund: <span>₹{selectedBooking.refund_amount.toLocaleString('en-IN')}</span>
                      </p>
                    ) : (
                      <p className="no-refund">No refund available for this cancellation.</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="cancellationReason">Reason for cancellation (optional):</label>
                <textarea
                  id="cancellationReason"
                  className="form-control"
                  rows="3"
                  placeholder="Please let us know why you're cancelling..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                ></textarea>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                  setCancellationReason('');
                }}
                disabled={cancellingId === selectedBooking.id}
              >
                Go Back
              </button>
              
              <button 
                className="btn btn-danger"
                onClick={confirmCancellation}
                disabled={cancellingId === selectedBooking.id}
              >
                {cancellingId === selectedBooking.id ? (
                  'Cancelling...'
                ) : (
                  <>
                    <FaTimes /> Confirm Cancellation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
