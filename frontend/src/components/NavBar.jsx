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
      {tabs.map(tab => (
        <button
          key={tab.path}
          className={`nav-item ${location.pathname === tab.path ? 'active' : ''}`}
          onClick={() => navigate(tab.path)}
        >
          {tab.label}
        </button>
      ))}
      <button className="nav-item nav-item-logout" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  )
}

export default NavBar