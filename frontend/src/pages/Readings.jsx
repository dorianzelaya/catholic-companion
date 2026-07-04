import { useState, useEffect } from 'react'
import NavBar from '../components/NavBar'
import BackButton from '../components/BackButton'
import API_URL from '../config'

function Readings() {
  const [readings, setReadings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadReadings() {
      try {
        const response = await fetch(`${API_URL}/readings/today`)
        if (!response.ok) throw new Error('Could not load readings')
        const data = await response.json()
        setReadings(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadReadings()
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <BackButton />
        <p className="readings-eyebrow">Daily Mass Readings</p>
        {readings && (
          <p className="readings-season">{readings.liturgical_season}</p>
        )}
      </div>

      <div className="page-content">
        {loading && <p className="readings-loading">Loading today's readings...</p>}
        {error && <p className="auth-error">{error}</p>}

        {readings && (
          <div className="readings-list">
            {readings.first_reading_ref && (
              <div className="reading-block">
                <p className="reading-label">First Reading</p>
                <p className="reading-ref">{readings.first_reading_ref}</p>
                <p className="reading-text">{readings.first_reading_text}</p>
              </div>
            )}

            {readings.psalm_ref && (
              <div className="reading-block">
                <p className="reading-label">Psalm</p>
                <p className="reading-ref">{readings.psalm_ref}</p>
                <p className="reading-text">{readings.psalm_text}</p>
              </div>
            )}

            {readings.second_reading_ref && (
              <div className="reading-block">
                <p className="reading-label">Second Reading</p>
                <p className="reading-ref">{readings.second_reading_ref}</p>
                <p className="reading-text">{readings.second_reading_text}</p>
              </div>
            )}

            {readings.gospel_ref && (
              <div className="reading-block">
                <p className="reading-label">Gospel</p>
                <p className="reading-ref">{readings.gospel_ref}</p>
                <p className="reading-text">{readings.gospel_text}</p>
              </div>
            )}
          </div>
        )}
      </div>
      <NavBar />
    </div>
  )
}

export default Readings