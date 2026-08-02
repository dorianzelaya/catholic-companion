import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import BIBLE_BOOKS from '../data/bible'
import API_URL from '../config'

// Local calendar date (YYYY-MM-DD). Must NOT use toISOString(), which
// converts to UTC and rolls the date over in the evening for US timezones.
function getTodayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Whole days between two YYYY-MM-DD strings, compared at local midnight
function daysBetween(fromStr, toStr) {
  const [y1, m1, d1] = fromStr.split('-').map(Number)
  const [y2, m2, d2] = toStr.split('-').map(Number)
  const a = new Date(y1, m1 - 1, d1)
  const b = new Date(y2, m2 - 1, d2)
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

const STREAK_VERSION = 2

function updateStreak() {
  const today = getTodayStr()
  const fresh = { v: STREAK_VERSION, count: 1, lastDate: today }
  try {
    const raw = localStorage.getItem('prayer_streak')
    if (!raw) {
      localStorage.setItem('prayer_streak', JSON.stringify(fresh))
      return fresh
    }

    const stored = JSON.parse(raw)

    // Records written before the timezone fix have an inflated count.
    // Discard them once rather than carrying a wrong number forward.
    if (stored.v !== STREAK_VERSION) {
      localStorage.setItem('prayer_streak', JSON.stringify(fresh))
      return fresh
    }

    const { count, lastDate } = stored

    if (lastDate === today) return stored

    const diff = daysBetween(lastDate, today)

    if (diff <= 0) {
      const resynced = { v: STREAK_VERSION, count, lastDate: today }
      localStorage.setItem('prayer_streak', JSON.stringify(resynced))
      return resynced
    }

    const newCount = diff === 1 ? count + 1 : 1
    const updated = { v: STREAK_VERSION, count: newCount, lastDate: today }
    localStorage.setItem('prayer_streak', JSON.stringify(updated))
    return updated
  } catch {
    localStorage.setItem('prayer_streak', JSON.stringify(fresh))
    return fresh
  }
}

function resetStreak() {
  const fresh = { v: STREAK_VERSION, count: 1, lastDate: getTodayStr() }
  localStorage.setItem('prayer_streak', JSON.stringify(fresh))
  return fresh
}

function getSavedPrayers() {
  try {
    return JSON.parse(localStorage.getItem('saved_prayers') || '[]')
  } catch {
    return []
  }
}

function removeSavedPrayer(name) {
  const saved = getSavedPrayers().filter(p => p.name !== name)
  localStorage.setItem('saved_prayers', JSON.stringify(saved))
  return saved
}

function getReadChapters() {
  try {
    return JSON.parse(localStorage.getItem('bible_read_chapters') || '{}')
  } catch {
    return {}
  }
}

function formatJournalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = new Date()
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  if (isToday) return 'Today'
  return date.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function BackButton({ onClick }) {
  return <button className="back-button" onClick={onClick}>← Back</button>
}

function Profile() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [streak, setStreak] = useState({ count: 0, lastDate: null })
  const [savedPrayers, setSavedPrayers] = useState([])
  const [readChapters, setReadChapters] = useState({})
  const [view, setView] = useState('main')
  const [selectedPrayer, setSelectedPrayer] = useState(null)

  const [journal, setJournal] = useState([])
  const [journalText, setJournalText] = useState('')
  const [journalLoading, setJournalLoading] = useState(false)
  const [journalError, setJournalError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setStreak(updateStreak())
    setSavedPrayers(getSavedPrayers())
    setReadChapters(getReadChapters())
  }, [])

  function authHeaders() {
    const t = token || localStorage.getItem('token')
    return t ? { Authorization: `Bearer ${t}` } : {}
  }

  async function loadJournal() {
    setJournalLoading(true)
    setJournalError('')
    try {
      const res = await fetch(`${API_URL}/journal`, { headers: authHeaders() })
      if (res.status === 401) throw new Error('Your session expired. Please log in again.')
      if (!res.ok) throw new Error('Could not load your journal')
      setJournal(await res.json())
    } catch (err) {
      setJournalError(err.message)
    } finally {
      setJournalLoading(false)
    }
  }

  async function handleSaveEntry() {
    const text = journalText.trim()
    if (!text || saving) return
    setSaving(true)
    setJournalError('')
    try {
      const res = await fetch(`${API_URL}/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ text, date: getTodayStr() }),
      })
      if (res.status === 401) throw new Error('Your session expired. Please log in again.')
      if (!res.ok) throw new Error('Could not save your entry')
      const created = await res.json()
      setJournal(prev => [created, ...prev])
      setJournalText('')
    } catch (err) {
      setJournalError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteEntry(id) {
    const previous = journal
    setJournal(prev => prev.filter(e => e.id !== id))
    try {
      const res = await fetch(`${API_URL}/journal/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok && res.status !== 204) throw new Error()
    } catch {
      setJournal(previous)
      setJournalError('Could not delete that entry')
    }
  }

  useEffect(() => {
    if (view === 'journal') loadJournal()
  }, [view])

  // Reset scroll whenever the view changes, otherwise you land mid-page
  useEffect(() => {
    const el = document.querySelector('.page-content')
    if (el) el.scrollTop = 0
  }, [view, selectedPrayer])

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

  function handleResetStreak() {
    setStreak(resetStreak())
  }

  function handleUnsave(name) {
    const updated = removeSavedPrayer(name)
    setSavedPrayers(updated)
    if (selectedPrayer?.name === name) setSelectedPrayer(null)
  }

  const allBooks = [...BIBLE_BOOKS.OT, ...BIBLE_BOOKS.NT]
  const totalChaptersRead = Object.values(readChapters).reduce((sum, chs) => sum + chs.length, 0)
  const hasStarted = totalChaptersRead > 0

  // Saved prayer detail
  if (selectedPrayer) {
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={() => setSelectedPrayer(null)} />
          <p className="readings-eyebrow">Saved Prayers</p>
          <div className="prayer-header-row">
            <h1 className="struggle-category-title">{selectedPrayer.name}</h1>
            <button
              className="prayer-bookmark-btn saved"
              onClick={() => handleUnsave(selectedPrayer.name)}
              aria-label="Remove from saved prayers"
            >
              ★
            </button>
          </div>
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
                <div key={prayer.name} className="saved-prayer-row">
                  <button
                    className="saved-prayer-name-btn"
                    onClick={() => setSelectedPrayer(prayer)}
                  >
                    {prayer.name}
                  </button>
                  <button
                    className="saved-prayer-unsave-btn"
                    onClick={() => handleUnsave(prayer.name)}
                    aria-label={`Remove ${prayer.name} from saved prayers`}
                  >
                    ★
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Prayer journal
  if (view === 'journal') {
    const grouped = journal.reduce((acc, entry) => {
      (acc[entry.date] = acc[entry.date] || []).push(entry)
      return acc
    }, {})
    const dates = Object.keys(grouped).sort().reverse()

    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={() => setView('main')} />
          <p className="readings-eyebrow">Profile</p>
          <h1 className="profile-title">Prayer Journal</h1>
        </div>
        <div className="page-content">

          <div className="journal-compose">
            <textarea
              className="journal-input"
              placeholder="Write a prayer intention, a thanksgiving, or whatever is on your heart..."
              value={journalText}
              onChange={e => setJournalText(e.target.value)}
              rows={4}
              maxLength={5000}
            />
            <button
              className="journal-save-btn"
              onClick={handleSaveEntry}
              disabled={!journalText.trim() || saving}
            >
              {saving ? 'Saving...' : 'Save Entry'}
            </button>
          </div>

          {journalError && <p className="auth-error">{journalError}</p>}
          {journalLoading && <p className="readings-loading">Loading...</p>}

          {!journalLoading && journal.length === 0 && !journalError && (
            <p className="profile-reading-prompt">
              Your journal is empty. Write your first entry above.
            </p>
          )}

          {dates.map(date => (
            <div key={date} className="journal-day">
              <p className="journal-date">{formatJournalDate(date)}</p>
              {grouped[date].map(entry => (
                <div key={entry.id} className="journal-entry">
                  <p className="journal-entry-text">{entry.text}</p>
                  <button
                    className="journal-delete-btn"
                    onClick={() => handleDeleteEntry(entry.id)}
                    aria-label="Delete entry"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ))}

        </div>
      </div>
    )
  }

  // Reading plan
  if (view === 'reading-plan') {
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={() => setView('main')} />
          <p className="readings-eyebrow">Profile</p>
          <h1 className="profile-title">Reading Plan</h1>
          {hasStarted && (
            <p className="profile-reading-total">{totalChaptersRead} of 1,189 chapters read</p>
          )}
        </div>
        <div className="page-content">
          {!hasStarted && (
            <p className="profile-reading-prompt">Start reading the Bible to track your progress here.</p>
          )}
          <div className="profile-reading-list">
            {allBooks.map(b => {
              const readCount = readChapters[b.slug]?.length || 0
              const pct = Math.round((readCount / b.chapters) * 100)
              const done = readCount === b.chapters
              return (
                <div key={b.slug} className="profile-reading-item">
                  <div className="profile-reading-item-header">
                    <span className="profile-reading-book-name">{b.name}</span>
                    <span className={`profile-reading-book-count ${done ? 'done' : ''}`}>
                      {done ? '✓ Complete' : `${readCount}/${b.chapters}`}
                    </span>
                  </div>
                  <div className="profile-reading-bar-bg">
                    <div className="profile-reading-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Main profile
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

        {/* Prayer Streak */}
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
          <button className="profile-streak-reset" onClick={handleResetStreak}>
            Reset streak
          </button>
        </div>

        {/* Settings */}
        <p className="profile-section-label">Settings</p>
        <div className="profile-section">
          <div className="profile-row">
            <span className="profile-row-label">Language</span>
            <span className="profile-row-value">English</span>
          </div>
        </div>

        {/* Features */}
        <p className="profile-section-label">Features</p>
        <div className="profile-section">
          <button className="profile-feature-row" onClick={() => setView('journal')}>
            <span className="profile-row-label">Prayer Journal</span>
            <span className="profile-feature-arrow">›</span>
          </button>
          <div className="profile-divider" />
          <button className="profile-feature-row" onClick={() => setView('reading-plan')}>
            <span className="profile-row-label">Reading Plan</span>
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
