import { useNavigate, useLocation } from 'react-router-dom'
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
  Rosary: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4c-1.7 2.5-3 5.2-3 8.2v3.9c0 1.3.8 2.2 2 2.2h1"/>
      <path d="M12 4c1.7 2.5 3 5.2 3 8.2v3.9c0 1.3-.8 2.2-2 2.2h-1"/>
      <path d="M12 5v13"/>
      <path d="M9 13.2c-2.2 1-3.6 2.7-3.6 4.6"/>
      <circle cx="7.4" cy="14.6" r=".7" fill="currentColor" stroke="none"/>
      <circle cx="5.9" cy="16.4" r=".7" fill="currentColor" stroke="none"/>
      <path d="M5.4 19.2v2.4M4.4 20.2h2"/>
    </svg>
  ),
  Profile: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
}

function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [indicatorStyle, setIndicatorStyle] = useState({})
  const [ready, setReady] = useState(false)
  const tabRefs = useRef([])

  const tabs = [
    { label: 'Home',     path: '/home'     },
    { label: 'Readings', path: '/readings' },
    { label: 'Bible',    path: '/bible'    },
    { label: 'Rosary',   path: '/rosary'   },
    { label: 'Profile',  path: '/profile'  },
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
    </nav>
  )
}

export default NavBar