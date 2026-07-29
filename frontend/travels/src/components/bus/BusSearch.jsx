import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FaSearch, FaFilter, FaBus, FaMapMarkerAlt, FaCalendarAlt, FaTimes, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import './BusSearch.css';

const BusSearch = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    returnDate: '',
    isRoundTrip: false,
    passengers: 1
  });
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    busType: [],
    amenities: [],
    priceRange: [0, 10000],
    departureTime: [],
    arrivalTime: [],
    operator: [],
    rating: null,
  });
  
  // Search results
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Available options for filters
  const busTypes = ['AC', 'Non-AC', 'Sleeper', 'Seater', 'Semi-Sleeper', 'Volvo', 'Luxury'];
  const amenities = ['WiFi', 'Charging', 'Water', 'Blanket', 'Pillow', 'TV', 'Toilet'];
  const departureTimes = [
    { label: 'Before 6 AM', value: '00:00-06:00' },
    { label: '6 AM - 12 PM', value: '06:00-12:00' },
    { label: '12 PM - 6 PM', value: '12:00-18:00' },
    { label: 'After 6 PM', value: '18:00-24:00' },
  ];
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      // For array-based filters (busType, amenities, etc.)
      if (Array.isArray(prev[filterType])) {
        return {
          ...prev,
          [filterType]: prev[filterType].includes(value)
            ? prev[filterType].filter(item => item !== value)
            : [...prev[filterType], value]
        };
      }
      // For single value filters (rating)
      return {
        ...prev,
        [filterType]: prev[filterType] === value ? null : value
      };
    });
  };
  
  // Handle price range change
  const handlePriceRangeChange = (index, value) => {
    const newRange = [...filters.priceRange];
    newRange[index] = parseInt(value, 10);
    
    // Ensure min is less than max
    if (index === 0 && newRange[0] > newRange[1]) {
      newRange[1] = newRange[0];
    } else if (index === 1 && newRange[1] < newRange[0]) {
      newRange[0] = newRange[1];
    }
    
    setFilters(prev => ({
      ...prev,
      priceRange: newRange
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.source.trim() || !formData.destination.trim()) {
      setError('Please enter source and destination');
      return;
    }
    
    if (formData.source.toLowerCase() === formData.destination.toLowerCase()) {
      setError('Source and destination cannot be the same');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Build query parameters
      const params = new URLSearchParams({
        source: formData.source,
        destination: formData.destination,
        date: formData.date,
        passengers: formData.passengers,
        ...(formData.isRoundTrip && { return_date: formData.returnDate }),
        ...(filters.busType.length > 0 && { bus_type: filters.busType.join(',') }),
        ...(filters.amenities.length > 0 && { amenities: filters.amenities.join(',') }),
        ...(filters.priceRange[0] > 0 && { min_price: filters.priceRange[0] }),
        ...(filters.priceRange[1] < 10000 && { max_price: filters.priceRange[1] }),
        ...(filters.departureTime.length > 0 && { departure_time: filters.departureTime.join(',') }),
        ...(filters.arrivalTime.length > 0 && { arrival_time: filters.arrivalTime.join(',') }),
        ...(filters.operator.length > 0 && { operator: filters.operator.join(',') }),
        ...(filters.rating && { rating: filters.rating })
      });
      
      const response = await fetch(`/api/buses/search/?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch buses');
      }
      
      const data = await response.json();
      setSearchResults(data.results || []);
      
      // If no results, show message
      if (data.results.length === 0) {
        setError('No buses found matching your criteria. Try adjusting your search.');
      }
      
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search for buses. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle view seats button click
  const handleViewSeats = (busId) => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate('/login', { state: { from: '/search' } });
      return;
    }
    
    // Navigate to bus details page
    navigate(`/buses/${busId}`, { 
      state: { 
        searchParams: { ...formData, ...filters } 
      } 
    });
  };
  
  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Calculate duration between two times
  const calculateDuration = (departureTime, arrivalTime) => {
    if (!departureTime || !arrivalTime) return '';
    
    const [depHours, depMins] = departureTime.split(':').map(Number);
    const [arrHours, arrMins] = arrivalTime.split(':').map(Number);
    
    let hours = arrHours - depHours;
    let minutes = arrMins - depMins;
    
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }
    
    if (hours < 0) hours += 24; // Handle next day arrival
    
    return `${hours}h ${minutes}m`;
  };
  
  // Toggle filters panel
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      busType: [],
      amenities: [],
      priceRange: [0, 10000],
      departureTime: [],
      arrivalTime: [],
      operator: [],
      rating: null,
    });
  };
  
  return (
    <div className="bus-search-container">
      {/* Search Form */}
      <div className="search-form-container">
        <form onSubmit={handleSubmit} className="search-form">
          <div className="form-group">
            <label htmlFor="source">From</label>
            <div className="input-with-icon">
              <FaMapMarkerAlt className="input-icon" />
              <input
                type="text"
                id="source"
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                placeholder="Enter city or location"
                required
              />
            </div>
          </div>
          
          <button 
            type="button" 
            className="swap-button" 
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                source: prev.destination,
                destination: prev.source
              }));
            }}
            title="Swap source and destination"
          >
            <FaArrowRight className="swap-icon" />
          </button>
          
          <div className="form-group">
            <label htmlFor="destination">To</label>
            <div className="input-with-icon">
              <FaMapMarkerAlt className="input-icon" />
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                placeholder="Enter city or location"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="date">Departure</label>
            <div className="input-with-icon">
              <FaCalendarAlt className="input-icon" />
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={format(new Date(), 'yyyy-MM-dd')}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="passengers">Passengers</label>
            <select
              id="passengers"
              name="passengers"
              value={formData.passengers}
              onChange={handleInputChange}
              className="passenger-select"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Passenger' : 'Passengers'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isRoundTrip"
                checked={formData.isRoundTrip}
                onChange={handleInputChange}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              Round Trip
            </label>
          </div>
          
          {formData.isRoundTrip && (
            <div className="form-group">
              <label htmlFor="returnDate">Return</label>
              <div className="input-with-icon">
                <FaCalendarAlt className="input-icon" />
                <input
                  type="date"
                  id="returnDate"
                  name="returnDate"
                  value={formData.returnDate}
                  onChange={handleInputChange}
                  min={formData.date}
                  required={formData.isRoundTrip}
                />
              </div>
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="button" 
              className="filter-button"
              onClick={toggleFilters}
            >
              <FaFilter /> {showFilters ? 'Hide Filters' : 'Filters'}
            </button>
            
            <button 
              type="submit" 
              className="search-button"
              disabled={loading}
            >
              {loading ? 'Searching...' : (
                <>
                  <FaSearch /> Search Buses
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-header">
            <h3>Filters</h3>
            <button 
              type="button" 
              className="clear-filters"
              onClick={clearFilters}
            >
              Clear All
            </button>
            <button 
              type="button" 
              className="close-filters"
              onClick={toggleFilters}
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="filter-section">
            <h4>Bus Type</h4>
            <div className="filter-options">
              {busTypes.map(type => (
                <label key={type} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.busType.includes(type)}
                    onChange={() => handleFilterChange('busType', type)}
                  />
                  <span className="checkmark"></span>
                  {type}
                </label>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Price Range (₹)</h4>
            <div className="price-range">
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={filters.priceRange[0]}
                onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                className="price-slider"
              />
              <div className="price-inputs">
                <div className="price-input">
                  <span>Min</span>
                  <input
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                    min="0"
                    max={filters.priceRange[1] - 100}
                  />
                </div>
                <div className="price-input">
                  <span>Max</span>
                  <input
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                    min={filters.priceRange[0] + 100}
                    max="10000"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Departure Time</h4>
            <div className="filter-options">
              {departureTimes.map(time => (
                <label key={time.value} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.departureTime.includes(time.value)}
                    onChange={() => handleFilterChange('departureTime', time.value)}
                  />
                  <span className="checkmark"></span>
                  {time.label}
                </label>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Amenities</h4>
            <div className="filter-options">
              {amenities.map(amenity => (
                <label key={amenity} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity)}
                    onChange={() => handleFilterChange('amenities', amenity)}
                  />
                  <span className="checkmark"></span>
                  {amenity}
                </label>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Rating</h4>
            <div className="rating-filter">
              {[5, 4, 3, 2, 1].map(rating => (
                <label key={rating} className="rating-option">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.rating === rating.toString()}
                    onChange={() => handleFilterChange('rating', rating.toString())}
                  />
                  <span className="stars">
                    {Array(rating).fill('★').join('')}
                    {Array(5 - rating).fill('☆').join('')}
                  </span>
                  {rating < 5 ? ' & Up' : ''}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Search Results */}
      <div className="search-results">
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading">Searching for buses...</div>
        ) : searchResults.length > 0 ? (
          <div className="buses-list">
            {searchResults.map(bus => (
              <div key={bus.id} className="bus-card">
                <div className="bus-header">
                  <div className="bus-operator">
                    <FaBus className="bus-icon" />
                    <h3>{bus.operator_name || 'Bus Operator'}</h3>
                    <span className="bus-type">{bus.bus_type || 'AC Sleeper'}</span>
                    {bus.rating && (
                      <div className="bus-rating">
                        <span className="stars">{'★'.repeat(Math.round(bus.rating))}</span>
                        <span className="rating">{bus.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="bus-amenities">
                    {bus.amenities?.map((amenity, idx) => (
                      <span key={idx} className="amenity" title={amenity}>
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bus-details">
                  <div className="timing">
                    <div className="departure">
                      <div className="time">{formatTime(bus.departure_time)}</div>
                      <div className="location">{bus.source}</div>
                    </div>
                    
                    <div className="duration">
                      <div className="duration-line"></div>
                      <div className="duration-text">
                        {calculateDuration(bus.departure_time, bus.arrival_time)}
                      </div>
                      <div className="duration-line"></div>
                    </div>
                    
                    <div className="arrival">
                      <div className="time">{formatTime(bus.arrival_time)}</div>
                      <div className="location">{bus.destination}</div>
                    </div>
                  </div>
                  
                  <div className="price-actions">
                    <div className="price">
                      <span className="amount">₹{bus.fare || 'N/A'}</span>
                      <span className="per-seat">per seat</span>
                    </div>
                    
                    <div className="seats-available">
                      {bus.available_seats > 0 ? (
                        <span className="available">{bus.available_seats} seats left</span>
                      ) : (
                        <span className="sold-out">Sold Out</span>
                      )}
                    </div>
                    
                    <button 
                      className={`view-seats ${bus.available_seats === 0 ? 'disabled' : ''}`}
                      onClick={() => handleViewSeats(bus.id)}
                      disabled={bus.available_seats === 0}
                    >
                      {bus.available_seats > 0 ? 'View Seats' : 'Sold Out'}
                    </button>
                  </div>
                </div>
                
                <div className="bus-footer">
                  <div className="cancellation-policy">
                    <span className="policy-tag">
                      {bus.cancellation_policy || 'Free cancellation available'}
                    </span>
                  </div>
                  <div className="boarding-points">
                    <button className="view-points">View Boarding Points</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !error && searchResults.length === 0 ? (
          <div className="no-results">
            <h3>No buses found</h3>
            <p>Try adjusting your search or filters to find more options.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BusSearch;
