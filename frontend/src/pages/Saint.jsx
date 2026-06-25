import { useState, useEffect } from 'react'
import NavBar from '../components/NavBar'

function Saint() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadSaint() {
      try {
        const response = await fetch('http://localhost:8000/readings/today')
        if (!response.ok) throw new Error('Could not load saint data')
        const json = await response.json()
        setData(json)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadSaint()
  }, [])

  function formatType(type) {
    if (!type) return ''
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase())
  }

  return (
    <div className="page">
      <div className="page-content">
        <div className="saint-header">
          <p className="readings-eyebrow">Saint of the Day</p>
          {data && <h1 className="saint-name">{data.saint_name}</h1>}
          {data && <p className="saint-type">{formatType(data.saint_type)}</p>}
        </div>

        {loading && <p className="readings-loading">Loading...</p>}
        {error && <p className="auth-error">{error}</p>}

        {data && (
          <div className="saint-body">
            {data.saint_quote && (
              <div className="saint-quote-block">
                <p className="saint-quote-text">"{data.saint_quote}"</p>
                <p className="saint-quote-attr">— {data.saint_name}</p>
              </div>
            )}

            {data.saint_description && (
              <div className="saint-description-block">
                <p className="saint-description">{data.saint_description}</p>
              </div>
            )}

            {!data.saint_description && !data.saint_quote && (
              <p className="readings-loading">
                No additional information available for today's celebration.
              </p>
            )}
          </div>
        )}
      </div>
      <NavBar />
    </div>
  )
}

export default Saint