import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import BackButton from '../components/BackButton'
import PRAYERS from '../data/prayers'

// Items enter in sequence rather than all at once.
// staggerChildren is the delay between each item starting.
const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04, delayChildren: 0.02 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
}

function getSavedPrayers() {
  try {
    return JSON.parse(localStorage.getItem('saved_prayers') || '[]')
  } catch {
    return []
  }
}

function setSavedPrayers(list) {
  localStorage.setItem('saved_prayers', JSON.stringify(list))
}

function Prayers() {
  const [category, setCategory] = useState(null)
  const [selected, setSelected] = useState(null)
  const [savedNames, setSavedNames] = useState(() => {
    return getSavedPrayers().map(p => p.name)
  })

  useEffect(() => {
    const el = document.querySelector('.page-content')
    if (el) el.scrollTop = 0
  }, [category, selected])

  useEffect(() => {
    if (category && PRAYERS[category]) {
      PRAYERS[category].forEach(prayer => {
        if (prayer.image) {
          const img = new Image()
          img.src = prayer.image
        }
      })
    }
  }, [category])

  function toggleSave(prayer) {
    const saved = getSavedPrayers()
    const exists = saved.find(p => p.name === prayer.name)
    let updated
    if (exists) {
      updated = saved.filter(p => p.name !== prayer.name)
    } else {
      updated = [...saved, { name: prayer.name, category, text: prayer.text, image: prayer.image, caption: prayer.caption, history: prayer.history }]
    }
    setSavedPrayers(updated)
    setSavedNames(updated.map(p => p.name))
  }

  function selectCategory(cat) {
    setCategory(cat)
  }

  function selectPrayer(prayer) {
    setSelected(prayer)
  }

  function backFromPrayer() {
    setSelected(null)
  }

  function backFromCategory() {
    setCategory(null)
  }

  if (selected) {
    const isSaved = savedNames.includes(selected.name)
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={backFromPrayer} />
          <p className="readings-eyebrow">{category}</p>
          <div className="prayer-header-row">
            <h1 className="struggle-category-title">{selected.name}</h1>
            <button
              className={`prayer-bookmark-btn ${isSaved ? 'saved' : ''}`}
              onClick={() => toggleSave(selected)}
              aria-label={isSaved ? 'Remove bookmark' : 'Bookmark prayer'}
            >
              {isSaved ? '★' : '☆'}
            </button>
          </div>
        </div>
        <div className="page-content">
          {selected.image && (
            <div className="prayer-image-block">
              <img
                src={selected.image}
                alt={selected.name}
                className="prayer-image"
              />
              {selected.caption && (
                <p className="prayer-image-caption">{selected.caption}</p>
              )}
            </div>
          )}
          <div className="prayer-detail-card">
            <p className="prayer-detail-text">{selected.text}</p>
          </div>
          {selected.history && (
            <div className="prayer-history-card">
              <p className="prayer-history-label">About this Prayer</p>
              <p className="prayer-history-text">{selected.history}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (category) {
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={backFromCategory} />
          <p className="readings-eyebrow">Prayers</p>
          <h1 className="struggle-category-title">{category}</h1>
        </div>
        <div className="page-content">
          <motion.div
            className="prayers-items"
            key={category}
            variants={listVariants}
            initial="hidden"
            animate="show"
          >
            {PRAYERS[category].map(prayer => (
              <motion.button
                key={prayer.name}
                variants={itemVariants}
                className="prayer-item-btn"
                onClick={() => selectPrayer(prayer)}
              >
                {prayer.name}
                {savedNames.includes(prayer.name) && (
                  <span className="prayer-item-saved">★</span>
                )}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <BackButton />
        <p className="readings-eyebrow">Traditional Prayers</p>
        <h1 className="struggle-category-title">Prayers</h1>
      </div>
      <div className="page-content">
        <motion.div
          className="prayers-category-grid"
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          {Object.keys(PRAYERS).map(cat => (
            <motion.button
              key={cat}
              variants={itemVariants}
              className="prayers-category-btn"
              onClick={() => selectCategory(cat)}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default Prayers
