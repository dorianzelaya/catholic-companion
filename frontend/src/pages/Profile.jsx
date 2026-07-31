import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'

function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}

function updateStreak() {
  const today = getTodayStr()
  try {
    const raw = localStorage.getItem('prayer_streak')
    if (!raw) {
      const newStreak = { count: 1, lastDate: today }
      localStorage.setItem('prayer_streak', JSON.stringify(newStreak))
      return newStreak
    }
    const { count, lastDate } = JSON.parse(raw)
    if (lastDate === today) {
      return { count, lastDate }
    }
    const last = new Date(lastDate)
    const now = new Date(today)
    const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24))
    const newCount = diffDays === 1 ? count + 1 : 1
    const newStreak = { count: newCount, lastDate: today }
    localStorage.setItem('prayer_streak', JSON.stringify(newStreak))
    return newStreak
  } catch {
    return { count: 1, lastDate: today }
  }
}

function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(false)
  const [streak, setStreak] = useState({ count: 0, lastDate: null })

  useEffect(() => {
    const s = updateStreak()
    setStreak(s)
  }, [])

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

  function streakLabel(count) {
    if (count === 1) return 'day'
    return 'days'
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

        {/* Daily Streak */}
        <p className="profile-section-label">Daily Streak</p>
        <div className="profile-section">
          <div className="profile-streak-card">
            <div className="profile-streak-flame">🔥</div>
            <div className="profile-streak-info">
              <p className="profile-streak-count">{streak.count} {streakLabel(streak.count)}</p>
              <p className="profile-streak-sub">
                {streak.count === 1
                  ? 'You opened the app today. Keep it going!'
                  : `${streak.count} consecutive days of prayer. Well done.`}
              </p>
            </div>
          </div>
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
            <span className="profile-row-label">Saved Prayers</span>
            <span className="profile-feature-arrow">›</span>
          </button>
        </div>

      </div>
    </div>
  )
}

export default Profile
