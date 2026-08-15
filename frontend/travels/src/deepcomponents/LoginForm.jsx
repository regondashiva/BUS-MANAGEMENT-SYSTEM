import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { API_BASE_URL } from '../config'

const LoginForm = ({ onLogin }) => {
    const [form, setForm] = useState({
        username: '', password: ''
    })
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname || (typeof location.state?.from === 'string' ? location.state.from : null) || '/'

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage('')
        try {
            const response = await axios.post(`${API_BASE_URL}/api/login/`, form)
            setMessage('Login Success! Redirecting...')
            if (onLogin) {
                onLogin(response.data.token, response.data.user)
            }
            setTimeout(() => {
                navigate(from)
            }, 800)
        } catch (error) {
            setMessage("Login Failed: " + (error.response?.data?.error || error.response?.data?.detail || 'Invalid username or password'))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center bg-slate-950 text-slate-100 relative overflow-hidden px-4 font-sans box-border">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-slate-800/20 blur-[130px] rounded-full pointer-events-none" />

            {/* Main Shadcn Card */}
            <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-6 sm:p-7 relative z-10 transition-all duration-300">
                {/* Back to Home Link */}
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 px-2.5 py-1 rounded-lg transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </button>
                </div>

                {/* Card Header & Brand Icon */}
                <div className="flex flex-col items-center text-center mb-5">
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white mb-2.5 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-white">Welcome back</h1>
                    <p className="text-xs text-slate-400 mt-1">Enter your credentials to access your account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                    {/* Username Input */}
                    <div className="space-y-1 text-left">
                        <label htmlFor="username" className="text-[11px] font-medium text-slate-300 block">
                            Username or Email
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            placeholder="name@example.com"
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/50 transition-all text-xs"
                            value={form.username}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1 text-left">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="text-[11px] font-medium text-slate-300 block">
                                Password
                            </label>
                            <a href="#forgot" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">
                                Forgot password?
                            </a>
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                placeholder="••••••••"
                                className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/50 transition-all text-xs"
                                value={form.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Feedback Alert */}
                    {message && (
                        <div className={`p-2.5 rounded-xl text-xs font-semibold border ${message.includes('Success')
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            } transition-all`}>
                            {message}
                        </div>
                    )}

                    {/* Primary Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-slate-950 rounded-full animate-spin" />
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <span>Sign in</span>
                        )}
                    </button>
                </form>

                {/* Footer Section */}
                <div className="mt-5 pt-3.5 border-t border-slate-800/80 text-center text-xs text-slate-400">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" state={{ from }} className="text-slate-200 hover:text-white font-medium underline underline-offset-4 transition-colors">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default LoginForm