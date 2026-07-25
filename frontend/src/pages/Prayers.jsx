import { useState, useEffect } from 'react'
import BackButton from '../components/BackButton'
import PRAYERS from '../data/prayers'

function Prayers() {
  const [category, setCategory] = useState(null)
  const [selected, setSelected] = useState(null)

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
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={backFromPrayer} />
          <p className="readings-eyebrow">{category}</p>
          <h1 className="struggle-category-title">{selected.name}</h1>
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
          <div className="prayers-items">
            {PRAYERS[category].map(prayer => (
              <button
                key={prayer.name}
                className="prayer-item-btn"
                onClick={() => selectPrayer(prayer)}
              >
                {prayer.name}
              </button>
            ))}
          </div>
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
        <div className="prayers-category-grid">
          {Object.keys(PRAYERS).map(cat => (
            <button
              key={cat}
              className="prayers-category-btn"
              onClick={() => selectCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Prayers
