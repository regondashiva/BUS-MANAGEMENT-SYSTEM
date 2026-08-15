import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const Wrapper = ({ token, user, onUserUpdate, handleLogout, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });
  const [message, setMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const logout = () => {
    handleLogout();
    navigate('/');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/profile/`,
        profileForm,
        { headers: { Authorization: `Token ${token}` } }
      );
      setMessage({ type: 'success', text: 'Profile updated successfully! 🎉' });
      if (onUserUpdate) {
        onUserUpdate(response.data);
      }
      setTimeout(() => {
        setSettingsOpen(false);
        setMessage(null);
      }, 1400);
    } catch (err) {
      console.error(err);
      const errText = err.response?.data
        ? Object.entries(err.response.data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
          .join(' | ')
        : 'Failed to update profile. Please try again.';
      setMessage({ type: 'error', text: errText });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 transition-all duration-300 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Left side navigation */}
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Link
                to="/"
                className="flex items-center gap-2.5 group transition-transform duration-200 hover:opacity-95"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600/30 transition-all shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-white">
                  <span className="hidden sm:inline">SHRESHTA TRAVELS</span>
                  <span className="sm:hidden">SHRESHTA</span>
                </span>
              </Link>

              {token && (
                <Link
                  to='/my-bookings'
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900/60 transition-all whitespace-nowrap"
                >
                  My Bookings
                </Link>
              )}
            </div>

            {/* Right side navigation */}
            <div className="flex items-center space-x-3">
              {token && user ? (
                <div className="relative">
                  {/* Profile info trigger button */}
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/40 border border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700 transition-all cursor-pointer select-none group"
                  >
                    {/* Avatar Circle with Status Pulse Dot */}
                    <div className="relative flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm ring-1 ring-indigo-400/40">
                        {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
                    </div>

                    <div className="hidden sm:flex flex-col text-left pr-1">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors leading-tight">
                        {user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user.username}
                      </span>
                    </div>

                    {/* Chevron Indicator */}
                    <svg
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-indigo-400' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {/* Click-away backdrop overlay */}
                  {dropdownOpen && (
                    <div
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen(false);
                      }}
                    />
                  )}

                  {/* Floating Profile Dropdown Card */}
                  {dropdownOpen && (
                    <div
                      onClick={e => e.stopPropagation()}
                      className="absolute top-12 right-0 w-80 bg-slate-900/95 border border-slate-700/60 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl z-50 text-left space-y-3 animate-in fade-in zoom-in-95 duration-150"
                    >
                      {/* Top Account Summary Box */}
                      <div className="flex items-center gap-3.5 pb-3.5 border-b border-slate-800/80">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg ring-2 ring-indigo-400/30 shrink-0">
                          {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-extrabold text-white truncate">
                            {user.first_name && user.last_name
                              ? `${user.first_name} ${user.last_name}`
                              : user.username}
                          </div>
                          <div className="text-xs text-slate-400 truncate mt-0.5">
                            {user.email || `@${user.username}`}
                          </div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-2 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {user.is_staff ? 'Administrator' : 'Passenger Account'}
                          </span>
                        </div>
                      </div>

                      {/* Dropdown Menu Items */}
                      <div className="space-y-1 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate('/my-bookings');
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white hover:bg-indigo-600/15 hover:border-indigo-500/30 border border-transparent transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12h5.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125H7.5a1.125 1.125 0 0 1-1.125-1.125V7.5C6.375 6.875 6.875 6.375 7.5 6.375Zm0 0V3.75" />
                            </svg>
                            <span>My Bookings</span>
                          </div>
                          <svg className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            setSettingsOpen(true);
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white hover:bg-indigo-600/15 hover:border-indigo-500/30 border border-transparent transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-purple-400 group-hover:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.645-.869L9.594 3.94ZM12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
                            </svg>
                            <span>Profile Settings</span>
                          </div>
                          <svg className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </button>

                        <div className="h-px bg-slate-800/80 my-1.5" />

                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 hover:border-rose-500/30 border border-transparent transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                            </svg>
                            <span>Logout</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Link
                    to="/register"
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all border border-slate-700/40 hover:border-slate-600"
                  >
                    Register
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-white hover:bg-slate-100 transition-all shadow-sm active:scale-[0.98]"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      < main className="flex-grow w-full" >
        {children}
      </main >

      {/* ── Settings Modal Overlay ── */}
      {
        settingsOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            {/* Modal Container */}
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              width: '90%',
              maxWidth: '460px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              animation: 'modalFadeIn 0.25s ease-out'
            }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
                background: '#f8fafc'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  Profile Settings
                </h3>
                <button
                  onClick={() => { setSettingsOpen(false); setMessage(null); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSaveProfile} style={{ padding: '24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: '#ffffff',
                    fontSize: '24px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                    marginBottom: '10px'
                  }}>
                    {user?.username?.charAt(0) || 'U'}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#475569' }}>
                    @{user?.username}
                  </div>
                </div>

                {/* Form Input fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* First & Last Name row */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.first_name}
                        onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })}
                        placeholder="e.g. Rahul"
                        className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '12px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          outline: 'none',
                          color: '#1e293b',
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.last_name}
                        onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })}
                        placeholder="e.g. Kumar"
                        className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '12px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          outline: 'none',
                          color: '#1e293b',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="e.g. rahul@example.com"
                      className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '12px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        outline: 'none',
                        color: '#1e293b',
                      }}
                    />
                  </div>
                </div>

                {/* Status Message */}
                {message && (
                  <div style={{
                    marginTop: '20px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fca5a5'}`,
                    color: message.type === 'success' ? '#15803d' : '#dc2626'
                  }}>
                    {message.text}
                  </div>
                )}

                {/* Actions Footer */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  marginTop: '28px',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '20px'
                }}>
                  <button
                    type="button"
                    onClick={() => { setSettingsOpen(false); setMessage(null); }}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      border: '1.5px solid #e2e8f0',
                      background: '#fff',
                      color: '#475569',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '10px',
                      border: 'none',
                      background: isSaving ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(99,102,241,0.3)'
                    }}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            <style>{`
            @keyframes modalFadeIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
          </div>
        )
      }

      {/* Footer */}
      {
        !isHomePage && location.pathname !== '/login' && location.pathname !== '/register' && (
          <footer className="bg-slate-950 border-t border-slate-800/80">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-slate-400 text-sm font-medium">
                &copy; {new Date().getFullYear()} SHRESHTA TRAVELS. All rights reserved.
              </p>
            </div>
          </footer>
        )
      }
    </div>
  );
};

export default Wrapper;