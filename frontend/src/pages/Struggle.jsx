import { useState, useEffect } from 'react'
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

const GROUP_TINTS = {
  "Growth": "tint-growth",
  "Emotional": "tint-emotional",
  "Spiritual": "tint-spiritual",
  "Sins & Vices": "tint-vices",
  "Life Situations": "tint-life",
}

function Struggle() {
  const [group, setGroup] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState('')

  // Reset scroll to top on every level change — group circles, topic
  // list, and result all live in the same .page-content element, so
  // without this a scrolled-down result page leaves the topic list
  // (or group list) appearing scrolled-down and empty when you go back.
  useEffect(() => {
    const el = document.querySelector('.page-content')
    if (el) el.scrollTop = 0
  }, [group, result, loading])

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

  function handleBackFromResult() {
    setResult(null)
    setSelected('')
    setError('')
  }

  function handleBackFromGroup() {
    setGroup(null)
  }

  // Loading
  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={handleBackFromResult} />
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
          <BackButton onClick={handleBackFromResult} />
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

  // Level 2 — topics within a chosen group, as a list with a tinted
  // dot marker matching the group's color.
  if (group) {
    const topics = CATEGORIES[group]
    const tint = GROUP_TINTS[group]
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={handleBackFromGroup} />
          <p className="readings-eyebrow">Seek</p>
          <h1 className="struggle-category-title">{group}</h1>
        </div>
        <div className="page-content">
          {error && <p className="auth-error">{error}</p>}
          <div className="struggle-topic-list">
            {topics.map(topic => (
              <button
                key={topic}
                className="struggle-topic-row"
                onClick={() => handleSelect(topic)}
              >
                <span className={`struggle-topic-dot ${tint}`} />
                <span className="struggle-topic-label">{topic}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Level 1 — the five groups, as circles
  return (
    <div className="page">
      <div className="page-header">
        <BackButton />
        <p className="readings-eyebrow">Seek</p>
        <h1 className="struggle-category-title">Find scripture for...</h1>
      </div>

      <div className="page-content">
        <div className="struggle-cross">
          {Object.keys(CATEGORIES).map((g, i) => (
            <button
              key={g}
              className={`struggle-circle-group struggle-cross-pos-${i} ${GROUP_TINTS[g]}`}
              onClick={() => setGroup(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Struggle
