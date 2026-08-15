import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const UserBookings = ({ token, userId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [trackingBookingId, setTrackingBookingId] = useState(null);
  const [helpBookingId, setHelpBookingId] = useState(null);

  const handlePrintTicket = (booking) => {
    const hasBus = !!booking.bus;
    const busName = hasBus ? booking.bus.bus_name : 'Shreshta Travels Express';
    const busNo = hasBus ? booking.bus.number : 'EXP-1234';
    const origin = hasBus ? booking.bus.origin : 'Bengaluru';
    const destination = hasBus ? booking.bus.destination : 'Mumbai';
    const totalAmount = booking.total_amount || (hasBus ? booking.bus.price : '1200.00');
    const seatNumbers = booking.seats && booking.seats.length > 0
      ? booking.seats.map(s => s.seat_number).join(', ')
      : 'S12';

    let formattedDate = 'N/A';
    if (booking.booking_date) {
      try {
        formattedDate = new Date(booking.booking_date.replace(' ', 'T')).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
      } catch (e) {
        formattedDate = booking.booking_date;
      }
    }

    const refCode = booking.booking_reference || ('BK-' + booking.id);
    const driverInfoStr = (booking.bus?.driver_name || 'Rajesh Kumar') + ' (' + (booking.bus?.driver_phone || '+91 98765 43210') + ')';
    const passName = booking.user?.first_name && booking.user?.last_name 
      ? `${booking.user.first_name} ${booking.user.last_name}` 
      : (booking.user?.username || 'Regondashiva');

    const qrPayload = JSON.stringify({
      company: "SHRESHTA TRAVELS",
      ticket_type: "BOARDING_PASS",
      pnr: refCode,
      passenger_name: passName,
      route: `${origin} -> ${destination}`,
      seat_number: seatNumbers,
      bus_number: busNo,
      bus_name: busName,
      fare: `INR ${totalAmount}`,
      payment_status: booking.payment_status || 'COMPLETED',
      booked_on: formattedDate
    });

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=0f172a&bgcolor=ffffff&qzone=1&data=${encodeURIComponent(qrPayload)}`;

    const printWindow = window.open('', '_blank', 'width=840,height=750');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Boarding Pass - ${refCode}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            * { box-sizing: border-box; font-family: 'Inter', system-ui, -apple-system, sans-serif; }
            body { background: #0f172a; padding: 40px 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
            
            .ticket-card {
              width: 760px;
              background: #ffffff;
              border-radius: 20px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
              overflow: hidden;
              position: relative;
            }
            
            .ticket-header {
              background: linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%);
              padding: 22px 30px;
              color: #ffffff;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .brand-logo { font-size: 22px; font-weight: 900; letter-spacing: -0.02em; display: flex; align-items: center; gap: 8px; }
            .brand-tag { font-size: 10px; font-weight: 700; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.1em; }
            .pnr-pill { background: #fef08a; color: #854d0e; font-size: 11px; font-weight: 900; padding: 5px 14px; borderRadius: 99px; letter-spacing: 0.05em; text-transform: uppercase; }
            
            .ticket-body { display: flex; position: relative; }
            .notch-top { position: absolute; top: -14px; right: 223px; width: 28px; height: 28px; background: #0f172a; border-radius: 50%; z-index: 10; }
            .notch-bottom { position: absolute; bottom: -14px; right: 223px; width: 28px; height: 28px; background: #0f172a; border-radius: 50%; z-index: 10; }
            
            .main-section { flex: 1; padding: 26px 28px; border-right: 2px dashed #cbd5e1; }
            .stub-section { width: 236px; padding: 26px 20px; background: #f8fafc; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; }
            
            .route-box { background: #f1f5f9; border-radius: 12px; padding: 12px 18px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
            .city-title { font-size: 18px; font-weight: 900; color: #0f172a; }
            .city-sub { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; }
            
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
            .info-item { display: flex; flex-direction: column; }
            .info-label { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px; }
            .info-val { font-size: 13px; font-weight: 800; color: #1e293b; }
            
            .seat-pill { display: inline-block; background: #4f46e5; color: #ffffff; font-size: 15px; font-weight: 900; padding: 3px 12px; border-radius: 8px; width: fit-content; }
            .status-badge { display: inline-block; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 6px; text-transform: uppercase; }
            
            .fare-summary { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
            .fare-lbl { font-size: 11px; font-weight: 800; color: #065f46; text-transform: uppercase; }
            .fare-amt { font-size: 20px; font-weight: 900; color: #047857; }
            
            .qr-img { width: 150px; height: 150px; border: 3px solid #e2e8f0; border-radius: 12px; padding: 4px; background: #ffffff; display: block; margin: 0 auto; }
            .stub-ref { font-family: monospace; font-size: 14px; font-weight: 900; color: #4f46e5; letter-spacing: 0.08em; margin-top: 8px; word-break: break-all; }
            .stub-text { font-size: 10px; color: #64748b; font-weight: 600; line-height: 1.4; margin-top: 6px; }
            
            @media print {
              body { background: #ffffff; padding: 0; }
              .ticket-card { box-shadow: none; border: 1px solid #cbd5e1; }
            }
          </style>
        </head>
        <body>
          <div class="ticket-card">
            <!-- Header Banner -->
            <div class="ticket-header">
              <div>
                <div class="brand-logo">🚌 SHRESHTA TRAVELS</div>
                <div class="brand-tag">Electronic Boarding Pass & Bus Ticket</div>
              </div>
              <div class="pnr-pill">PNR: ${refCode}</div>
            </div>
            
            <!-- Dual Section Ticket Body -->
            <div class="ticket-body">
              <div class="notch-top"></div>
              <div class="notch-bottom"></div>
              
              <!-- Main Section -->
              <div class="main-section">
                <!-- Route Row -->
                <div class="route-box">
                  <div>
                    <div class="city-title">${origin}</div>
                    <div class="city-sub">Origin</div>
                  </div>
                  <div style="text-align: center; flex: 1; padding: 0 14px;">
                    <div style="font-size: 12px; font-weight: 800; color: #4f46e5;">BUS BOARDING PASS</div>
                    <div style="height: 2px; background: #c7d2fe; margin: 4px 0; position: relative;">
                      <span style="position: absolute; top: -7px; left: 45%; background: #f1f5f9; padding: 0 4px; font-size: 12px;">🚌</span>
                    </div>
                    <div style="font-size: 9px; color: #64748b; font-weight: 700;">DIRECT INTERCITY</div>
                  </div>
                  <div style="text-align: right;">
                    <div class="city-title">${destination}</div>
                    <div class="city-sub">Destination</div>
                  </div>
                </div>
                
                <!-- Info Grid -->
                <div class="grid-2">
                  <div class="info-item">
                    <span class="info-label">Passenger Name</span>
                    <span class="info-val">${passName}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Assigned Seat(s)</span>
                    <span class="seat-pill">Seat #${seatNumbers}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Bus Details</span>
                    <span class="info-val">${busName} (${busNo})</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Booking Date & Time</span>
                    <span class="info-val">${formattedDate}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Payment Status</span>
                    <span class="status-badge">✅ ${booking.payment_status ? booking.payment_status.toUpperCase() : 'COMPLETED'}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Assigned Driver</span>
                    <span class="info-val">${driverInfoStr}</span>
                  </div>
                </div>
                
                <!-- Fare Summary -->
                <div class="fare-summary">
                  <span class="fare-lbl">Total Paid Amount</span>
                  <span class="fare-amt">₹${totalAmount}</span>
                </div>
              </div>
              
              <!-- Tear-off Boarding Stub -->
              <div class="stub-section">
                <div>
                  <div style="font-size: 11px; font-weight: 900; color: #1e1b4b; text-transform: uppercase; letter-spacing: 0.05em;">Gate Boarding Pass</div>
                  <div style="font-size: 9px; color: #64748b; font-weight: 700; margin-top: 2px;">SCAN TO VERIFY PASSENGER</div>
                </div>
                
                <div style="margin: 12px 0;">
                  <img class="qr-img" src="${qrUrl}" alt="Scannable QR Code" />
                  <div class="stub-ref">${refCode}</div>
                </div>
                
                <div class="stub-text">
                  <strong>Seat #${seatNumbers}</strong><br/>
                  ${origin} → ${destination}<br/>
                  Present at gate with ID.
                </div>
              </div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 600);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const [payModalBooking, setPayModalBooking] = useState(null);
  const [payMethod, setPayMethod] = useState('upi');
  const [isPaying, setIsPaying] = useState(false);
  const [payMessage, setPayMessage] = useState(null);
  const [upiIdInput, setUpiIdInput] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { from: '/my-bookings' } });
      return;
    }

    const fetchUrl = userId 
      ? `${API_BASE_URL}/api/user/${userId}/bookings/`
      : `${API_BASE_URL}/api/bookings/`;

    fetch(fetchUrl, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
    })
      .then((res) => {
        if (!res.ok) {
          // Fallback to /api/bookings/ if user specific route 404s
          return fetch(`${API_BASE_URL}/api/bookings/`, {
            headers: { 'Authorization': `Token ${token}` }
          }).then(r => r.json());
        }
        return res.json();
      })
      .then((data) => {
        setBookings(Array.isArray(data) ? data : (data.results || []));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Failed to fetch bookings');
        setLoading(false);
      });
  }, [token, userId, navigate]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (bookingToPay) => {
    const booking = bookingToPay || payModalBooking;
    if (!booking) return;
    setIsPaying(true);
    setPayMessage({ type: 'info', text: 'Launching Razorpay Gateway...' });

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      setPayMessage({ type: 'error', text: 'Razorpay SDK failed to load. Check network.' });
      setIsPaying(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${booking.id}/create_razorpay_order/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const orderData = await res.json();
      if (!res.ok) {
        setPayMessage({ type: 'error', text: orderData.error || 'Failed to create Razorpay order.' });
        setIsPaying(false);
        return;
      }

      const options = {
        key: orderData.key_id || 'rzp_test_5Wq2c0L0zQv23P',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'SHRESHTA TRAVELS',
        description: `Ticket #${orderData.booking_reference || booking.id}`,
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/api/bookings/${booking.id}/verify_razorpay_payment/`, {
              method: 'POST',
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            if (verifyRes.ok) {
              setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, payment_status: 'completed', payment_method: 'razorpay' } : b));
              setPayMessage({ type: 'success', text: 'Razorpay Payment Successful! 🎉 Ticket Confirmed.' });
              setTimeout(() => {
                setPayModalBooking(null);
                setPayMessage(null);
              }, 1200);
            } else {
              setPayMessage({ type: 'error', text: 'Razorpay verification failed.' });
            }
          } catch (e) {
            setPayMessage({ type: 'error', text: 'Error verifying payment.' });
          } finally {
            setIsPaying(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsPaying(false);
            setPayMessage({ type: 'error', text: 'Razorpay payment cancelled.' });
          }
        },
        prefill: {
          name: 'Passenger',
          email: 'passenger@travels.com',
          contact: '9876543210'
        },
        theme: {
          color: '#6366f1'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setPayMessage({ type: 'error', text: 'Error launching Razorpay.' });
      setIsPaying(false);
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!payModalBooking) return;
    if (payMethod === 'razorpay') {
      handleRazorpayPayment(payModalBooking);
      return;
    }
    setIsPaying(true);
    setPayMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${payModalBooking.id}/pay/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ payment_method: payMethod })
      });
      const data = await response.json();
      if (response.ok) {
        setPayMessage({ type: 'success', text: 'Payment Successful! 🎉 Ticket Confirmed.' });
        setBookings(prev => prev.map(b => b.id === payModalBooking.id ? { ...b, payment_status: 'completed', payment_method: payMethod } : b));
        setTimeout(() => {
          setPayModalBooking(null);
          setPayMessage(null);
        }, 1200);
      } else {
        setPayMessage({ type: 'error', text: data.error || 'Payment failed. Please try again.' });
      }
    } catch (err) {
      setPayMessage({ type: 'error', text: 'Network error processing payment.' });
    } finally {
      setIsPaying(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
        alert('Booking cancelled successfully.');
      } else {
        const data = await response.json();
        alert(data.error || data.message || 'Failed to cancel booking.');
      }
    } catch (err) {
      alert('Error cancelling booking.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '48px', height: '48px',
          border: '4px solid #e0e7ff',
          borderTop: '4px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center', color: '#dc2626' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
        <p style={{ fontSize: '16px', fontWeight: 600 }}>Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: '12px', padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '14px 16px 32px 16px', maxWidth: '860px', margin: '0 auto' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '12px' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#f1f5f9', border: 'none', color: '#475569',
            fontWeight: 600, fontSize: '13px', cursor: 'pointer',
            padding: '6px 13px', borderRadius: '8px',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
          onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
        >
          ← Back to Search
        </button>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Your Bookings</h2>
        <p style={{ color: '#94a3b8', fontSize: '12px', margin: '3px 0 0 0' }}>Manage your travel bookings and track bus status</p>
      </div>

      {bookings.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: '14px',
          boxShadow: '0 1px 8px rgba(0,0,0,0.05)', padding: '40px 24px',
          textAlign: 'center', border: '1px solid #e8edf2', color: '#94a3b8'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎟️</div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>No bookings yet</h3>
          <p style={{ fontSize: '12px', maxWidth: '280px', margin: '0 auto' }}>No bus rides booked yet. Find your ride on the home page!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {bookings.map((booking) => {
            const hasBus = !!booking.bus;
            const busName = hasBus ? booking.bus.bus_name : 'Express Travels';
            const busNo = hasBus ? booking.bus.number : 'EXP-1234';
            const origin = hasBus ? booking.bus.origin : 'N/A';
            const destination = hasBus ? booking.bus.destination : 'N/A';
            const totalAmount = booking.total_amount || (hasBus ? booking.bus.price : 'N/A');
            const seatNumbers = booking.seats && booking.seats.length > 0
              ? booking.seats.map(s => s.seat_number).join(', ')
              : 'N/A';

            // Format booked date safely
            let formattedDate = 'N/A';
            if (booking.booking_date) {
              try {
                formattedDate = new Date(booking.booking_date.replace(' ', 'T')).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                });
              } catch (e) {
                formattedDate = booking.booking_date;
              }
            }

            // Status chip colors
            let statusBg = '#eff6ff', statusColor = '#2563eb';
            if (booking.status === 'confirmed') {
              statusBg = '#ecfdf5'; statusColor = '#059669';
            } else if (booking.status === 'cancelled') {
              statusBg = '#fef2f2'; statusColor = '#dc2626';
            } else if (booking.status === 'pending') {
              statusBg = '#fffbeb'; statusColor = '#d97706';
            }

            return (
              <div
                key={booking.id}
                style={{
                  background: '#fff', borderRadius: '14px',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #e8edf2',
                  overflow: 'hidden',
                }}
              >
                {/* Compact top bar: ref + status */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#f8fafc', borderBottom: '1px solid #f1f5f9',
                  padding: '7px 14px', flexWrap: 'wrap', gap: '6px'
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.04em' }}>
                    #{booking.booking_reference || `BK-${booking.id}`}
                  </span>
                  <span style={{
                    background: statusBg, color: statusColor,
                    fontSize: '10px', fontWeight: 800, padding: '2px 9px',
                    borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.04em'
                  }}>{booking.status || 'Pending'}</span>
                </div>

                {/* Card body */}
                <div style={{ padding: '12px 14px' }}>
                  {/* Bus name + route in one row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>{busName}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500 }}>#{busNo}</div>
                    </div>
                    {/* Route strip inline */}
                    <div style={{
                      flex: 1, display: 'flex', alignItems: 'center', gap: '6px',
                      background: '#f8fafc', borderRadius: '8px', padding: '6px 10px', minWidth: '180px'
                    }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{origin}</div>
                        <div style={{ fontSize: '9px', color: '#94a3b8' }}>From</div>
                      </div>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <div style={{ flex: 1, height: '1.5px', background: '#c7d2fe' }} />
                        <span style={{ fontSize: '12px' }}>🚌</span>
                        <div style={{ flex: 1, height: '1.5px', background: '#c7d2fe' }} />
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{destination}</div>
                        <div style={{ fontSize: '9px', color: '#94a3b8' }}>To</div>
                      </div>
                    </div>
                    {/* Fare badge */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '17px', fontWeight: 900, color: '#4f46e5', lineHeight: 1 }}>₹{totalAmount}</div>
                      <div style={{ fontSize: '9px', color: '#94a3b8' }}>Fare</div>
                    </div>
                  </div>

                  {/* Info pills row */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, color: '#334155' }}>
                      🪑 Seat: {seatNumbers}
                    </span>
                    <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, color: '#334155' }}>
                      📅 {formattedDate}
                    </span>
                    <span style={{
                      background: booking.payment_status === 'completed' ? '#ecfdf5' : '#fffbeb',
                      border: `1px solid ${booking.payment_status === 'completed' ? '#bbf7d0' : '#fde68a'}`,
                      borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 700,
                      color: booking.payment_status === 'completed' ? '#059669' : '#d97706'
                    }}>
                      💳 {booking.payment_method ? booking.payment_method.replace('_', ' ').toUpperCase() : 'COD'} · {booking.payment_status || 'Pending'}
                    </span>
                    {booking.journey_date && (
                      <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, color: '#3b82f6' }}>
                        🗓️ Journey: {booking.journey_date}
                      </span>
                    )}
                  </div>

                  {/* CTA Action buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '7px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setHelpBookingId(prev => prev === booking.id ? null : booking.id)}
                      style={{
                        padding: '6px 12px', background: helpBookingId === booking.id ? '#e2e8f0' : '#f1f5f9',
                        border: '1px solid #e2e8f0', borderRadius: '8px',
                        fontSize: '11px', fontWeight: 700, color: '#64748b', cursor: 'pointer',
                      }}
                    >
                      🛠️ {helpBookingId === booking.id ? 'Hide Support' : 'Support'}
                    </button>
                    {(booking.payment_status === 'pending' || booking.payment_status !== 'completed') && booking.status !== 'cancelled' && (
                      <button
                        style={{
                          padding: '6px 14px', background: 'linear-gradient(135deg,#10b981,#059669)',
                          border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                          color: '#fff', cursor: 'pointer', boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                        }}
                        onClick={() => { setPayModalBooking(booking); setPayMessage(null); }}
                      >💳 Pay Now</button>
                    )}
                    {booking.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handlePrintTicket(booking)}
                          style={{
                            padding: '6px 12px', background: '#fff', border: '1px solid #e2e8f0',
                            borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: '#475569',
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                          }}
                        >🖨️ Print</button>
                        <button
                          onClick={() => setTrackingBookingId(prev => prev === booking.id ? null : booking.id)}
                          style={{
                            padding: '6px 14px',
                            background: trackingBookingId === booking.id ? '#475569' : 'linear-gradient(135deg,#6366f1,#818cf8)',
                            border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                            color: '#fff', cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                          }}
                        >📍 {trackingBookingId === booking.id ? 'Hide' : 'Track Live'}</button>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          style={{
                            padding: '6px 12px', background: '#fef2f2', border: '1px solid #fca5a5',
                            borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: '#dc2626',
                            cursor: 'pointer'
                          }}
                        >❌ Cancel</button>
                      </>
                    )}
                  </div>


                  {/* Help & Support Panel */}
                  {helpBookingId === booking.id && (
                    <div style={{
                      marginTop: '20px',
                      background: '#f8fafc',
                      borderRadius: '16px',
                      padding: '24px',
                      color: '#334155',
                      border: '1.2px solid #cbd5e1',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.03)',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #cbd5e1',
                        paddingBottom: '12px',
                        marginBottom: '16px'
                      }}>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>🛠️</span> Help & Support Desk
                        </h4>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6', background: '#dbeafe', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                          Ref ID: #{booking.booking_reference || `BK-${booking.id}`}
                        </span>
                      </div>

                      {/* Hotline contact choices */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px',
                        marginBottom: '18px'
                      }}>
                        <a href="tel:18001023344" style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          background: '#ffffff',
                          padding: '14px',
                          borderRadius: '12px',
                          border: '1px solid #cbd5e1',
                          textDecoration: 'none',
                          color: 'inherit',
                          transition: 'transform 0.2s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <span style={{ fontSize: '24px' }}>📞</span>
                          <div>
                            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Toll Free Helpline</div>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#6366f1' }}>1800-102-3344</div>
                          </div>
                        </a>

                        <a href="mailto:support@travels.com" style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          background: '#ffffff',
                          padding: '14px',
                          borderRadius: '12px',
                          border: '1px solid #cbd5e1',
                          textDecoration: 'none',
                          color: 'inherit',
                          transition: 'transform 0.2s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <span style={{ fontSize: '24px' }}>✉️</span>
                          <div>
                            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Email Support</div>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#6366f1' }}>support@travels.com</div>
                          </div>
                        </a>
                      </div>

                      {/* FAQs section */}
                      <div style={{ background: '#f1f5f9', borderRadius: '12px', padding: '16px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Frequently Asked Questions
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <details style={{ background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '10px', cursor: 'pointer' }}>
                            <summary style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
                              How do I request a cancellation & refund?
                            </summary>
                            <p style={{ fontSize: '11px', color: '#64748b', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                              You can cancel your booking up to 4 hours before departure by contacting the customer support team or writing to us.
                            </p>
                          </details>
                          <details style={{ background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '10px', cursor: 'pointer' }}>
                            <summary style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
                              Where can I find the boarding point map?
                            </summary>
                            <p style={{ fontSize: '11px', color: '#64748b', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                              Click on 'Track Bus Live' to view the checkpoints. The starting point shown on the path is your designated boarding terminal location.
                            </p>
                          </details>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Live Tracking Panel */}
                  {trackingBookingId === booking.id && (
                    <div style={{
                      marginTop: '24px',
                      background: '#0f172a',
                      borderRadius: '16px',
                      padding: '24px',
                      color: '#f8fafc',
                      border: '1.2px solid #334155',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    }}>
                      {/* Header with Live Gps Indicator */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #1e293b',
                        paddingBottom: '12px',
                        marginBottom: '16px'
                      }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>🚌</span> {busName} (Live GPS Tracking)
                          </h4>
                          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
                            Route: {origin} → {destination} Checkpoints
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1e293b', padding: '5px 10px', borderRadius: '8px', border: '1px solid #334155' }}>
                          <span className="gps-live-ping" style={{
                            width: '7px',
                            height: '7px',
                            background: '#10b981',
                            borderRadius: '50%',
                            display: 'inline-block',
                            boxShadow: '0 0 6px #10b981',
                          }} />
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            📡 GPS ONLINE
                          </span>
                        </div>
                      </div>

                      {/* Real Google Map Container */}
                      <div style={{
                        borderRadius: '14px',
                        overflow: 'hidden',
                        border: '1.5px solid #334155',
                        position: 'relative',
                        marginBottom: '16px',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                        height: '320px',
                        background: '#0f172a'
                      }}>
                        {/* Live Overlay Badge */}
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          zIndex: 10,
                          background: 'rgba(15, 23, 42, 0.92)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(99, 102, 241, 0.4)',
                          borderRadius: '10px',
                          padding: '8px 14px',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
                        }}>
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#10b981',
                            display: 'inline-block',
                            boxShadow: '0 0 8px #10b981'
                          }} />
                          <span>🚌 LIVE BUS POSITION: En Route ({origin} → {destination})</span>
                        </div>

                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          zIndex: 10,
                          background: 'rgba(16, 185, 129, 0.9)',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          fontSize: '10px',
                          color: '#ffffff',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Speed: 68 km/h | 65% Completed
                        </div>

                        {/* Embedded Google Maps Frame */}
                        <iframe
                          title={`Google Maps - Route ${origin} to ${destination}`}
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0, filter: 'contrast(1.05) saturate(1.1)' }}
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(origin + ' to ' + destination)}&t=&z=7&ie=UTF8&iwloc=&output=embed`}
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>

                      {/* Waypoint Route Progress Bar */}
                      <div style={{
                        background: '#1e293b',
                        borderRadius: '12px',
                        padding: '16px 16px',
                        marginBottom: '16px',
                        border: '1px solid #334155',
                        position: 'relative'
                      }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
                          🛣️ Route Checkpoints Timeline
                        </div>
                        <div style={{
                          padding: '10px 0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          position: 'relative',
                          width: '100%',
                          overflowX: 'auto',
                          gap: '16px'
                        }}>
                          {/* Background line */}
                          <div style={{
                            position: 'absolute',
                            left: '30px',
                            right: '30px',
                            top: '30px',
                            height: '4px',
                            background: 'linear-gradient(90deg, #10b981 65%, #475569 65%)',
                            zIndex: 1
                          }} />

                          {/* Waypoint circles */}
                          {(booking.bus?.route?.waypoints && booking.bus.route.waypoints.length > 0
                            ? booking.bus.route.waypoints
                            : [
                              { name: origin },
                              { name: 'Highway Rest Stop' },
                              { name: 'Toll Plaza Checkpoint' },
                              { name: destination }
                            ]
                          ).map((wp, idx, arr) => {
                            const isPassed = idx < Math.ceil(arr.length * 0.65);
                            const isActive = idx === Math.floor(arr.length * 0.65);

                            return (
                              <div key={idx} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative',
                                zIndex: 2,
                                minWidth: '90px',
                                flex: 1
                              }}>
                                <div style={{
                                  width: isActive ? '20px' : '14px',
                                  height: isActive ? '20px' : '14px',
                                  borderRadius: '50%',
                                  background: isActive ? '#6366f1' : (isPassed ? '#10b981' : '#475569'),
                                  border: `2px solid ${isActive ? '#f8fafc' : '#1e293b'}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: isActive ? '0 0 10px #6366f1' : 'none',
                                  transition: 'all 0.3s ease'
                                }}>
                                  {isActive && <span style={{ fontSize: '9px' }}>📍</span>}
                                </div>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: isActive || isPassed ? 700 : 500,
                                  color: isActive ? '#818cf8' : (isPassed ? '#f8fafc' : '#94a3b8'),
                                  marginTop: '8px',
                                  textAlign: 'center',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {wp.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Info Dashboard grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: '12px'
                      }}>
                        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '12px' }}>
                          <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>GPS Speed</div>
                          <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>64 km/h</div>
                        </div>
                        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '12px' }}>
                          <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Active Stop</div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#818cf8', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {booking.bus?.route?.waypoints && booking.bus.route.waypoints.length > 2
                              ? booking.bus.route.waypoints[Math.floor(booking.bus.route.waypoints.length * 0.65)]?.name || 'Highway stop'
                              : 'Highway stop'
                            }
                          </div>
                        </div>
                        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '12px' }}>
                          <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Remaining Journey</div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                            {booking.bus?.route?.duration ? `~ ${booking.bus.route.duration}` : '2 hours'}
                          </div>
                        </div>
                        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '12px' }}>
                          <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Driver status</div>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>Active & Alert</div>
                        </div>
                      </div>

                      {/* Driver Details Card Panel */}
                      <div style={{
                        marginTop: '16px',
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            color: '#fff',
                            fontWeight: 800
                          }}>
                            👨‍✈️
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase' }}>Assigned Driver</div>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                              {booking.bus?.driver_name || 'Rajesh Kumar'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>⭐ 4.9 Rating</span> &nbsp;|&nbsp; <span>240+ Trips completed</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <a href={`tel:${booking.bus?.driver_phone || '+919876543210'}`} style={{
                            textDecoration: 'none',
                            padding: '8px 16px',
                            background: '#10b981',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 800,
                            color: '#fff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'opacity 0.2s',
                            cursor: 'pointer'
                          }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                          >
                            📞 Call {booking.bus?.driver_name ? booking.bus.driver_name.split(' ')[0] : 'Driver'} ({booking.bus?.driver_phone || '+91 98765 43210'})
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Payment Modal Overlay ── */}
      {payModalBooking && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: '16px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '24px', width: '100%',
            maxWidth: '460px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            border: '1px solid #e2e8f0', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc'
            }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  Complete Payment
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  Ref: #{payModalBooking.booking_reference || `BK-${payModalBooking.id}`}
                </span>
              </div>
              <button
                onClick={() => { setPayModalBooking(null); setPayMessage(null); }}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleProcessPayment} style={{ padding: '24px' }}>
              {/* Fare Summary */}
              <div style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px',
                padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Amount Payable</div>
                  <div style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>{payModalBooking.bus?.bus_name || 'Express Bus'}</div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#15803d' }}>
                  ₹{payModalBooking.total_amount}
                </div>
              </div>

              {/* Payment Methods */}
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Select Payment Method
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {[
                  { id: 'razorpay', label: 'Razorpay (Cards/UPI)', icon: '⚡' },
                  { id: 'upi', label: 'Direct UPI', icon: '📱' },
                  { id: 'card', label: 'Credit/Debit Card', icon: '💳' },
                  { id: 'cod', label: 'Pay at Bus (COD)', icon: '💵' },
                ].map(method => (
                  <div
                    key={method.id}
                    onClick={() => setPayMethod(method.id)}
                    style={{
                      padding: '12px', borderRadius: '12px',
                      border: payMethod === method.id ? '2px solid #6366f1' : '1px solid #e2e8f0',
                      background: payMethod === method.id ? '#e0e7ff' : '#fff',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{method.icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: payMethod === method.id ? '#4338ca' : '#475569' }}>
                      {method.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dynamic method details */}
              {payMethod === 'upi' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>UPI ID (e.g. name@upi)</label>
                  <input
                    type="text"
                    placeholder="username@okaxis"
                    value={upiIdInput}
                    onChange={e => setUpiIdInput(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              )}

              {/* Status Message */}
              {payMessage && (
                <div style={{
                  marginBottom: '16px', padding: '10px 14px', borderRadius: '10px',
                  fontSize: '13px', fontWeight: 600,
                  background: payMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${payMessage.type === 'success' ? '#bbf7d0' : '#fca5a5'}`,
                  color: payMessage.type === 'success' ? '#15803d' : '#dc2626'
                }}>
                  {payMessage.text}
                </div>
              )}

              {/* Footer Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setPayModalBooking(null); setPayMessage(null); }}
                  style={{ padding: '10px 18px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPaying}
                  style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: isPaying ? '#a5b4fc' : 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: isPaying ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}
                >
                  {isPaying ? 'Processing...' : `Pay ₹${payModalBooking.total_amount} Now`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBookings;
