import React, { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { API_BASE_URL } from '../config'

const RegisterForm = ({ onLogin }) => {
    const [form, setForm] = useState({
        username: '', email: '', password: '', password_confirm: ''
    })
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

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

        if (form.password !== form.password_confirm) {
            setMessage("Registration failed: Passwords do not match.")
            setIsLoading(false)
            return
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/register/`, form);
            setMessage('Registration successful! Logging you in...')
            if (onLogin && response.data?.token && response.data?.user) {
                onLogin(response.data.token, response.data.user)
                setTimeout(() => {
                    navigate(from)
                }, 800)
            } else {
                setTimeout(() => {
                    navigate('/login', { state: { from } })
                }, 1200)
            }

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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-white">Create an account</h1>
                    <p className="text-xs text-slate-400 mt-1">Enter your details below to create your account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Username Input */}
                    <div className="space-y-1 text-left">
                        <label htmlFor="username" className="text-[11px] font-medium text-slate-300 block">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            placeholder="johndoe"
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/50 transition-all text-xs"
                            value={form.username}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1 text-left">
                        <label htmlFor="email" className="text-[11px] font-medium text-slate-300 block">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="name@example.com"
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/50 transition-all text-xs"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1 text-left">
                        <label htmlFor="password" className="text-[11px] font-medium text-slate-300 block">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                placeholder="Minimum 8 characters"
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

                    {/* Confirm Password Input */}
                    <div className="space-y-1 text-left">
                        <label htmlFor="password_confirm" className="text-[11px] font-medium text-slate-300 block">
                            Confirm password
                        </label>
                        <div className="relative">
                            <input
                                id="password_confirm"
                                name="password_confirm"
                                type={showPasswordConfirm ? 'text' : 'password'}
                                required
                                placeholder="Re-type password"
                                className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/50 transition-all text-xs"
                                value={form.password_confirm}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                            >
                                {showPasswordConfirm ? (
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
                        <div className={`p-2.5 rounded-xl text-xs font-semibold border ${message.includes('successful')
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
                                <span>Registering...</span>
                            </>
                        ) : (
                            <span>Create account</span>
                        )}
                    </button>
                </form>

                {/* Footer Section */}
                <div className="mt-4 pt-3.5 border-t border-slate-800/80 text-center text-xs text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" state={{ from }} className="text-slate-200 hover:text-white font-medium underline underline-offset-4 transition-colors">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default RegisterForm