import { useEffect, useState } from 'react'
import { getDailyVerse } from '../data/daily_verses'

function HomeHeader({ readings }) {
  const today = new Date()
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

  const season = readings?.liturgical_season || 'Ordinary Time'
  const dailyVerse = getDailyVerse()

  const [cachedVerse, setCachedVerse] = useState(() => {
    try {
      const saved = localStorage.getItem('cached_verse')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (dailyVerse) {
      setCachedVerse(dailyVerse)
      localStorage.setItem('cached_verse', JSON.stringify(dailyVerse))
    }
  }, [])

  const verseToShow = dailyVerse || cachedVerse

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