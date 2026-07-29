import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, useLocation, Link } from 'react-router-dom'

const LoginForm = ({ onLogin }) => {
    const [form, setForm] = useState({
        username: '', password: ''
    })
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isFocused, setIsFocused] = useState({ username: false, password: false })

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const navigate = useNavigate()
    const location = useLocation();
    const from = location.state?.from?.pathname || (typeof location.state?.from === 'string' ? location.state.from : null) || '/';

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage('')
        try {
            const response = await axios.post('http://localhost:8000/api/login/', form)
            setMessage('Login Success! Redirecting...')
            if (onLogin) {
                onLogin(response.data.token, response.data.user)
            }
            setTimeout(() => {
                navigate(from)
            }, 1000)
        } catch (error) {
            setMessage("Login Failed: " + (error.response?.data?.error || error.response?.data?.detail || 'Invalid username or password'))
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
                        ✨ Premium Transit Experience
                    </div>

                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: 900,
                        lineHeight: 1.15,
                        color: '#fff',
                        marginBottom: '16px',
                        letterSpacing: '-0.03em'
                    }}>
                        Your Journey <br />
                        Starts <span style={{ color: '#a5b4fc', textShadow: '0 0 10px rgba(165,180,252,0.4)' }}>Here</span>.
                    </h1>

                    <p style={{
                        fontSize: '1.1rem',
                        lineHeight: 1.6,
                        color: '#c7d2fe',
                        marginBottom: '40px',
                        fontWeight: 400
                    }}>
                        Log in to access booking history, reserve premium sleeper seats, and manage schedules.
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
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>99%</div>
                            <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600 }}>On-time rate</div>
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            padding: '16px',
                            minWidth: '120px'
                        }}>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>24/7</div>
                            <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600 }}>Active Support</div>
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
                            Welcome Back
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>
                            Enter your details below to log into your account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Username */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label htmlFor="username" style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                color: isFocused.username ? '#6366f1' : '#475569',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                transition: 'color 0.2s'
                            }}>
                                Username / Email
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                placeholder="Enter your username"
                                onFocus={() => setIsFocused(prev => ({ ...prev, username: true }))}
                                onBlur={() => setIsFocused(prev => ({ ...prev, username: false }))}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: `2px solid ${isFocused.username ? '#6366f1' : '#cbd5e1'}`,
                                    fontSize: '15px',
                                    color: '#1e293b',
                                    outline: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                    boxShadow: isFocused.username ? '0 0 0 4px rgba(99,102,241,0.15)' : 'none'
                                }}
                                value={form.username}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Password */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label htmlFor="password" style={{
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: isFocused.password ? '#6366f1' : '#475569',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    transition: 'color 0.2s'
                                }}>
                                    Password
                                </label>
                                <a href="#forgot" style={{ fontSize: '12px', color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
                                    Forgot password?
                                </a>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                onFocus={() => setIsFocused(prev => ({ ...prev, password: true }))}
                                onBlur={() => setIsFocused(prev => ({ ...prev, password: false }))}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: `2px solid ${isFocused.password ? '#6366f1' : '#cbd5e1'}`,
                                    fontSize: '15px',
                                    color: '#1e293b',
                                    outline: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                    boxShadow: isFocused.password ? '0 0 0 4px rgba(99,102,241,0.15)' : 'none'
                                }}
                                value={form.password}
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
                                background: message.includes('Success') ? '#f0fdf4' : '#fef2f2',
                                border: `1.5px solid ${message.includes('Success') ? '#86efac' : '#fca5a5'}`,
                                color: message.includes('Success') ? '#15803d' : '#dc2626',
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
                                padding: '14px',
                                borderRadius: '12px',
                                border: 'none',
                                fontSize: '15px',
                                fontWeight: 700,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                                transition: 'opacity 0.2s, transform 0.1s'
                            }}
                            onMouseEnter={e => { if (!isLoading) e.currentTarget.style.opacity = '0.9' }}
                            onMouseLeave={e => { if (!isLoading) e.currentTarget.style.opacity = '1' }}
                            onMouseDown={e => { if (!isLoading) e.currentTarget.style.transform = 'scale(0.98)' }}
                            onMouseUp={e => { if (!isLoading) e.currentTarget.style.transform = 'scale(1)' }}
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
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>

                    {/* Bottom link to Register */}
                    <div style={{
                        marginTop: '32px',
                        textAlign: 'center',
                        fontSize: '14px',
                        color: '#64748b'
                    }}>
                        Don't have an account?{' '}
                        <Link to="/register" state={{ from }} style={{
                            color: '#6366f1',
                            fontWeight: 700,
                            textDecoration: 'none'
                        }}>
                            Create free account
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

export default LoginForm