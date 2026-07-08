import { useEffect, useState } from 'react'

function HomeHeader({ readings }) {
  const today = new Date()
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

  const [cachedVerse, setCachedVerse] = useState(() => {
    try {
      const saved = localStorage.getItem('cached_verse')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (readings?.gospel_text && readings?.gospel_ref) {
      const verse = {
        text: readings.gospel_text.split(' ').slice(0, 20).join(' ') + '...',
        ref: readings.gospel_ref
      }
      setCachedVerse(verse)
      localStorage.setItem('cached_verse', JSON.stringify(verse))
    }
  }, [readings])

  const season = readings?.liturgical_season || 'Ordinary Time'
  const verseToShow = readings?.gospel_text
    ? {
        text: readings.gospel_text.split(' ').slice(0, 20).join(' ') + '...',
        ref: readings.gospel_ref
      }
    : cachedVerse

  return (
    <div className="home-header">
      <p className="home-header-season">{season}</p>
      <h1 className="home-header-date">{dateString}</h1>
      {verseToShow && (
        <div className="home-header-verse">
          <p className="verse-text">"{verseToShow.text}"</p>
          <p className="verse-ref">{verseToShow.ref}</p>
        </div>
      )}
    </div>
  )
}

export default HomeHeader