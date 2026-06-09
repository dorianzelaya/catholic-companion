import { useNavigate, useLocation } from 'react-router-dom'

function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { label: 'Home',      path: '/home'      },
    { label: 'Readings',  path: '/readings'  },
    { label: 'Rosary',    path: '/rosary'    },
    { label: 'Examine',   path: '/examine'   },
  ]

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
    </nav>
  )
}

export default NavBar