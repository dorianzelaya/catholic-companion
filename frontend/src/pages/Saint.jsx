import { useState, useEffect } from 'react'
import BackButton from '../components/BackButton'
import { authFetch } from '../api'

const WIKI_HEADERS = {
  'User-Agent': 'Commune Catholic App/1.0 (https://catholic-companion-production.up.railway.app)'
}

async function fetchWikipediaData(saintName, saintDescription) {
  try {
    const params = new URLSearchParams({
      name: saintName,
      description: saintDescription || ''
    })
    const response = await authFetch(`/readings/saint-wiki?${params}`)
    if (!response.ok) return null
    const data = await response.json()
    if (!data.text && !data.image) return null
    return data
  } catch {
    return null
  }
}

// Bump when the saint lookup logic changes, so already-cached days
// don't keep serving results produced by the old code.
const SAINT_CACHE_VERSION = 2

// Local calendar date. Deliberately not toISOString(), which converts to
// UTC and rolls the date over in the evening for US timezones.
function getTodayKey() {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

function readCache(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { v, date, payload } = JSON.parse(raw)
    if (v !== SAINT_CACHE_VERSION) return null
    if (date !== getTodayKey()) return null
    return payload
  } catch {
    return null
  }
}

function writeCache(key, payload) {
  try {
    localStorage.setItem(key, JSON.stringify({
      v: SAINT_CACHE_VERSION,
      date: getTodayKey(),
      payload,
    }))
  } catch {
    // storage full or unavailable — not worth failing the page over
  }
}

function Saint() {
  const [data, setData] = useState(() => readCache('cached_saint_data'))

  const [wikiData, setWikiData] = useState(() => readCache('cached_saint_wiki'))

  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState('')

  useEffect(() => {
    if (data && wikiData !== undefined) return // already loaded from cache

    async function loadSaint() {
      try {
        const response = await authFetch(`/readings/today`)
        if (!response.ok) throw new Error('Could not load saint data')
        const json = await response.json()
        setData(json)
        writeCache('cached_saint_data', json)

        const isFeria = (
          json.saint_type === 'FERIA' ||
          json.saint_type === 'SUNDAY' ||
          json.saint_type === 'SOLEMNITY' ||
          !json.saint_name ||
          (!json.saint_description && !json.saint_quote &&
            !json.saint_type?.includes('MEMORIAL') &&
            !json.saint_type?.includes('FEAST'))
        )

        if (!isFeria) {
          const wiki = await fetchWikipediaData(json.saint_name, json.saint_description)
          setWikiData(wiki)
          writeCache('cached_saint_wiki', wiki)
        } else {
          setWikiData(null)
          writeCache('cached_saint_wiki', null)
        }
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

  const isFeria = data && (
    data.saint_type === 'FERIA' ||
    data.saint_type === 'SUNDAY' ||
    data.saint_type === 'SOLEMNITY' ||
    !data.saint_name ||
    (!data.saint_description && !data.saint_quote &&
      !data.saint_type?.includes('MEMORIAL') &&
      !data.saint_type?.includes('FEAST'))
  )

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
            {wikiData?.image && (
              <div className="saint-image-block">
                <img
                  src={wikiData.image}
                  alt={data.saint_name}
                  className="saint-image"
                />
              </div>
            )}

            {(data.saint_quote || data.saint_description) && (
              <div className="saint-summary-card">
                {data.saint_quote && (
                  <>
                    <p className="saint-quote-text">"{data.saint_quote}"</p>
                    <p className="saint-quote-attr">— {data.saint_name}</p>
                    {data.saint_description && <div className="saint-card-divider" />}
                  </>
                )}
                {data.saint_description && (
                  <p className="saint-description">{data.saint_description}</p>
                )}
              </div>
            )}

            {wikiData?.text && (
              <div className="saint-wiki-block">
                <p className="saint-wiki-label">From Wikipedia</p>
                <p className="saint-wiki-text">{wikiData.text}</p>
              </div>
            )}
          </div>
        )}

        {data && isFeria && (
          <div className="saint-feria">
            <div className="saint-image-block">
              <img
                src="/rosary/transfiguration.jpg"
                alt="The Transfiguration of Christ"
                className="saint-image"
              />
            </div>
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
