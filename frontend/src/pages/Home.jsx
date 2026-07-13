import { useState, useEffect } from 'react'
import HomeHeader from '../components/HomeHeader'
import FeatureCard from '../components/FeatureCard'
import API_URL from '../config'

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
        const response = await fetch(`${API_URL}/readings/today`)
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
          <FeatureCard
            title="Today's Readings"
            subtitle={readings ? readings.first_reading_ref : ""}
            path="/readings"
            accent="#8b6914"
          />
          <FeatureCard
            title="Saint of the Day"
            subtitle={readings ? readings.saint_name : ""}
            path="/saint"
            accent="#6b5a4a"
          />
          <FeatureCard
            title="Consolation"
            subtitle="Strength for today"
            path="/struggle"
            accent="#4a3728"
          />
          <FeatureCard
            title="Rosary"
            subtitle="Pray a mystery"
            path="/rosary"
            accent="#8b6914"
          />
          <FeatureCard
            title="Examination of Conscience"
            subtitle="Prepare for confession"
            path="/examination"
            accent="#6b5a4a"
          />

          <FeatureCard
            title="Prayers"
            subtitle="Traditional Catholic prayers"
            path="/prayers"
            accent="#8b6914"
          />
        </div>
      </div>
    </div>
  )
}

export default Home