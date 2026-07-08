import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useRef, useState } from 'react'

function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const [indicatorStyle, setIndicatorStyle] = useState({})
  const [ready, setReady] = useState(false)
  const tabRefs = useRef([])

  const tabs = [
    { label: 'Home',        path: '/home'        },
    { label: 'Readings',    path: '/readings'    },
    { label: 'Rosary',      path: '/rosary'      },
    { label: 'Examination', path: '/examination' },
  ]

  const activeIndex = tabs.findIndex(tab => tab.path === location.pathname)

  useEffect(() => {
    const activeTab = tabRefs.current[activeIndex]
    if (activeTab) {
      const { offsetLeft, offsetWidth } = activeTab
      const x = offsetLeft + offsetWidth / 2 - 12
      setIndicatorStyle({ transform: `translateX(${x}px)` })
      setReady(true)
    }
  }, [activeIndex])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="nav-indicator-track">
        <div
          className="nav-indicator-pill"
          style={{
            ...indicatorStyle,
            transition: ready ? 'transform 0.25s ease' : 'none',
          }}
        />
      </div>
      {tabs.map((tab, i) => {
        const isActive = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            ref={el => tabRefs.current[i] = el}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
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