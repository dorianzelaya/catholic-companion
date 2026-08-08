import { useState } from 'react'
import BackButton from '../components/BackButton'
import { authFetch } from '../api'

const CATEGORIES = {
  "Growth": [
    "Discernment", "Wisdom", "Peace", "Hope", "Knowledge"
  ],
  "Emotional": [
    "Anxiety", "Fear", "Sadness", "Loneliness",
    "Grief", "Anger", "Shame"
  ],
  "Spiritual": [
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

function Struggle() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState('')

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
          {Object.entries(CATEGORIES).map(([group, items]) => (
            <div key={group} className="struggle-group">
              <p className="struggle-group-label">{group}</p>
              <div className="struggle-pills">
                {items.map(category => (
                  <button
                    key={category}
                    className="struggle-pill"
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
