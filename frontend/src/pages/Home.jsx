import NavBar from '../components/NavBar'
import HomeHeader from '../components/HomeHeader'
import FeatureCard from '../components/FeatureCard'

function Home() {
  return (
    <div className="page">
      <div className="page-content">
        <HomeHeader />
        <div className="card-list">
          <FeatureCard
            title="Today's Readings"
            subtitle="Tap to read today's Mass readings"
            path="/readings"
            accent="#8b6914"
          />
          <FeatureCard
            title="Saint of the Day"
            subtitle="Learn about today's saint"
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