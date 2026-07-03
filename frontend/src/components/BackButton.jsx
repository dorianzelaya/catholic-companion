import { useNavigate } from 'react-router-dom'

function BackButton({ to = '/home' }) {
  const navigate = useNavigate()

  return (
    <button className="back-button" onClick={() => navigate(to)}>
      ← Back
    </button>
  )
}

export default BackButton