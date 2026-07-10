import DAILY_VERSES, { getDailyVerse } from '../data/daily_verses'

function HomeHeader({ readings }) {
  const today = new Date()
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

  const season = readings?.liturgical_season || 'Ordinary Time'
  const month = today.getMonth() + 1
  const day = today.getDate()
  const monthVerses = DAILY_VERSES[month]
  const dailyVerse = monthVerses ? monthVerses[day - 1] : null

  return (
    <div className="home-header">
      <p className="home-header-season">{season}</p>
      <h1 className="home-header-date">{dateString}</h1>
      {dailyVerse && (
        <div className="home-header-verse">
          <p className="verse-text">"{dailyVerse.text}"</p>
          <p className="verse-ref">{dailyVerse.ref}</p>
        </div>
      )}
    </div>
  )
}

export default HomeHeader