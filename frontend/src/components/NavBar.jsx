import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useRef, useState } from 'react'

const ICONS = {
  Home: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  ),
  Readings: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6s1.5-2 5-2 5 2 5 2v14s-1.5-1-5-1-5 1-5 1V6z"/>
      <path d="M12 6s1.5-2 5-2 5 2 5 2v14s-1.5-1-5-1-5 1-5 1V6z"/>
    </svg>
  ),
  Bible: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22"/>
      <line x1="6" y1="8" x2="18" y2="8"/>
    </svg>
  ),
  Examination: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  ),
  Logout: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
}

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
    { label: 'Bible',       path: '/bible'       },
    { label: 'Examination', path: '/examination' },
  ]

  const activeIndex = tabs.findIndex(tab => tab.path === location.pathname)

  useEffect(() => {
    const activeTab = tabRefs.current[activeIndex]
    if (activeTab) {
      const { offsetLeft, offsetWidth } = activeTab
      setIndicatorStyle({
        transform: `translateX(${offsetLeft + offsetWidth / 2 - 12}px)`,
      })
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
            <span className="nav-icon">{ICONS[tab.label]}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        )
      })}
      <button className="nav-item nav-item-logout" onClick={handleLogout}>
        <span className="nav-icon">{ICONS.Logout}</span>
        <span className="nav-label">Logout</span>
      </button>
    </nav>
  )
}

export default NavBar