import React, { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { API_BASE_URL } from '../config'

const RegisterForm = () => {
    const [form, setForm] = useState({
        username: '', email: '', password: '', password_confirm: ''
    })
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isFocused, setIsFocused] = useState({ username: false, email: false, password: false, password_confirm: false })

    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from || '/'

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage('')

        // Frontend match validation check
        if (form.password !== form.password_confirm) {
            setMessage("Registration failed: Passwords do not match.")
            setIsLoading(false)
            return
        }

        try {
            await axios.post(`${API_BASE_URL}/api/register/`, form);
            setMessage('Registration successful! Redirecting to login...')
            setForm({ username: '', email: '', password: '', password_confirm: '' })
            setTimeout(() => {
                navigate('/login', { state: { from } })
            }, 1800)

        } catch (error) {
            console.error(error.response?.data)
            const errorMsg = error.response?.data
                ? Object.entries(error.response.data)
                    .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
                    .join(' | ')
                : error.message
            setMessage("Registration failed: " + errorMsg)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            alignItems: 'stretch',
            background: '#f8fafc',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Split Screen - Left Graphic Column */}
            <div style={{
                flex: 1.2,
                position: 'relative',
                display: 'none', // hidden on mobile
                background: '#090d1f',
                color: '#fff',
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center',
                '@media (min-width: 1024px)': {
                    display: 'flex'
                }
            }} className="hidden md:flex">
                <img
                    src="/luxury-login.png"
                    alt="Luxury Bus Travel"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: '0.45',
                        mixBlendMode: 'luminosity'
                    }}
                />

                {/* Neon gradient overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.85) 0%, rgba(79,70,229,0.9) 50%, rgba(49,46,129,0.95) 100%)',
                }} />

                {/* Left side content */}
                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    maxWidth: '480px',
                    padding: '40px',
                    textAlign: 'left'
                }}>
                    <div style={{
                        display: 'inline-flex',
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        padding: '8px 16px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '24px',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        ✨ Join SHRESHTA TRAVELS Today
                    </div>

                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: 900,
                        lineHeight: 1.15,
                        color: '#fff',
                        marginBottom: '16px',
                        letterSpacing: '-0.03em'
                    }}>
                        Unlock Premium <br />
                        Booking <span style={{ color: '#a5b4fc', textShadow: '0 0 10px rgba(165,180,252,0.4)' }}>Benefits</span>.
                    </h1>

                    <p style={{
                        fontSize: '1.1rem',
                        lineHeight: 1.6,
                        color: '#c7d2fe',
                        marginBottom: '40px',
                        fontWeight: 400
                    }}>
                        Create an account to book your choice of sleeper status seats, get cancellation refund privileges, and view instant ticket receipts.
                    </p>

                    {/* Quality Badges */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            padding: '16px',
                            minWidth: '120px'
                        }}>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>10K+</div>
                            <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600 }}>Active Travelers</div>
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            padding: '16px',
                            minWidth: '120px'
                        }}>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Secure</div>
                            <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600 }}>SSL Cryptography</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Screen - Right Form Column */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 24px',
                background: '#fff'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '420px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Back Button */}
                    <div style={{ marginBottom: '24px' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#f1f5f9',
                                border: 'none',
                                color: '#475569',
                                fontWeight: 700,
                                fontSize: '13px',
                                cursor: 'pointer',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                transition: 'background-color 0.2s',
                                width: 'fit-content'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                        >
                            ← Back to Home
                        </button>
                    </div>

                    {/* Header */}
                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            color: '#1e293b',
                            letterSpacing: '-0.025em',
                            marginBottom: '8px'
                        }}>
                            Create Account
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>
                            Sign up to start booking your luxury coach tickets
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Username */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label htmlFor="username" style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                color: isFocused.username ? '#6366f1' : '#475569',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                placeholder="Choose a username"
                                onFocus={() => setIsFocused(prev => ({ ...prev, username: true }))}
                                onBlur={() => setIsFocused(prev => ({ ...prev, username: false }))}
                                style={{
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: `2px solid ${isFocused.username ? '#6366f1' : '#cbd5e1'}`,
                                    fontSize: '14px',
                                    color: '#1e293b',
                                    outline: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                    boxShadow: isFocused.username ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none'
                                }}
                                value={form.username}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Email */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label htmlFor="email" style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                color: isFocused.email ? '#6366f1' : '#475569',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="name@domain.com"
                                onFocus={() => setIsFocused(prev => ({ ...prev, email: true }))}
                                onBlur={() => setIsFocused(prev => ({ ...prev, email: false }))}
                                style={{
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: `2px solid ${isFocused.email ? '#6366f1' : '#cbd5e1'}`,
                                    fontSize: '14px',
                                    color: '#1e293b',
                                    outline: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                    boxShadow: isFocused.email ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none'
                                }}
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Password */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label htmlFor="password" style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                color: isFocused.password ? '#6366f1' : '#475569',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="Minimum 8 characters"
                                onFocus={() => setIsFocused(prev => ({ ...prev, password: true }))}
                                onBlur={() => setIsFocused(prev => ({ ...prev, password: false }))}
                                style={{
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: `2px solid ${isFocused.password ? '#6366f1' : '#cbd5e1'}`,
                                    fontSize: '14px',
                                    color: '#1e293b',
                                    outline: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                    boxShadow: isFocused.password ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none'
                                }}
                                value={form.password}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Confirm Password */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label htmlFor="password_confirm" style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                color: isFocused.password_confirm ? '#6366f1' : '#475569',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Confirm Password
                            </label>
                            <input
                                id="password_confirm"
                                name="password_confirm"
                                type="password"
                                required
                                placeholder="Re-type password"
                                onFocus={() => setIsFocused(prev => ({ ...prev, password_confirm: true }))}
                                onBlur={() => setIsFocused(prev => ({ ...prev, password_confirm: false }))}
                                style={{
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: `2px solid ${isFocused.password_confirm ? '#6366f1' : '#cbd5e1'}`,
                                    fontSize: '14px',
                                    color: '#1e293b',
                                    outline: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                    boxShadow: isFocused.password_confirm ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none'
                                }}
                                value={form.password_confirm}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Feedback message */}
                        {message && (
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: '10px',
                                fontSize: '13px',
                                fontWeight: 600,
                                background: message.includes('successful') ? '#f0fdf4' : '#fef2f2',
                                border: `1.5px solid ${message.includes('successful') ? '#86efac' : '#fca5a5'}`,
                                color: message.includes('successful') ? '#15803d' : '#dc2626',
                                transition: 'all 0.3s'
                            }}>
                                {message}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '8px',
                                background: isLoading ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                color: '#fff',
                                padding: '12px',
                                borderRadius: '10px',
                                border: 'none',
                                fontSize: '14px',
                                fontWeight: 700,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                                transition: 'opacity 0.2s',
                                marginTop: '10px'
                            }}
                            onMouseEnter={e => { if (!isLoading) e.currentTarget.style.opacity = '0.9' }}
                            onMouseLeave={e => { if (!isLoading) e.currentTarget.style.opacity = '1' }}
                        >
                            {isLoading ? (
                                <>
                                    <div style={{
                                        width: '18px', height: '18px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTop: '2px solid #fff',
                                        borderRadius: '50%',
                                        animation: 'spin 0.6s linear infinite'
                                    }} />
                                    <span>Registering...</span>
                                </>
                            ) : (
                                <span>Sign Up</span>
                            )}
                        </button>
                    </form>

                    {/* Bottom link to Login */}
                    <div style={{
                        marginTop: '24px',
                        textAlign: 'center',
                        fontSize: '14px',
                        color: '#64748b'
                    }}>
                        Already have an account?{' '}
                        <Link to="/login" state={{ from }} style={{
                            color: '#6366f1',
                            fontWeight: 700,
                            textDecoration: 'none'
                        }}>
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}

export default RegisterForm