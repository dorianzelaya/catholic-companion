import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

const ICONS = {
  Home: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  ),
  Readings: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6s1.5-2 5-2 5 2 5 2v14s-1.5-1-5-1-5 1-5 1V6z"/>
      <path d="M12 6s1.5-2 5-2 5 2 5 2v14s-1.5-1-5-1-5 1-5 1V6z"/>
    </svg>
  ),
  Bible: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22"/>
      <line x1="6" y1="8" x2="18" y2="8"/>
    </svg>
  ),
  Rosary: (
    <svg width="21" height="21" viewBox="18 6 54 80" fill="currentColor" stroke="none">
      <circle cx="45" cy="14" r="4.5"/>
      <circle cx="60" cy="20" r="4.5"/>
      <circle cx="66" cy="35" r="4.5"/>
      <circle cx="60" cy="50" r="4.5"/>
      <circle cx="45" cy="56" r="4.5"/>
      <circle cx="30" cy="50" r="4.5"/>
      <circle cx="24" cy="35" r="4.5"/>
      <circle cx="30" cy="20" r="4.5"/>
      <rect x="42.8" y="62" width="4.4" height="21" rx="2.2"/>
      <rect x="36" y="68.3" width="18" height="4.4" rx="2.2"/>
    </svg>
  ),
  Profile: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
}

function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [indicatorStyle, setIndicatorStyle] = useState({ opacity: 0 })
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
        transform: `translateX(${offsetLeft}px)`,
        width: `${offsetWidth}px`,
        opacity: 1,
      })
      requestAnimationFrame(() => setReady(true))
    } else {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }))
    }
  }, [activeIndex])

  function handleTabClick(tab) {
    if (tab.path === '/bible' && location.pathname === '/bible') {
      // Already on Bible — clear saved position so the component remounts
      // at the testament selection screen rather than the last-read level.
      localStorage.removeItem('bible_testament')
      localStorage.removeItem('bible_book')
      localStorage.removeItem('bible_chapter')
      // Pass a new key so App.jsx forces a full remount of Bible.jsx,
      // re-running its useState initialisers against the cleared storage.
      navigate('/bible', { state: { bibleKey: Date.now() } })
    } else {
      navigate(tab.path)
    }
  }

  return (
    <nav className="navbar">
      <div
        className={`nav-indicator ${ready ? 'animate' : ''}`}
        style={indicatorStyle}
      />
      <div className="nav-sheen" />
      {tabs.map((tab, i) => {
        const isActive = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            ref={el => tabRefs.current[i] = el}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => handleTabClick(tab)}
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
