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
      <nav className="bg-white/80 backdrop-blur-md border-b border-indigo-100/30 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side navigation */}
            <div className="flex items-center space-x-8">
              <Link
                to="/"
                className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
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
                <span className="text-xl font-bold">SHRESHTA TRAVELS</span>
              </Link>

              {token && (
                <Link
                  to='/my-bookings'
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-100 transition-colors"
                >
                  My Bookings
                </Link>
              )}
            </div>

            {/* Right side navigation */}
            <div className="flex items-center space-x-4">
              {token && user ? (
                <div className="flex items-center gap-4">
                  {/* Profile info segment */}
                  <div
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      border: dropdownOpen ? '1px solid #dee2e6' : '1px solid #f1f3f5',
                      background: dropdownOpen ? '#f8f9fa' : '#ffffff',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease-in-out'
                    }}
                    className="cursor-pointer select-none hover:bg-gray-50 hover:border-gray-300"
                  >
                    {/* Avatar Circle with Status Dot */}
                    <div style={{ position: 'relative', display: 'flex' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: user.is_staff
                          ? 'linear-gradient(135deg, #f43f5e, #be123c)'
                          : 'linear-gradient(135deg, #4f46e5, #3730a3)',
                        color: '#ffffff',
                        fontWeight: 750,
                        fontSize: '14px',
                        textTransform: 'uppercase',
                        boxShadow: user.is_staff
                          ? '0 0 0 2px #fecdd3, 0 2px 6px rgba(220, 38, 38, 0.25)'
                          : '0 0 0 2px #dbeafe, 0 2px 6px rgba(79, 70, 229, 0.25)',
                      }}>
                        {user.username ? user.username.charAt(0) : 'U'}
                      </div>
                      {/* Active Status Badge Pulse Dot */}
                      <span
                        className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-500 animate-pulse"
                        style={{ bottom: '-1px', right: '-1px' }}
                      />
                    </div>

                    <div className="hidden sm:flex flex-col text-left">
                      <span style={{ color: '#1e293b', fontSize: '13px', fontWeight: 700, lineHeight: 1.2 }}>
                        {user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user.username}
                      </span>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: user.is_staff ? '#ef4444' : '#6366f1',
                        marginTop: '3px',
                        lineHeight: 1
                      }}>
                        {user.is_staff ? 'Administrator' : 'Passenger Account'}
                      </span>
                    </div>

                    {/* Chevron Indicator */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      style={{
                        width: '18px',
                        height: '18px',
                        color: '#94a3b8',
                        transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                        marginLeft: '2px'
                      }}
                    >
                      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>

                    {/* Click-away overlay */}
                    {dropdownOpen && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(false);
                        }}
                        style={{
                          position: 'fixed',
                          inset: 0,
                          zIndex: 43,
                          cursor: 'default'
                        }}
                      />
                    )}

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div
                        onClick={e => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          top: '52px',
                          right: 0,
                          width: '240px',
                          background: 'rgba(255, 255, 255, 0.98)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(226, 232, 240, 0.8)',
                          borderRadius: '16px',
                          boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                          padding: '10px',
                          zIndex: 45,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          cursor: 'default',
                          animation: 'dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      >
                        <div style={{
                          padding: '10px 12px 12px 12px',
                          borderBottom: '1px solid #f1f5f9',
                          marginBottom: '6px',
                          textAlign: 'left'
                        }}>
                          <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                            PASSPORT ACCOUNT
                          </div>
                          <div style={{
                            fontSize: '13px',
                            color: '#0f172a',
                            fontWeight: 700,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginTop: '2px'
                          }}>
                            {user.email || user.username}
                          </div>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: user.is_staff ? '#ef4444' : '#6366f1',
                            background: user.is_staff ? '#fef2f2' : '#e0e7ff',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            display: 'inline-block',
                            marginTop: '8px'
                          }}>
                            {user.is_staff ? 'Administrator' : 'Passenger Details'}
                          </span>
                        </div>

                        {/* Dropdown Options with Vector Icons */}
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate('/my-bookings');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            width: '100%',
                            background: 'none',
                            border: 'none',
                            textAlign: 'left',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#334155',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#f1f5f9';
                            e.currentTarget.style.color = '#4f46e5';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.color = '#334155';
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                          </svg>
                          My Bookings
                        </button>

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            setSettingsOpen(true);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            width: '100%',
                            background: 'none',
                            border: 'none',
                            textAlign: 'left',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#334155',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#f1f5f9';
                            e.currentTarget.style.color = '#4f46e5';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.color = '#334155';
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.645-.869L9.594 3.94ZM12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
                          </svg>
                          Profile Settings
                        </button>

                        <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }}></div>

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            width: '100%',
                            background: 'none',
                            border: 'none',
                            textAlign: 'left',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#e11d48',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#fff1f2';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'none';
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    )}
                    <style>{`
                      @keyframes dropdownFadeIn {
                        from { opacity: 0; transform: translateY(-8px); }
                        to { opacity: 1; transform: translateY(0); }
                      }
                    `}</style>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Register
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav >

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
                  <div style={{ display: 'flex', gap: '16px' }}>
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
        !isHomePage && (
          <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} TravelEase. All rights reserved.
              </p>
            </div>
          </footer>
        )
      }
    </div >
  );
};

export default Wrapper;