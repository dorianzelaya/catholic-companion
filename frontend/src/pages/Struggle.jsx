import { useState, useEffect } from 'react'
import BackButton from '../components/BackButton'
import { authFetch } from '../api'

const CATEGORIES = {
  "Growth": [
    "Discernment", "Wisdom", "Peace", "Hope", "Knowledge"
  ],
  "Emotions": [
    "Anxiety", "Fear", "Sadness", "Loneliness",
    "Grief", "Anger", "Shame"
  ],
  "Faith Struggles": [
    "Doubt", "Despair", "Feeling distant from God",
    "Temptation", "Lukewarmness"
  ],
  "Sins & Vices": [
    "Lust", "Pride", "Envy", "Gluttony",
    "Sloth", "Greed", "Wrath"
  ],
  "Life Situations": [
    "Family conflict", "Work stress", "Relationship trouble",
    "Financial worry", "Illness", "Loss", "Death of a loved one"
  ]
}

const GROUP_TINTS = {
  "Growth": "tint-growth",
  "Emotions": "tint-emotional",
  "Faith Struggles": "tint-spiritual",
  "Sins & Vices": "tint-vices",
  "Life Situations": "tint-life",
}

function Struggle() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState('')

  useEffect(() => {
    const el = document.querySelector('.page-content')
    if (el) el.scrollTop = 0
  }, [result, loading])

  async function handleSelect(category) {
    setSelected(category)
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await authFetch('/struggle/search', {
        method: 'POST',
        json: { category }
      })

      if (!response.ok) throw new Error('Could not load scripture')
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleBack() {
    setResult(null)
    setSelected('')
    setError('')
  }

  // Loading
  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={handleBack} />
          <p className="readings-eyebrow">Seek</p>
          <h1 className="struggle-category-title">{selected}</h1>
        </div>
        <div className="page-content">
          <p className="readings-loading">Finding scripture...</p>
        </div>
      </div>
    )
  }

  // Result
  if (result) {
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={handleBack} />
          <p className="readings-eyebrow">Scripture for...</p>
          <h1 className="struggle-category-title">{selected}</h1>
        </div>

        <div className="page-content">
          <div className="struggle-result-body">
            {result.crisis_note && (
              <div className="struggle-crisis">
                <p className="struggle-crisis-text">{result.crisis_note}</p>
              </div>
            )}

            <div className="struggle-section">
              <p className="struggle-section-label">Scripture</p>
              {result.passages.map((p, i) => (
                <div key={i} className="struggle-passage">
                  <p className="struggle-ref">{p.reference}</p>
                  <p className="struggle-text">"{p.text}"</p>
                </div>
              ))}
            </div>

            {result.saint && (
              <div className="struggle-section">
                <p className="struggle-section-label">A saint who understands</p>
                <div className="struggle-saint">
                  <p className="struggle-saint-name">{result.saint.name}</p>
                  <p className="struggle-saint-desc">{result.saint.description}</p>
                </div>
              </div>
            )}

            {result.prayer && (
              <div className="struggle-section">
                <p className="struggle-section-label">Prayer</p>
                <div className="struggle-prayer">
                  <p className="struggle-prayer-name">{result.prayer.name}</p>
                  <p className="struggle-prayer-attr">— {result.prayer.attribution}</p>
                  <p className="struggle-prayer-text">{result.prayer.text}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Single screen: all five groups, each with its topics as tinted pills
  return (
    <div className="page">
      <div className="page-header">
        <BackButton />
        <p className="readings-eyebrow">Seek</p>
        <h1 className="struggle-category-title">Find Scripture For...</h1>
      </div>

      <div className="page-content">
        {error && <p className="auth-error">{error}</p>}

        <div className="struggle-grid">
          {Object.entries(CATEGORIES).map(([groupName, items]) => (
            <div key={groupName} className="struggle-group">
              <p className="struggle-group-label">{groupName}</p>
              <div className="struggle-pills">
                {items.map(category => (
                  <button
                    key={category}
                    className={`struggle-pill ${GROUP_TINTS[groupName]}`}
                    onClick={() => handleSelect(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Struggle
