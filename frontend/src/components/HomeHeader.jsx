import { useEffect, useState } from 'react'
import { getDailyVerse } from '../data/daily_verses'

function HomeHeader({ readings }) {
  const today = new Date()
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

  const todayKey = `${today.getMonth() + 1}-${today.getDate()}`
  const season = readings?.liturgical_season || 'Ordinary Time'
  const dailyVerse = getDailyVerse()

  const [verseToShow, setVerseToShow] = useState(() => {
    try {
      const saved = localStorage.getItem('cached_verse')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Only use cache if it's from today
        if (parsed.dateKey === todayKey) {
          return parsed.verse
        }
      }
    } catch {
      // ignore
    }
    return dailyVerse
  })

  useEffect(() => {
    if (dailyVerse) {
      setVerseToShow(dailyVerse)
      localStorage.setItem('cached_verse', JSON.stringify({
        dateKey: todayKey,
        verse: dailyVerse
      }))
    }
  }, [])

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