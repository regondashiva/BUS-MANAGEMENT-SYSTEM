import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const BusList = ({ token }) => {
    const [buses, setBuses] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showBuses, setShowBuses] = useState(false)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterOrigin, setFilterOrigin] = useState('')
    const [filterDestination, setFilterDestination] = useState('')

    const navigate = useNavigate()

    useEffect(() => {
        const fetchBuses = async () => {
            try {
                const response = await axios.get("http://localhost:8000/api/buses/")
                setBuses(response.data)
            } catch (error) {
                console.log('error in fetching buses', error)
                setError('Failed to load buses. Please try again later.')
            } finally {
                setIsLoading(false)
            }
        }
        fetchBuses()
    }, [])

    const handleViewSeats = (id) => {
        navigate(`/bus/${id}`)
    }

    const filteredBuses = buses.filter(bus => {
        const matchesSearch = bus.bus_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bus.number.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesOrigin = filterOrigin ? bus.origin.toLowerCase() === filterOrigin.toLowerCase() : true
        const matchesDestination = filterDestination ? bus.destination.toLowerCase() === filterDestination.toLowerCase() : true
        return matchesSearch && matchesOrigin && matchesDestination
    })

    const uniqueOrigins = [...new Set(buses.map(bus => bus.origin))]
    const uniqueDestinations = [...new Set(buses.map(bus => bus.destination))]

    return (
        <div style={{
            height: 'calc(100vh - 64px)',
            width: '100%',
            overflow: 'hidden',
            position: 'relative',
            fontFamily: "'Inter', sans-serif"
        }}>

            {/* ── HERO SECTION (only visible if showBuses is false) ── */}
            {!showBuses ? (
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Background Image */}
                    <img
                        src="/bus-hero.png"
                        alt="Luxury bus on highway"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                        }}
                    />

                    {/* Dark gradient overlay */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, rgba(10,10,30,0.35) 0%, rgba(10,10,30,0.65) 60%, rgba(10,10,30,0.92) 100%)',
                    }} />

                    {/* Hero Content */}
                    <div style={{
                        position: 'relative',
                        zIndex: 10,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        padding: '0 24px',
                    }}>
                        {/* Headline */}
                        <h1 style={{
                            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                            fontWeight: 800,
                            color: '#ffffff',
                            lineHeight: 1.1,
                            maxWidth: '800px',
                            marginBottom: '20px',
                            textShadow: '0 2px 20px rgba(0,0,0,0.4)',
                            letterSpacing: '-0.02em',
                        }}>
                            Travel in <span style={{ color: '#818cf8' }}>Comfort</span>,<br />
                            Arrive in <span style={{ color: '#34d399' }}>Style</span>
                        </h1>

                        {/* Subtitle */}
                        <p style={{
                            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                            color: 'rgba(255,255,255,0.75)',
                            maxWidth: '520px',
                            marginBottom: '40px',
                            lineHeight: 1.7,
                        }}>
                            Book your seat on premium intercity buses. Safe, punctual, and comfortable journeys across the country.
                        </p>

                        {/* CTA Buttons */}
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowBuses(true)}
                                style={{
                                    padding: '14px 36px',
                                    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 32px rgba(99,102,241,0.5)',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.65)'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.5)'
                                }}
                            >
                                🔍 Browse Buses
                            </button>
                            {!token && (
                                <button
                                    onClick={() => navigate('/register')}
                                    style={{
                                        padding: '14px 36px',
                                        background: 'rgba(255,255,255,0.12)',
                                        color: '#fff',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        backdropFilter: 'blur(8px)',
                                        transition: 'background 0.2s, transform 0.2s',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.22)'
                                        e.currentTarget.style.transform = 'translateY(-2px)'
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                                        e.currentTarget.style.transform = 'translateY(0)'
                                    }}
                                >
                                    Get Started Free
                                </button>
                            )}
                        </div>

                        {/* Stats bar */}
                        <div style={{
                            display: 'flex',
                            gap: '48px',
                            marginTop: '60px',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                        }}>
                            {[
                                { value: '50+', label: 'Routes' },
                                { value: '10K+', label: 'Happy Travelers' },
                                { value: '99%', label: 'On-Time Rate' },
                            ].map(stat => (
                                <div key={stat.label} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                                        {stat.value}
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* ── BUS LISTING SECTION (visible only if showBuses is true) ── */
                <div style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'transparent',
                    overflow: 'hidden',
                    boxSizing: 'border-box'
                }}>
                    {/* Header and Filter area (Static, doesn't scroll) */}
                    <div style={{
                        padding: '24px 24px 16px 24px',
                        background: 'rgba(255, 255, 255, 0.4)',
                        backdropFilter: 'blur(12px)',
                        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                        flexShrink: 0
                    }}>
                        <div style={{
                            maxWidth: '1200px',
                            margin: '0 auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}>
                            {/* Inner header bar */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <button
                                    onClick={() => setShowBuses(false)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: '#f1f5f9',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        color: '#475569',
                                        fontWeight: 600,
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                                >
                                    ← Back to Search
                                </button>

                                <div style={{ textAlign: 'right' }}>
                                    <h2 style={{
                                        fontSize: '1.25rem',
                                        fontWeight: 800,
                                        color: '#1e293b',
                                        margin: 0
                                    }}>
                                        Available Buses
                                    </h2>
                                    <p style={{ color: '#64748b', fontSize: '12px', margin: '2px 0 0 0' }}>
                                        Reserve seats on premium intercity coaches
                                    </p>
                                </div>
                            </div>

                            {/* Filter Bar Controls */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                gap: '16px',
                                alignItems: 'end',
                            }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Search
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Bus name or number..."
                                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        From
                                    </label>
                                    <select
                                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                                        value={filterOrigin}
                                        onChange={(e) => setFilterOrigin(e.target.value)}
                                    >
                                        <option value="">All Origins</option>
                                        {uniqueOrigins.map(origin => (
                                            <option key={origin} value={origin}>{origin}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        To
                                    </label>
                                    <select
                                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                                        value={filterDestination}
                                        onChange={(e) => setFilterDestination(e.target.value)}
                                    >
                                        <option value="">All Destinations</option>
                                        {uniqueDestinations.map(destination => (
                                            <option key={destination} value={destination}>{destination}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={() => { setSearchTerm(''); setFilterOrigin(''); setFilterDestination('') }}
                                    style={{
                                        padding: '10px 20px',
                                        background: '#f1f5f9',
                                        border: '1.5px solid #e2e8f0',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#475569',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                                >
                                    ✕ Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable listing box */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '24px',
                        boxSizing: 'border-box'
                    }}>
                        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                            {/* Loading */}
                            {isLoading && (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                                    <div style={{
                                        width: '48px', height: '48px',
                                        border: '4px solid #e0e7ff',
                                        borderTop: '4px solid #6366f1',
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite',
                                    }} />
                                </div>
                            )}

                            {/* Error */}
                            {error && !isLoading && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '16px 20px', borderRadius: '12px', textAlign: 'center' }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            {/* Bus Grid */}
                            {!isLoading && !error && (
                                filteredBuses.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚌</div>
                                        <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>No buses found</h3>
                                        <p style={{ fontSize: '15px' }}>Try adjusting your search or filters.</p>
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                                        gap: '24px',
                                    }}>
                                        {filteredBuses.map((bus) => (
                                            <div
                                                key={bus.id}
                                                style={{
                                                    background: '#fff',
                                                    borderRadius: '20px',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                                                    overflow: 'hidden',
                                                    border: '1px solid #f1f5f9',
                                                    transition: 'transform 0.25s, box-shadow 0.25s',
                                                    cursor: 'pointer',
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.transform = 'translateY(-4px)'
                                                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.15)'
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.transform = 'translateY(0)'
                                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'
                                                }}
                                            >
                                                {/* Dynamic Bus Thumbnail Header */}
                                                <div style={{
                                                    height: '160px',
                                                    width: '100%',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    background: '#e2e8f0'
                                                }}>
                                                    <img
                                                        src={
                                                            bus.bus_type?.toLowerCase().includes('volvo')
                                                                ? '/volvo-coach.png'
                                                                : bus.bus_type?.toLowerCase().includes('sleeper')
                                                                    ? '/ac-sleeper.png'
                                                                    : '/standard-coach.png'
                                                        }
                                                        alt={bus.bus_name}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                    {/* Gradient overlay on image */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.5) 100%)'
                                                    }} />

                                                    {/* Badge Overlay */}
                                                    <span style={{
                                                        position: 'absolute',
                                                        top: '12px',
                                                        right: '12px',
                                                        background: 'rgba(255, 255, 255, 0.92)',
                                                        color: '#4f46e5',
                                                        fontSize: '11px',
                                                        fontWeight: 800,
                                                        padding: '4px 12px',
                                                        borderRadius: '999px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}>
                                                        {bus.bus_type || 'Standard'}
                                                    </span>
                                                </div>

                                                <div style={{ padding: '20px' }}>
                                                    {/* Header */}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                        <div>
                                                            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                                                                {bus.bus_name}
                                                            </h2>
                                                            <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 650, margin: '2px 0 0 0' }}>
                                                                #{bus.number}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Route */}
                                                    <div style={{
                                                        background: '#f8fafc',
                                                        borderRadius: '12px',
                                                        padding: '14px 16px',
                                                        marginBottom: '16px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                    }}>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{bus.origin}</div>
                                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Origin</div>
                                                        </div>
                                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                            <div style={{ flex: 1, height: '2px', background: '#c7d2fe' }} />
                                                            <span style={{ fontSize: '18px' }}>🚌</span>
                                                            <div style={{ flex: 1, height: '2px', background: '#c7d2fe' }} />
                                                        </div>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{bus.destination}</div>
                                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Destination</div>
                                                        </div>
                                                    </div>

                                                    {/* Times & Price */}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '8px' }}>
                                                        <div style={{ flex: 1, background: '#f0fdf4', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                                                            <div style={{ fontSize: '11px', color: '#4ade80', fontWeight: 600, textTransform: 'uppercase' }}>Departs</div>
                                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
                                                                {bus.departure_time ? bus.departure_time.slice(11, 16) : '—'}
                                                            </div>
                                                        </div>
                                                        <div style={{ flex: 1, background: '#fff7ed', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                                                            <div style={{ fontSize: '11px', color: '#f97316', fontWeight: 600, textTransform: 'uppercase' }}>Arrives</div>
                                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
                                                                {bus.arrival_time ? bus.arrival_time.slice(11, 16) : '—'}
                                                            </div>
                                                        </div>
                                                        <div style={{ flex: 1, background: '#eff6ff', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                                                            <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: 600, textTransform: 'uppercase' }}>Price</div>
                                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
                                                                ₹{bus.price}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Seats */}
                                                    {bus.available_seats !== undefined && (
                                                        <div style={{ fontSize: '13px', color: bus.available_seats > 5 ? '#16a34a' : '#dc2626', marginBottom: '16px', fontWeight: 600 }}>
                                                            {bus.available_seats > 0
                                                                ? `✓ ${bus.available_seats} seats available`
                                                                : '✗ Sold Out'}
                                                        </div>
                                                    )}

                                                    {/* CTA */}
                                                    <button
                                                        onClick={() => handleViewSeats(bus.id)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '12px',
                                                            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '12px',
                                                            fontSize: '15px',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            transition: 'opacity 0.2s, transform 0.2s',
                                                            boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                                                        }}
                                                        onMouseEnter={e => {
                                                            e.currentTarget.style.opacity = '0.9'
                                                            e.currentTarget.style.transform = 'translateY(-1px)'
                                                        }}
                                                        onMouseLeave={e => {
                                                            e.currentTarget.style.opacity = '1'
                                                            e.currentTarget.style.transform = 'translateY(0)'
                                                        }}
                                                    >
                                                        View Seats & Book →
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── CSS Animations ── */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}

export default BusList