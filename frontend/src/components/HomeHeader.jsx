function HomeHeader({ readings }) {
  const today = new Date()
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

  const season = readings?.liturgical_season || 'Ordinary Time'
  const verseText = readings?.gospel_text
    ? readings.gospel_text.split(' ').slice(0, 20).join(' ') + '...'
    : null
  const verseRef = readings?.gospel_ref || null

  return (
    <div className="home-header">
      <p className="home-header-season">{season}</p>
      <h1 className="home-header-date">{dateString}</h1>
      {verseText && verseRef && (
        <div className="home-header-verse">
          <p className="verse-text">"{verseText}"</p>
          <p className="verse-ref">{verseRef}</p>
        </div>
      )}
    </div>
  )
}

export default HomeHeader