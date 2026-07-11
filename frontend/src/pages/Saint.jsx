import { useState, useEffect } from 'react'
import BackButton from '../components/BackButton'
import API_URL from '../config'

function Saint() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadSaint() {
      try {
        const response = await fetch(`${API_URL}/readings/today`)
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

  const isFeria = data && !data.saint_description && !data.saint_quote

  return (
    <div className="page">
      <div className="page-header">
        <BackButton />
        <p className="readings-eyebrow">Saint of the Day</p>
        {data && <h1 className="saint-name">{data.saint_name}</h1>}
        {data && <p className="saint-type">{formatType(data.saint_type)}</p>}
      </div>

      <div className="page-content">
        {loading && <p className="readings-loading">Loading...</p>}
        {error && <p className="auth-error">{error}</p>}

        {data && !isFeria && (
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
          </div>
        )}

        {data && isFeria && (
          <div className="saint-feria">
            <p className="saint-feria-title">This day is not yet dedicated to a Saint recognized by the Catholic Church.</p>
            <p className="saint-feria-text">However, YOU can be a Saint today by following God's universal call to holiness. Remember to love the Lord your God with all your heart, mind, and soul — and to love your neighbor as He loved you.</p>
            <div className="saint-feria-verse">
              <p className="saint-feria-verse-text">"Be perfect, therefore, as your heavenly Father is perfect."</p>
              <p className="saint-feria-verse-ref">Matthew 5:48</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Saint