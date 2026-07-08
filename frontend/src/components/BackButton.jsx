import { useNavigate } from 'react-router-dom'

function BackButton({ to = '/home', onClick }) {
  const navigate = useNavigate()

  function handleClick() {
    if (onClick) {
      onClick()
    } else {
      navigate(to)
    }
  }

  return (
    <button className="back-button" onClick={handleClick}>
      ← Back
    </button>
  )
}

export default BackButton