import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  const tabs = [
    { label: 'Home',        path: '/home'        },
    { label: 'Readings',    path: '/readings'    },
    { label: 'Rosary',      path: '/rosary'      },
    { label: 'Examination', path: '/examination' },
  ]

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            {isActive && <span className="nav-indicator" />}
            <span className="nav-label">{tab.label}</span>
          </button>
        )
      })}
      <button className="nav-item nav-item-logout" onClick={handleLogout}>
        <span className="nav-label">Logout</span>
      </button>
    </nav>
  )
}

export default NavBar