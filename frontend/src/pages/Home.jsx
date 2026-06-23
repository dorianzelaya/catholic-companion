import { useState, useEffect } from 'react'
import NavBar from '../components/NavBar'
import HomeHeader from '../components/HomeHeader'
import FeatureCard from '../components/FeatureCard'

function Home() {
  const [readings, setReadings] = useState(null)

  useEffect(() => {
    async function loadReadings() {
      try {
        const response = await fetch('http://localhost:8000/readings/today')
        if (!response.ok) return
        const data = await response.json()
        setReadings(data)
      } catch (err) {
        // Silently fail — home screen still works without readings data
      }
    }

    loadReadings()
  }, [])

  return (
    <div className="page">
      <div className="page-content">
        <HomeHeader readings={readings} />
        <div className="card-list">
          <FeatureCard
            title="Today's Readings"
            subtitle={readings ? readings.first_reading_ref : "Loading..."}
            path="/readings"
            accent="#8b6914"
          />
          <FeatureCard
            title="Saint of the Day"
            subtitle={readings ? readings.saint_name : "Loading..."}
            path="/readings"
            accent="#6b5a4a"
          />
          <FeatureCard
            title="I'm struggling with..."
            subtitle="Find scripture for your moment"
            path="/examine"
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
            path="/examine"
            accent="#6b5a4a"
          />
        </div>
      </div>
      <NavBar />
    </div>
  )
}

export default Home