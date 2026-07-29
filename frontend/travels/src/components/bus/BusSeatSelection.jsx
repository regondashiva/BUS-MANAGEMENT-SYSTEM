import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaChair, FaUser, FaWheelchair, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { useBooking } from '../../contexts/BookingContext';
import WebSocketService from '../../services/websocket';
import './BusSeatSelection.css';

const BusSeatSelection = () => {
  const { busId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    busDetails,
    seatMap,
    selectedSeats,
    lockedSeats,
    loading,
    error,
    selectSeat,
    loadBusDetails,
    bookingStep,
    setBookingStep,
    passengerDetails,
    updatePassengerDetails,
    addPassenger,
    removePassenger,
    createBooking,
    bookingStatus,
    bookingError,
    resetBooking
  } = useBooking();
  
  const [seatTooltip, setSeatTooltip] = useState(null);
  const [showLegend, setShowLegend] = useState(true);
  const [showPassengerForm, setShowPassengerForm] = useState(false);
  const tooltipRef = useRef(null);
  
  // Load bus details when component mounts
  useEffect(() => {
    if (busId) {
      loadBusDetails(busId);
    }
    
    // Clean up on unmount
    return () => {
      WebSocketService.disconnect();
    };
  }, [busId, loadBusDetails]);
  
  // Handle seat tooltip positioning
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (seatTooltip && tooltipRef.current) {
        tooltipRef.current.style.left = `${e.pageX + 10}px`;
        tooltipRef.current.style.top = `${e.pageY + 10}px`;
      }
    };
    
    if (seatTooltip) {
      document.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [seatTooltip]);
  
  // Handle seat selection
  const handleSeatClick = (seat) => {
    if (seat.status === 'available' || (seat.status === 'locked' && lockedSeats[seat.id]?.locked_by === 'current_user')) {
      selectSeat(seat.id);
    } else if (seat.status === 'booked') {
      // Show a message that the seat is already booked
      setSeatTooltip({
        ...seat,
        message: 'This seat is already booked',
        type: 'error'
      });
      
      // Auto-hide the tooltip after 2 seconds
      setTimeout(() => {
        setSeatTooltip(null);
      }, 2000);
    } else if (seat.status === 'locked') {
      // Show a message that the seat is being booked by someone else
      setSeatTooltip({
        ...seat,
        message: `Seat is being booked by another user`,
        type: 'warning'
      });
      
      // Auto-hide the tooltip after 2 seconds
      setTimeout(() => {
        setSeatTooltip(null);
      }, 2000);
    }
  };
  
  // Handle seat mouse enter
  const handleSeatMouseEnter = (seat, e) => {
    if (seat.status === 'booked') {
      setSeatTooltip({
        ...seat,
        message: 'Booked',
        type: 'info'
      });
    } else if (seat.status === 'locked') {
      const lockedUntil = new Date(seat.locked_until);
      const timeLeft = Math.ceil((lockedUntil - new Date()) / 1000 / 60); // in minutes
      
      setSeatTooltip({
        ...seat,
        message: `Locked for ${timeLeft} more minutes`,
        type: 'warning'
      });
    } else if (seat.type === 'sleeper') {
      setSeatTooltip({
        ...seat,
        message: 'Sleeper Seat',
        type: 'info'
      });
    } else if (seat.type === 'window') {
      setSeatTooltip({
        ...seat,
        message: 'Window Seat',
        type: 'info'
      });
    } else if (seat.type === 'aisle') {
      setSeatTooltip({
        ...seat,
        message: 'Aisle Seat',
        type: 'info'
      });
    } else if (seat.features?.includes('legroom')) {
      setSeatTooltip({
        ...seat,
        message: 'Extra Legroom',
        type: 'info'
      });
    }
  };
  
  // Handle seat mouse leave
  const handleSeatMouseLeave = () => {
    setSeatTooltip(null);
  };
  
  // Render seat based on its status
  const renderSeat = (seat) => {
    const isSelected = selectedSeats.includes(seat.id);
    const isLocked = lockedSeats[seat.id]?.locked;
    const isLockedByCurrentUser = isLocked && lockedSeats[seat.id]?.locked_by === 'current_user';
    
    let seatClass = 'seat';
    let seatIcon = <FaChair />;
    
    if (seat.type === 'sleeper') {
      seatClass += ' sleeper';
    } else if (seat.type === 'window') {
      seatClass += ' window';
    } else if (seat.type === 'aisle') {
      seatClass += ' aisle';
    }
    
    if (seat.gender_preference === 'female') {
      seatClass += ' female-only';
    }
    
    if (seat.features?.includes('legroom')) {
      seatClass += ' legroom';
    }
    
    if (seat.features?.includes('charging')) {
      seatClass += ' charging';
    }
    
    if (isSelected) {
      seatClass += ' selected';
      seatIcon = <FaUser />;
    } else if (seat.status === 'booked') {
      seatClass += ' booked';
      seatIcon = <FaUser />;
    } else if (isLocked) {
      if (isLockedByCurrentUser) {
        seatClass += ' locked-by-me';
      } else {
        seatClass += ' locked';
      }
    }
    
    if (seat.features?.includes('accessible')) {
      seatIcon = <FaWheelchair />;
    }
    
    return (
      <div
        key={seat.id}
        className={seatClass}
        onClick={() => handleSeatClick(seat)}
        onMouseEnter={(e) => handleSeatMouseEnter(seat, e)}
        onMouseLeave={handleSeatMouseLeave}
        title={seat.name}
      >
        <span className="seat-icon">{seatIcon}</span>
        <span className="seat-number">{seat.number || seat.id}</span>
        {seat.gender_preference === 'female' && (
          <span className="gender-badge">L</span>
        )}
      </div>
    );
  };
  
  // Render bus layout
  const renderBusLayout = () => {
    if (!seatMap || seatMap.length === 0) {
      return <div className="no-seats">No seat map available for this bus.</div>;
    }
    
    // Group seats by row for better layout
    const seatsByRow = {};
    seatMap.forEach(seat => {
      const row = seat.row || '0';
      if (!seatsByRow[row]) {
        seatsByRow[row] = [];
      }
      seatsByRow[row].push(seat);
    });
    
    return (
      <div className="bus-layout">
        <div className="bus-front">Front of Bus</div>
        
        <div className="seats-container">
          {Object.entries(seatsByRow).map(([row, seats]) => (
            <div key={row} className="seat-row">
              <div className="row-number">{row}</div>
              <div className="seats-in-row">
                {seats.map(seat => renderSeat(seat))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="bus-aisle">Aisle</div>
      </div>
    );
  };
  
  // Render passenger details form
  const renderPassengerForm = () => {
    return (
      <div className="passenger-form-container">
        <h3>Passenger Details</h3>
        
        {passengerDetails.map((passenger, index) => (
          <div key={index} className="passenger-details">
            <h4>Passenger {index + 1} - Seat {selectedSeats[index] || ''}</h4>
            
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={passenger.name}
                onChange={(e) => updatePassengerDetails(index, 'name', e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={passenger.age}
                  onChange={(e) => updatePassengerDetails(index, 'age', e.target.value)}
                  placeholder="Age"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Gender</label>
                <select
                  value={passenger.gender}
                  onChange={(e) => updatePassengerDetails(index, 'gender', e.target.value)}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
            
            {index > 0 && (
              <button
                type="button"
                className="remove-passenger"
                onClick={() => removePassenger(index)}
              >
                Remove Passenger
              </button>
            )}
          </div>
        ))}
        
        {passengerDetails.length < selectedSeats.length && (
          <button
            type="button"
            className="add-passenger"
            onClick={addPassenger}
          >
            + Add Another Passenger
          </button>
        )}
        
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setBookingStep(1)}
          >
            Back to Seat Selection
          </button>
          
          <button
            type="button"
            className="btn btn-primary"
            onClick={async () => {
              // Validate all passenger details before proceeding
              const isValid = passengerDetails.every(p => 
                p.name.trim() && p.age && p.gender
              );
              
              if (!isValid) {
                alert('Please fill in all passenger details');
                return;
              }
              
              try {
                await createBooking();
                setBookingStep(3); // Move to payment/confirmation
              } catch (error) {
                console.error('Booking error:', error);
              }
            }}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    );
  };
  
  // Render booking confirmation
  const renderConfirmation = () => {
    if (bookingStatus === 'success') {
      return (
        <div className="booking-confirmation success">
          <div className="confirmation-icon">✓</div>
          <h2>Booking Confirmed!</h2>
          <p>Your booking has been successfully confirmed.</p>
          <div className="booking-details">
            <h4>Booking Details</h4>
            <p><strong>Booking ID:</strong> {busDetails?.booking_id || 'N/A'}</p>
            <p><strong>Bus:</strong> {busDetails?.operator_name || 'N/A'}</p>
            <p><strong>From:</strong> {busDetails?.source || 'N/A'}</p>
            <p><strong>To:</strong> {busDetails?.destination || 'N/A'}</p>
            <p><strong>Date:</strong> {new Date(busDetails?.departure_time).toLocaleDateString() || 'N/A'}</p>
            <p><strong>Seats:</strong> {selectedSeats.join(', ') || 'N/A'}</p>
            <p><strong>Total Amount:</strong> ₹{busDetails?.price ? (busDetails.price * selectedSeats.length) : 'N/A'}</p>
          </div>
          
          <div className="confirmation-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                // Navigate to booking details or home page
                navigate('/my-bookings');
              }}
            >
              View My Bookings
            </button>
            
            <button
              className="btn btn-secondary"
              onClick={() => {
                resetBooking();
                navigate('/');
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    } else if (bookingStatus === 'error') {
      return (
        <div className="booking-confirmation error">
          <div className="confirmation-icon">✕</div>
          <h2>Booking Failed</h2>
          <p>{bookingError || 'There was an error processing your booking. Please try again.'}</p>
          
          <div className="confirmation-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                resetBooking();
                setBookingStep(1);
              }}
            >
              Try Again
            </button>
            
            <button
              className="btn btn-secondary"
              onClick={() => {
                resetBooking();
                navigate('/');
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // Render loading state
  if (loading && !seatMap.length) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading bus details...</p>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h3>Error Loading Bus Details</h3>
        <p>{error}</p>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="bus-seat-selection">
      {/* Bus Info Header */}
      <div className="bus-info-header">
        <div className="bus-operator">
          <h2>{busDetails?.operator_name || 'Bus Operator'}</h2>
          <span className="bus-type">{busDetails?.bus_type || 'AC Sleeper'}</span>
        </div>
        
        <div className="bus-timings">
          <div className="timing departure">
            <div className="time">
              {busDetails?.departure_time 
                ? new Date(busDetails.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '--:--'}
            </div>
            <div className="location">{busDetails?.source || 'Source'}</div>
          </div>
          
          <div className="timing-arrow">→</div>
          
          <div className="timing arrival">
            <div className="time">
              {busDetails?.arrival_time 
                ? new Date(busDetails.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '--:--'}
            </div>
            <div className="location">{busDetails?.destination || 'Destination'}</div>
          </div>
          
          <div className="duration">
            {busDetails?.duration || '--h --m'}
          </div>
        </div>
        
        <div className="bus-amenities">
          {busDetails?.amenities?.map((amenity, index) => (
            <span key={index} className="amenity">
              {amenity === 'WiFi' && 'WiFi'}
              {amenity === 'Charging' && '🔌'}
              {amenity === 'Water' && '💧'}
              {amenity === 'Blanket' && '🧣'}
              {amenity === 'Pillow' && '🛏️'}
              {amenity === 'TV' && '📺'}
              {amenity === 'Toilet' && '🚽'}
              {!['WiFi', 'Charging', 'Water', 'Blanket', 'Pillow', 'TV', 'Toilet'].includes(amenity) && amenity}
            </span>
          ))}
        </div>
      </div>
      
      {/* Booking Steps */}
      <div className="booking-steps">
        <div className={`step ${bookingStep >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Select Seats</div>
        </div>
        <div className={`step-connector ${bookingStep >= 2 ? 'active' : ''}`}></div>
        <div className={`step ${bookingStep >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Passenger Details</div>
        </div>
        <div className={`step-connector ${bookingStep >= 3 ? 'active' : ''}`}></div>
        <div className={`step ${bookingStep >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Payment</div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="seat-selection-container">
        {/* Left Sidebar - Seat Legend */}
        <div className={`seat-legend ${showLegend ? 'expanded' : ''}`}>
          <div className="legend-header">
            <h4>Seat Legend</h4>
            <button 
              className="toggle-legend"
              onClick={() => setShowLegend(!showLegend)}
              title={showLegend ? 'Hide Legend' : 'Show Legend'}
            >
              {showLegend ? '−' : '+'}
            </button>
          </div>
          
          {showLegend && (
            <div className="legend-items">
              <div className="legend-item">
                <div className="seat-preview available">
                  <FaChair />
                </div>
                <span>Available</span>
              </div>
              
              <div className="legend-item">
                <div className="seat-preview selected">
                  <FaUser />
                </div>
                <span>Selected</span>
              </div>
              
              <div className="legend-item">
                <div className="seat-preview booked">
                  <FaUser />
                </div>
                <span>Booked</span>
              </div>
              
              <div className="legend-item">
                <div className="seat-preview locked">
                  <FaUser />
                </div>
                <span>Locked by others</span>
              </div>
              
              <div className="legend-item">
                <div className="seat-preview locked-by-me">
                  <FaUser />
                </div>
                <span>Your selection</span>
              </div>
              
              <div className="legend-item">
                <div className="seat-preview sleeper">
                  <FaChair />
                </div>
                <span>Sleeper</span>
              </div>
              
              <div className="legend-item">
                <div className="seat-preview window">
                  <FaChair />
                </div>
                <span>Window</span>
              </div>
              
              <div className="legend-item">
                <div className="seat-preview aisle">
                  <FaChair />
                </div>
                <span>Aisle</span>
              </div>
              
              <div className="legend-item">
                <div className="seat-preview female-only">
                  <FaChair />
                </div>
                <span>Ladies Only</span>
              </div>
              
              <div className="legend-item">
                <div className="seat-preview accessible">
                  <FaWheelchair />
                </div>
                <span>Wheelchair Accessible</span>
              </div>
            </div>
          )}
          
          <div className="selected-seats-summary">
            <h5>Selected Seats ({selectedSeats.length})</h5>
            {selectedSeats.length > 0 ? (
              <div className="selected-seats-list">
                {selectedSeats.map((seatId, index) => (
                  <span key={index} className="selected-seat">
                    {seatId}
                    <button 
                      className="remove-seat"
                      onClick={() => {
                        // Unlock the seat
                        WebSocketService.unlockSeat(busId, seatId, 'current_user');
                        // Remove from selected seats
                        selectSeat(seatId);
                      }}
                      title="Remove seat"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="no-seats">No seats selected</p>
            )}
            
            {selectedSeats.length > 0 && (
              <button
                className="btn btn-primary proceed-btn"
                onClick={() => setBookingStep(2)}
                disabled={loading}
              >
                Proceed to Passenger Details
              </button>
            )}
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="seat-selection-main">
          {bookingStep === 1 && (
            <>
              <div className="seat-selection-header">
                <h3>Select Your Seats</h3>
                <div className="seat-filters">
                  <button 
                    className={`filter-btn ${showPassengerForm ? 'active' : ''}`}
                    onClick={() => setShowPassengerForm(!showPassengerForm)}
                  >
                    {showPassengerForm ? 'Hide Passenger Form' : 'Show Passenger Form'}
                  </button>
                </div>
              </div>
              
              {showPassengerForm && (
                <div className="inline-passenger-form">
                  {renderPassengerForm()}
                </div>
              )}
              
              <div className="bus-layout-container">
                {renderBusLayout()}
                
                {seatTooltip && (
                  <div 
                    ref={tooltipRef}
                    className={`seat-tooltip ${seatTooltip.type || 'info'}`}
                    style={{
                      position: 'fixed',
                      zIndex: 1000,
                      pointerEvents: 'none',
                      display: seatTooltip ? 'block' : 'none',
                      opacity: seatTooltip ? 1 : 0,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    <div className="tooltip-header">
                      <span className="seat-name">Seat {seatTooltip.number || seatTooltip.id}</span>
                      {seatTooltip.type && (
                        <span className={`seat-type ${seatTooltip.type}`}>
                          {seatTooltip.type.charAt(0).toUpperCase() + seatTooltip.type.slice(1)}
                        </span>
                      )}
                    </div>
                    <div className="tooltip-message">{seatTooltip.message}</div>
                    {seatTooltip.features && seatTooltip.features.length > 0 && (
                      <div className="tooltip-features">
                        <div className="features-title">Features:</div>
                        <div className="features-list">
                          {seatTooltip.features.map((feature, idx) => (
                            <span key={idx} className="feature-tag">{feature}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
          
          {bookingStep === 2 && renderPassengerForm()}
          
          {bookingStep === 3 && renderConfirmation()}
        </div>
      </div>
    </div>
  );
};

export default BusSeatSelection;
