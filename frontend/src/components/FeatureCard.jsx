import { useNavigate } from 'react-router-dom'

function FeatureCard({ title, subtitle, path, accent }) {
  const navigate = useNavigate()

  return (
    <div
      className="feature-card"
      style={{ borderLeftColor: accent }}
      onClick={() => navigate(path)}
    >
      <div>
        <p className="feature-card-title">{title}</p>
        <p className="feature-card-subtitle">{subtitle}</p>
      </div>
      <span className="feature-card-arrow">›</span>
    </div>
  )
}

export default FeatureCard