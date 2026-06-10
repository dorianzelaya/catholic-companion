function HomeHeader() {
  const today = new Date()
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="home-header">
      <p className="home-header-season">Ordinary Time</p>
      <h1 className="home-header-date">{dateString}</h1>
      <div className="home-header-verse">
        <p className="verse-text">"Be still and know that I am God."</p>
        <p className="verse-ref">Psalm 46:10</p>
      </div>
    </div>
  )
}

export default HomeHeader