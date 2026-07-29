import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const BusSeats = ({ token }) => {
    const [bus, setBus] = useState(null)
    const [seats, setSeats] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedSeat, setSelectedSeat] = useState(null)
    const [booking, setBooking] = useState(false)
    const [bookingMsg, setBookingMsg] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState('upi')

    const { busId } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        const fetchBusDetails = async () => {
            try {
                const response = await axios(`http://localhost:8000/api/buses/${busId}/`)
                setBus(response.data)
                setSeats(response.data.seats || [])
            } catch (err) {
                setError('Failed to load bus details.')
            } finally {
                setIsLoading(false)
            }
        }
        fetchBusDetails()
    }, [busId])

    const handleSelectSeat = (seat) => {
        if (!token) { navigate('/login', { state: { from: `/bus/${busId}` } }); return }
        if (seat.is_booked) return
        setSelectedSeat(prev => prev?.id === seat.id ? null : seat)
        setBookingMsg(null)
    }

    const handleConfirmBooking = async () => {
        if (!token) { navigate('/login', { state: { from: `/bus/${busId}` } }); return }
        if (!selectedSeat) return
        setBooking(true); setBookingMsg(null)
        try {
            await axios.post('http://localhost:8000/api/bookings/', {
                seat_ids: [selectedSeat.id], bus_id: parseInt(busId), payment_method: paymentMethod,
            }, { headers: { Authorization: `Token ${token}` } })
            setBookingMsg({ type: 'success', text: `Seat ${selectedSeat.seat_number} booked! 🎉` })
            setSeats(prev => prev.map(s => s.id === selectedSeat.id ? { ...s, is_booked: true } : s))
            setSelectedSeat(null)
        } catch (err) {
            setBookingMsg({ type: 'error', text: err.response?.data?.error || 'Booking failed.' })
        } finally { setBooking(false) }
    }

    if (isLoading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div style={{ width: '44px', height: '44px', border: '4px solid #e0e7ff', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )

    if (error) return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>
            <div style={{ fontSize: '36px' }}>⚠️</div>
            <p style={{ fontWeight: 600 }}>{error}</p>
        </div>
    )

    const availableCount = seats.filter(s => !s.is_booked).length
    const bookedCount = seats.filter(s => s.is_booked).length
    const sortedSeats = [...seats].sort((a, b) =>
        String(a.seat_number).localeCompare(String(b.seat_number), undefined, { numeric: true })
    )
    const rows = []
    for (let i = 0; i < sortedSeats.length; i += 4) rows.push(sortedSeats.slice(i, i + 4))

    const renderSeatButton = (seat) => {
        const isSelected = selectedSeat?.id === seat.id
        let bg = '#d1fae5', border = '#34d399', color = '#065f46', cursor = 'pointer'
        if (seat.is_booked) { bg = '#fee2e2'; border = '#fca5a5'; color = '#991b1b'; cursor = 'not-allowed' }
        if (isSelected) { bg = '#fef9c3'; border = '#fbbf24'; color = '#92400e' }
        return (
            <button key={seat.id} onClick={() => handleSelectSeat(seat)} disabled={seat.is_booked}
                title={!token ? 'Login to book' : seat.is_booked ? 'Already booked' : `Seat ${seat.seat_number}`}
                style={{
                    width: '42px', height: '42px', background: bg, border: `2px solid ${border}`,
                    borderRadius: '8px 8px 4px 4px', fontSize: '11px', fontWeight: 800, color, cursor,
                    transition: 'all 0.15s', transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: isSelected ? '0 0 8px rgba(251,191,36,0.6)' : 'inset 0 -2px 0 rgba(0,0,0,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                }}
            >
                <div style={{ position: 'absolute', top: '3px', left: '3px', right: '3px', height: '5px', background: 'rgba(255,255,255,0.4)', borderRadius: '2px' }} />
                {seat.seat_number}
            </button>
        )
    }

    const AMENITY_MAP = {
        'ac': { label: 'A/C', icon: '❄️' }, 'charging': { label: 'Charging', icon: '🔌' },
        'wifi': { label: 'Wi-Fi', icon: '📶' }, 'blanket': { label: 'Blanket', icon: '🛌' },
        'water': { label: 'Water', icon: '🥤' }, 'tv': { label: 'TV', icon: '📺' },
        'toilet': { label: 'Washroom', icon: '🚻' }, 'snacks': { label: 'Snacks', icon: '🍪' },
        'usb': { label: 'USB', icon: '⚡' }, 'wheelchair': { label: 'Accessible', icon: '♿' },
    }
    const amenityKeys = (bus?.amenities && bus.amenities.length > 0) ? bus.amenities : ['ac', 'charging', 'water']

    return (
        <div style={{ padding: '14px 16px 32px 16px', maxWidth: '1100px', margin: '0 auto' }}>

            {/* Back button */}
            <div style={{ marginBottom: '12px' }}>
                <button onClick={() => navigate('/')} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: '#f1f5f9', border: 'none', color: '#475569',
                    fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                    padding: '6px 13px', borderRadius: '8px',
                }}
                    onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                >← Back to Search</button>
            </div>

            {/* ── Two-Column Layout ── */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

                {/* ════ LEFT PANEL — Bus Details ════ */}
                <div style={{ flex: '1 1 340px', maxWidth: '100%', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                    {/* Bus image + type badge */}
                    <div style={{ borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.08)', position: 'relative' }}>
                        <img
                            src={
                                bus?.bus_type?.toLowerCase().includes('volvo') ? '/volvo-coach.png'
                                    : bus?.bus_type?.toLowerCase().includes('sleeper') ? '/ac-sleeper.png'
                                        : '/standard-coach.png'
                            }
                            alt={bus?.bus_name}
                            style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55))' }} />
                        <div style={{ position: 'absolute', bottom: '12px', left: '14px', right: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <div style={{ fontSize: '17px', fontWeight: 900, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{bus?.bus_name}</div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>#{bus?.number}</div>
                            </div>
                            <span style={{
                                background: 'rgba(255,255,255,0.92)', color: '#4f46e5',
                                fontSize: '9px', fontWeight: 800, padding: '3px 9px',
                                borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.05em',
                            }}>{bus?.bus_type || 'Standard'}</span>
                        </div>
                    </div>

                    {/* Info card */}
                    <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8edf2', padding: '14px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>

                        {/* Rating + price row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <span key={s} style={{ fontSize: '12px', color: s <= Math.round(bus?.rating || 4.5) ? '#fbbf24' : '#e2e8f0' }}>★</span>
                                ))}
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginLeft: '3px' }}>{bus?.rating ? Number(bus.rating).toFixed(1) : '4.5'}</span>
                                <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '2px' }}>({bus?.review_count || 120})</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '20px', fontWeight: 900, color: '#4f46e5', lineHeight: 1 }}>₹{bus?.price}</div>
                                <div style={{ fontSize: '10px', color: '#94a3b8' }}>per seat</div>
                            </div>
                        </div>

                        {/* Route */}
                        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>{bus?.origin}</div>
                                <div style={{ fontSize: '10px', color: '#94a3b8' }}>{bus?.departure_time ? bus.departure_time.slice(11, 16) : '—'}</div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ flex: 1, height: '1.5px', background: '#c7d2fe' }} />
                                <span style={{ fontSize: '16px' }}>🚌</span>
                                <div style={{ flex: 1, height: '1.5px', background: '#c7d2fe' }} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>{bus?.destination}</div>
                                <div style={{ fontSize: '10px', color: '#94a3b8' }}>{bus?.arrival_time ? bus.arrival_time.slice(11, 16) : '—'}</div>
                            </div>
                        </div>

                        {/* Seat stats */}
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
                            <span style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '5px 0', fontSize: '11px', fontWeight: 700, color: '#15803d', textAlign: 'center' }}>
                                ✅ {availableCount}<br /><span style={{ fontWeight: 500, fontSize: '10px' }}>Available</span>
                            </span>
                            <span style={{ flex: 1, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '5px 0', fontSize: '11px', fontWeight: 700, color: '#dc2626', textAlign: 'center' }}>
                                ❌ {bookedCount}<br /><span style={{ fontWeight: 500, fontSize: '10px' }}>Booked</span>
                            </span>
                            <span style={{ flex: 1, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '5px 0', fontSize: '11px', fontWeight: 700, color: '#4f46e5', textAlign: 'center' }}>
                                🪑 {seats.length}<br /><span style={{ fontWeight: 500, fontSize: '10px' }}>Total</span>
                            </span>
                        </div>

                        {/* Amenities */}
                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginBottom: '12px' }}>
                            <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
                                Onboard Facilities
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {amenityKeys.map((key, idx) => {
                                    const a = AMENITY_MAP[key?.toLowerCase()] || { label: key, icon: '✨' }
                                    return (
                                        <span key={idx} style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '3px',
                                            background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px',
                                            padding: '3px 8px', fontSize: '11px', fontWeight: 600, color: '#475569',
                                        }}>{a.icon} {a.label}</span>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Driver */}
                        {(bus?.driver_name || bus?.driver_phone) && (
                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #818cf8, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>👨‍✈️</div>
                                    <div>
                                        <div style={{ fontSize: '9px', color: '#6366f1', fontWeight: 800, textTransform: 'uppercase' }}>Driver</div>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{bus.driver_name || 'Rajesh Kumar'}</div>
                                    </div>
                                </div>
                                <a href={`tel:${bus.driver_phone || '+919876543210'}`} style={{
                                    textDecoration: 'none', background: '#f0fdf4', border: '1px solid #bbf7d0',
                                    borderRadius: '7px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, color: '#15803d',
                                }}>📞 Call</a>
                            </div>
                        )}
                    </div>

                    {/* Login warning (shown on left for guests) */}
                    {!token && (
                        <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: '10px', padding: '11px 14px', color: '#92400e', fontSize: '12px', fontWeight: 600 }}>
                            ⚠️ Please <button onClick={() => navigate('/login')} style={{ color: '#6366f1', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>login</button> to book a seat.
                        </div>
                    )}
                </div>

                {/* ════ RIGHT PANEL — Seat Map + Booking ════ */}
                <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                    {/* Seat Map Card */}
                    <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8edf2', padding: '18px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0', textAlign: 'center' }}>Select Your Seat</h2>
                        <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginBottom: '16px', marginTop: 0 }}>
                            {token ? <>Click a seat then confirm below</> : <>Login required to book</>}
                        </p>

                        {/* Legend */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '18px', flexWrap: 'wrap' }}>
                            {[
                                { color: '#d1fae5', border: '#34d399', label: 'Available' },
                                { color: '#fee2e2', border: '#fca5a5', label: 'Booked' },
                                { color: '#fef9c3', border: '#fbbf24', label: 'Selected' },
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <div style={{ width: '13px', height: '13px', background: item.color, border: `2px solid ${item.border}`, borderRadius: '3px' }} />
                                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>{item.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Bus body */}
                        <div style={{
                            width: '280px', margin: '0 auto',
                            background: '#f8fafc', border: '3px solid #cbd5e1',
                            borderRadius: '28px 28px 12px 12px',
                            padding: '16px 14px', boxSizing: 'border-box',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px dashed #e2e8f0', paddingBottom: '10px', marginBottom: '14px' }}>
                                <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>FRONT</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#e2e8f0', padding: '4px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                                    <span>☸️</span> Driver
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {rows.map((rowArr, rowIndex) => (
                                    <div key={rowIndex} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ display: 'flex', gap: '6px', flex: 1, justifyContent: 'flex-start' }}>
                                            {rowArr[0] && renderSeatButton(rowArr[0])}
                                            {rowArr[1] && renderSeatButton(rowArr[1])}
                                            {!rowArr[1] && <div style={{ width: '42px' }} />}
                                        </div>
                                        <div style={{ width: '16px', textAlign: 'center', color: '#cbd5e1', fontSize: '10px', userSelect: 'none' }}>⋮</div>
                                        <div style={{ display: 'flex', gap: '6px', flex: 1, justifyContent: 'flex-end' }}>
                                            {rowArr[2] && renderSeatButton(rowArr[2])}
                                            {rowArr[3] && renderSeatButton(rowArr[3])}
                                            {!rowArr[3] && <div style={{ width: '42px' }} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Booking Panel */}
                    {selectedSeat && (
                        <div style={{
                            background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                            border: '2px solid #c7d2fe', borderRadius: '14px', padding: '16px',
                            display: 'flex', flexDirection: 'column', gap: '14px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    <div style={{ fontSize: '10px', color: '#6366f1', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>Seat Selected</div>
                                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#1e293b' }}>Seat #{selectedSeat.seat_number}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{bus?.origin} → {bus?.destination}</div>
                                </div>
                                <div style={{ background: '#fff', padding: '8px 14px', borderRadius: '10px', border: '1px solid #c7d2fe', textAlign: 'right' }}>
                                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Fare</div>
                                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#10b981' }}>₹{bus?.price}</div>
                                </div>
                            </div>

                            {/* Payment methods */}
                            <div style={{ borderTop: '1px solid #c7d2fe', paddingTop: '12px' }}>
                                <div style={{ fontSize: '10px', color: '#4f46e5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Payment Method</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '7px' }}>
                                    {[
                                        { id: 'upi', label: 'UPI', icon: '📱' },
                                        { id: 'credit_card', label: 'Credit Card', icon: '💳' },
                                        { id: 'debit_card', label: 'Debit Card', icon: '🏦' },
                                        { id: 'net_banking', label: 'Net Banking', icon: '🌐' },
                                        { id: 'cod', label: 'Cash on Board', icon: '💵' },
                                    ].map(p => {
                                        const isSel = paymentMethod === p.id
                                        return (
                                            <button key={p.id} onClick={() => setPaymentMethod(p.id)} style={{
                                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                gap: '4px', padding: '8px 6px', borderRadius: '10px',
                                                border: `2px solid ${isSel ? '#6366f1' : '#e2e8f0'}`,
                                                background: isSel ? '#fff' : '#f8fafc',
                                                cursor: 'pointer', transition: 'all 0.2s',
                                                boxShadow: isSel ? '0 2px 8px rgba(99,102,241,0.15)' : 'none',
                                            }}>
                                                <span style={{ fontSize: '18px' }}>{p.icon}</span>
                                                <span style={{ fontSize: '10px', fontWeight: 800, color: isSel ? '#6366f1' : '#475569', textAlign: 'center' }}>{p.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                <button onClick={() => setSelectedSeat(null)} style={{
                                    padding: '9px 18px', background: '#fff', border: '1.5px solid #c7d2fe',
                                    borderRadius: '9px', fontSize: '13px', fontWeight: 700, color: '#6366f1', cursor: 'pointer',
                                }}>Cancel</button>
                                <button onClick={handleConfirmBooking} disabled={booking} style={{
                                    padding: '9px 22px', background: booking ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #818cf8)',
                                    border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 700,
                                    color: '#fff', cursor: booking ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 3px 12px rgba(99,102,241,0.35)',
                                }}>
                                    {booking ? 'Booking...' : '✓ Confirm Booking'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Feedback */}
                    {bookingMsg && (
                        <div style={{
                            padding: '12px 16px', borderRadius: '10px',
                            background: bookingMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                            border: `1.5px solid ${bookingMsg.type === 'success' ? '#86efac' : '#fca5a5'}`,
                            color: bookingMsg.type === 'success' ? '#15803d' : '#dc2626',
                            fontSize: '13px', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '10px',
                        }}>
                            <span style={{ fontSize: '18px' }}>{bookingMsg.type === 'success' ? '✅' : '❌'}</span>
                            {bookingMsg.text}
                            {bookingMsg.type === 'success' && (
                                <button onClick={() => navigate('/my-bookings')} style={{
                                    marginLeft: 'auto', padding: '5px 12px', background: '#16a34a',
                                    color: '#fff', border: 'none', borderRadius: '7px',
                                    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                                }}>View Bookings →</button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BusSeats