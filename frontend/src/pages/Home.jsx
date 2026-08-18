import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeHeader from '../components/HomeHeader'
import API_URL from '../config'
import { getLocalDateKey } from '../utils/dateKey'
import {
  SaintIcon,
  BibleIcon,
  SeekIcon,
  ExaminationIcon,
  RosaryIcon,
  PrayingHandsIcon,
} from '../components/tileIcons'

// The six grid tiles, in display order:
//   row 1: Saint of the Day, Bible, Seek
//   row 2: Examination, Rosary, Prayers
// Order and labels come from the redesign; each tile pairs a short label
// with a line icon that matches the crimson/gold theme.
const TILES = [
  { label: 'Saint of the Day', path: '/saint', Icon: SaintIcon },
  { label: 'Bible', path: '/bible', Icon: BibleIcon },
  { label: 'Seek', path: '/struggle', Icon: SeekIcon },
  { label: 'Examination', path: '/examination', Icon: ExaminationIcon },
  { label: 'Rosary', path: '/rosary', Icon: RosaryIcon },
  { label: 'Prayers', path: '/prayers', Icon: PrayingHandsIcon },
]

function Home() {
  const navigate = useNavigate()

  const [readings, setReadings] = useState(() => {
    try {
      const saved = localStorage.getItem('cached_home_data')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    async function loadReadings() {
      try {
        // Send the device's own local date so the backend serves the day
        // the user is actually living, not US Eastern. Same helper feeds
        // the Saint page and its cache key, so they can't disagree.
        const today = getLocalDateKey()
        const response = await fetch(`${API_URL}/readings/today?date=${today}`)
        if (!response.ok) return
        const data = await response.json()
        setReadings(data)
        localStorage.setItem('cached_home_data', JSON.stringify(data))
      } catch (err) {
        // Silently fail — home screen still works without readings data
      }
    }
    loadReadings()
  }, [])

  return (
    <div className="page">
      <HomeHeader readings={readings} />
      <div className="page-content">
        {/* Today's Readings: full-width feature card at the top. It's the
            one item that shows live daily content (the day's citation), so
            it gets the prominent banner slot above the grid. */}
        <div
          className="home-readings-banner"
          onClick={() => navigate('/readings')}
        >
          <div>
            <p className="home-readings-title">Today's Readings</p>
            <p className="home-readings-ref">
              {readings ? readings.first_reading_ref : ''}
            </p>
          </div>
          <span className="home-readings-arrow">›</span>
        </div>

        {/* The six sections as a 3-column grid of icon tiles. */}
        <div className="home-grid">
          {TILES.map(({ label, path, Icon }) => (
            <button
              key={label}
              className="home-tile"
              onClick={() => navigate(path)}
            >
              <span className="home-tile-icon">
                <Icon />
              </span>
              <span className="home-tile-label">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home