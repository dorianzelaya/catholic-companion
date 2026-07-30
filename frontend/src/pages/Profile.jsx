import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState('English')

  const initial = user?.username
    ? user.username[0].toUpperCase()
    : user?.email
    ? user.email[0].toUpperCase()
    : '?'

  const displayName = user?.username || user?.email || 'User'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="page">
      <div className="page-header">
        <p className="readings-eyebrow">Your Account</p>
        <h1 className="profile-title">Profile</h1>
      </div>

      <div className="page-content">

        {/* Account */}
        <div className="profile-section">
          <div className="profile-account-card">
            <div className="profile-avatar">{initial}</div>
            <div className="profile-account-info">
              <p className="profile-name">{displayName}</p>
              {user?.email && <p className="profile-email">{user.email}</p>}
            </div>
          </div>
          <button className="profile-logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </div>

        {/* Settings */}
        <p className="profile-section-label">Settings</p>
        <div className="profile-section">
          <div className="profile-row">
            <span className="profile-row-label">Language</span>
            <span className="profile-row-value">English</span>
          </div>
          <div className="profile-divider" />
          <div className="profile-row">
            <span className="profile-row-label">Dark Mode</span>
            <button
              className={`profile-toggle ${darkMode ? 'active' : ''}`}
              onClick={() => setDarkMode(!darkMode)}
            >
              <div className="profile-toggle-thumb" />
            </button>
          </div>
        </div>

        {/* Features */}
        <p className="profile-section-label">Features</p>
        <div className="profile-section">
          <button className="profile-feature-row">
            <span className="profile-row-label">Prayer Journal</span>
            <span className="profile-feature-arrow">›</span>
          </button>
          <div className="profile-divider" />
          <button className="profile-feature-row">
            <span className="profile-row-label">Reading Plan</span>
            <span className="profile-feature-arrow">›</span>
          </button>
          <div className="profile-divider" />
          <button className="profile-feature-row">
            <span className="profile-row-label">Daily Streak</span>
            <span className="profile-feature-arrow">›</span>
          </button>
          <div className="profile-divider" />
          <button className="profile-feature-row">
            <span className="profile-row-label">Saved Prayers</span>
            <span className="profile-feature-arrow">›</span>
          </button>
        </div>

      </div>
    </div>
  )
}

export default Profile
