import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

// Shuffle / randomize icon for the new-verse button. fill="currentColor"
// so it inherits the button's color from CSS.
function ShuffleIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="18"
      height="18"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M13 12h-2c-1 0-1.7-1.2-2.4-2.7-0.3 0.7-0.6 1.5-1 2.3 0.8 1.4 1.8 2.4 3.4 2.4h2v2l3-3-3-3v2z" />
      <path d="M5.4 6.6c0.3-0.7 0.6-1.5 1-2.2-0.8-1.4-1.9-2.4-3.4-2.4h-3v2h3c1 0 1.7 1.2 2.4 2.6z" />
      <path d="M16 3l-3-3v2h-2c-2.7 0-3.9 3-5 5.7-0.8 2.1-1.7 4.3-3 4.3h-3v2h3c2.6 0 3.8-2.8 4.9-5.6 0.9-2.2 1.8-4.4 3.1-4.4h2v2l3-3z" />
    </svg>
  )
}

function Struggle() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState('')
  // Index into result.passages. The backend sends the whole pool
  // pre-shuffled, so stepping this forward walks every verse once before
  // wrapping around — no repeats until the pool is exhausted, and no
  // second network request.
  const [verseIndex, setVerseIndex] = useState(0)

  useEffect(() => {
    const el = document.querySelector('.page-content')
    if (el) el.scrollTop = 0
  }, [result, loading])

  async function handleSelect(category) {
    setSelected(category)
    setLoading(true)
    setError('')
    setResult(null)
    setVerseIndex(0)

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

  function handleNewVerse() {
    if (!result?.passages?.length) return
    setVerseIndex(i => (i + 1) % result.passages.length)
  }

  function handleBack() {
    setResult(null)
    setSelected('')
    setError('')
    setVerseIndex(0)
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
    const passages = result.passages || []
    const current = passages[verseIndex]
    const hasMore = passages.length > 1

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

              {/* Fixed-height slot so short and long verses occupy exactly
                  the same space. The CSS sets a hard height (not just a
                  min-height) and lets an overlong verse scroll inside,
                  so nothing below ever shifts as verses cycle. */}
              <div className="struggle-verse-slot">
                {/* One verse at a time. AnimatePresence with mode="wait"
                    fades the current verse out before fading the next in,
                    so the two never overlap mid-transition. */}
                <AnimatePresence mode="wait">
                  {current && (
                    <motion.div
                      key={verseIndex}
                      className="struggle-passage"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.28, ease: 'easeInOut' }}
                    >
                      <p className="struggle-ref">{current.reference}</p>
                      <p className="struggle-text">"{current.text}"</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {hasMore && (
                <button
                  className="struggle-new-verse-btn"
                  onClick={handleNewVerse}
                  aria-label="Show another verse"
                  title="Show another verse"
                >
                  <ShuffleIcon />
                </button>
              )}
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
