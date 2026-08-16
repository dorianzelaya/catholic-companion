import { useState, useEffect } from 'react'
import HomeHeader from '../components/HomeHeader'
import FeatureCard from '../components/FeatureCard'
import API_URL from '../config'
import { getLocalDateKey } from '../utils/dateKey'
function Home() {
  const [readings, setReadings] = useState(() => {
    try {
      const saved = localStorage.getItem('cached_home_data')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  useEffect(() => {
    async function loadReadings() {
      try {
        // Send the device's own local date so the backend serves the day
        // the user is actually living, not US Eastern. Same helper feeds
        // the Saint page and its cache key, so they can't disagree.
        const today = getLocalDateKey()
        const response = await fetch(`${API_URL}/readings/today?date=${today}`)
        if (!response.ok) return
        const data = await response.json()
        setReadings(data)
        localStorage.setItem('cached_home_data', JSON.stringify(data))
      } catch (err) {
        // Silently fail — home screen still works without readings data
      }
    }
    loadReadings()
  }, [])
  return (
    <div className="page">
      <HomeHeader readings={readings} />
      <div className="page-content">
        <div className="card-list">
          {/*
            Today's Readings stays on top — it's the one card that shows
            live daily content (the day's citation), so it earns the spot
            even though the nav bar also links to it.

            Then the features you can ONLY reach from here — Saint, Seek,
            Prayers, Examination aren't in the bottom nav, so the home page
            is their only entry point.

            Bible and Rosary sit at the bottom: the nav bar already links
            to both, and neither shows daily content, so they're kept as
            cards but drop below.
          */}
          <FeatureCard
            title="Today's Readings"
            subtitle={readings ? readings.first_reading_ref : ""}
            path="/readings"
            accent="#e8b45c"
          />

          <FeatureCard
            title="Saint of the Day"
            subtitle="Meet today's saint"
            path="/saint"
            accent="#e8b45c"
          />
          <FeatureCard
            title="Seek"
            subtitle="Scripture for every season"
            path="/struggle"
            accent="#e8b45c"
          />
          <FeatureCard
            title="Prayers"
            subtitle="Traditional Catholic prayers"
            path="/prayers"
            accent="#e8b45c"
          />
          <FeatureCard
            title="Examination of Conscience"
            subtitle="Prepare for confession"
            path="/examination"
            accent="#e8b45c"
          />

          <FeatureCard
            title="Bible"
            subtitle="Douay-Rheims Catholic Bible"
            path="/bible"
            accent="#e8b45c"
          />
          <FeatureCard
            title="Rosary"
            subtitle="Pray a mystery"
            path="/rosary"
            accent="#e8b45c"
          />
        </div>
      </div>
    </div>
  )
}
export default Home
