import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import BIBLE_BOOKS from '../data/bible'

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
    if (lastDate === today) return { count, lastDate }
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

function getSavedPrayers() {
  try {
    return JSON.parse(localStorage.getItem('saved_prayers') || '[]')
  } catch {
    return []
  }
}

function getReadChapters() {
  try {
    return JSON.parse(localStorage.getItem('bible_read_chapters') || '{}')
  } catch {
    return {}
  }
}

function BackButton({ onClick }) {
  return <button className="back-button" onClick={onClick}>← Back</button>
}

function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(false)
  const [streak, setStreak] = useState({ count: 0, lastDate: null })
  const [savedPrayers, setSavedPrayers] = useState([])
  const [readChapters, setReadChapters] = useState({})
  const [view, setView] = useState('main') // 'main' | 'saved' | 'reading-plan'
  const [selectedPrayer, setSelectedPrayer] = useState(null)

  useEffect(() => {
    setStreak(updateStreak())
    setSavedPrayers(getSavedPrayers())
    setReadChapters(getReadChapters())
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

  // Books that have at least one chapter read
  const allBooks = [...BIBLE_BOOKS.OT, ...BIBLE_BOOKS.NT]
  const startedBooks = allBooks.filter(b => readChapters[b.slug]?.length > 0)
  const totalChaptersRead = Object.values(readChapters).reduce((sum, chs) => sum + chs.length, 0)

  // Selected saved prayer view
  if (selectedPrayer) {
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={() => setSelectedPrayer(null)} />
          <p className="readings-eyebrow">Saved Prayers</p>
          <h1 className="struggle-category-title">{selectedPrayer.name}</h1>
        </div>
        <div className="page-content">
          {selectedPrayer.image && (
            <div className="prayer-image-block">
              <img src={selectedPrayer.image} alt={selectedPrayer.name} className="prayer-image" />
              {selectedPrayer.caption && <p className="prayer-image-caption">{selectedPrayer.caption}</p>}
            </div>
          )}
          <div className="prayer-detail-card">
            <p className="prayer-detail-text">{selectedPrayer.text}</p>
          </div>
          {selectedPrayer.history && (
            <div className="prayer-history-card">
              <p className="prayer-history-label">About this Prayer</p>
              <p className="prayer-history-text">{selectedPrayer.history}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Saved prayers list
  if (view === 'saved') {
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={() => setView('main')} />
          <p className="readings-eyebrow">Profile</p>
          <h1 className="profile-title">Saved Prayers</h1>
        </div>
        <div className="page-content">
          {savedPrayers.length === 0 ? (
            <div className="profile-empty">
              <p className="profile-empty-text">No saved prayers yet. Bookmark a prayer from the Prayers page by tapping the ☆ icon.</p>
            </div>
          ) : (
            <div className="prayers-items">
              {savedPrayers.map(prayer => (
                <button
                  key={prayer.name}
                  className="prayer-item-btn"
                  onClick={() => setSelectedPrayer(prayer)}
                >
                  {prayer.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Reading plan view
  if (view === 'reading-plan') {
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={() => setView('main')} />
          <p className="readings-eyebrow">Profile</p>
          <h1 className="profile-title">Reading Plan</h1>
          {totalChaptersRead > 0 && (
            <p className="profile-reading-total">{totalChaptersRead} chapters read total</p>
          )}
        </div>
        <div className="page-content">
          {startedBooks.length === 0 ? (
            <div className="profile-empty">
              <p className="profile-empty-text">No chapters marked as read yet. Open a Bible chapter and tap "Mark as Read" at the bottom.</p>
            </div>
          ) : (
            <div className="profile-reading-list">
              {startedBooks.map(b => {
                const readCount = readChapters[b.slug]?.length || 0
                const pct = Math.round((readCount / b.chapters) * 100)
                const done = readCount === b.chapters
                return (
                  <div key={b.slug} className="profile-reading-item">
                    <div className="profile-reading-item-header">
                      <span className="profile-reading-book-name">{b.name}</span>
                      <span className="profile-reading-book-count">
                        {done ? '✓ Complete' : `${readCount}/${b.chapters}`}
                      </span>
                    </div>
                    <div className="profile-reading-bar-bg">
                      <div
                        className="profile-reading-bar-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main profile view
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
              <p className="profile-streak-count">{streak.count} {streak.count === 1 ? 'day' : 'days'}</p>
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
          <button className="profile-feature-row" onClick={() => setView('reading-plan')}>
            <div className="profile-feature-row-left">
              <span className="profile-row-label">Reading Plan</span>
              {totalChaptersRead > 0 && (
                <span className="profile-feature-badge">{totalChaptersRead} ch</span>
              )}
            </div>
            <span className="profile-feature-arrow">›</span>
          </button>
          <div className="profile-divider" />
          <button className="profile-feature-row" onClick={() => setView('saved')}>
            <div className="profile-feature-row-left">
              <span className="profile-row-label">Saved Prayers</span>
              {savedPrayers.length > 0 && (
                <span className="profile-feature-badge">{savedPrayers.length}</span>
              )}
            </div>
            <span className="profile-feature-arrow">›</span>
          </button>
        </div>

      </div>
    </div>
  )
}

export default Profile
