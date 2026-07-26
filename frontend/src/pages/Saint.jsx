import { useState, useEffect } from 'react'
import BackButton from '../components/BackButton'
import API_URL from '../config'

async function fetchWikipediaData(saintName, saintDescription) {
  try {
    const cleanName = saintName
      .replace(/^(Saint|St\.|Blessed|Venerable)\s+/i, '')
      .replace(/,.*$/, '')
      .trim()

    // Name parts we require the article title to match, ignoring short filler words
    const nameParts = cleanName
      .split(/\s+/)
      .filter(w => w.length > 3)
      .map(w => w.toLowerCase())

    const contextWords = saintDescription
      ? saintDescription.split(' ').slice(0, 5).join(' ')
      : 'Catholic saint'

    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent('Saint ' + cleanName + ' ' + contextWords)}&format=json&origin=*&srlimit=5`
    const searchResponse = await fetch(searchUrl)
    if (!searchResponse.ok) return null
    const searchData = await searchResponse.json()

    const results = searchData.query.search
    if (!results.length) return null

    // Only accept a result whose title actually contains the saint's name
    const match = results.find(r => {
      const title = r.title.toLowerCase()
      return nameParts.length > 0 && nameParts.every(part => title.includes(part))
    })
    if (!match) return null

    const pageTitle = match.title

    const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=extracts|pageimages&exintro=true&explaintext=true&piprop=original&format=json&origin=*`
    const contentResponse = await fetch(contentUrl)
    if (!contentResponse.ok) return null
    const contentData = await contentResponse.json()

    const pages = contentData.query.pages
    const page = Object.values(pages)[0]
    if (!page.extract) return null

    if (page.extract.includes('may refer to:')) return null

    return {
      text: page.extract.trim(),
      image: page.original ? page.original.source : null
    }

  } catch {
    return null
  }
}

function Saint() {
  const [data, setData] = useState(null)
  const [wikiData, setWikiData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadSaint() {
      try {
        const response = await fetch(`${API_URL}/readings/today`)
        if (!response.ok) throw new Error('Could not load saint data')
        const json = await response.json()
        setData(json)

        if (json.saint_name && json.saint_type !== 'FERIA') {
          const wiki = await fetchWikipediaData(json.saint_name, json.saint_description)
          setWikiData(wiki)
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
    (!data.saint_description && !data.saint_quote && !data.saint_type?.includes('MEMORIAL') && !data.saint_type?.includes('FEAST'))
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