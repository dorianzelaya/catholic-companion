import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BackButton from '../components/BackButton'
import { authFetch } from '../api'
import BIBLE_BOOKS, { getBookBySlug } from '../data/bible'
import PERICOPES from '../data/pericopes'
import DAILY_VERSES from '../data/daily_verses'

function getReadChapters() {
  try {
    return JSON.parse(localStorage.getItem('bible_read_chapters') || '{}')
  } catch {
    return {}
  }
}

function toggleChapterRead(bookSlug, chapterNum) {
  const read = getReadChapters()
  if (!read[bookSlug]) read[bookSlug] = []
  if (read[bookSlug].includes(chapterNum)) {
    read[bookSlug] = read[bookSlug].filter(c => c !== chapterNum)
  } else {
    read[bookSlug].push(chapterNum)
  }
  localStorage.setItem('bible_read_chapters', JSON.stringify(read))
  return read
}

function getLastRead() {
  try {
    return JSON.parse(localStorage.getItem('bible_last_read') || 'null')
  } catch {
    return null
  }
}

function setLastRead(bookSlug, bookName, chapterNum) {
  localStorage.setItem('bible_last_read', JSON.stringify({
    bookSlug, bookName, chapter: chapterNum,
  }))
}

function getRandomVerse() {
  const months = Object.keys(DAILY_VERSES)
  const month = months[Math.floor(Math.random() * months.length)]
  const verses = DAILY_VERSES[month]
  return verses[Math.floor(Math.random() * verses.length)]
}

// Saved verses: same shape/pattern as saved_prayers so Profile.jsx can
// treat them consistently — a flat array in localStorage, unique by a
// composite id (book+chapter+verse), no backend.
function getSavedVerses() {
  try {
    return JSON.parse(localStorage.getItem('saved_verses') || '[]')
  } catch {
    return []
  }
}

function verseId(bookSlug, chapter, verseNum) {
  return `${bookSlug}-${chapter}-${verseNum}`
}

function isVerseSaved(savedVerses, bookSlug, chapter, verseNum) {
  return savedVerses.some(v => v.id === verseId(bookSlug, chapter, verseNum))
}

function toggleSavedVerse(savedVerses, entry) {
  const id = verseId(entry.bookSlug, entry.chapter, entry.verse)
  const exists = savedVerses.some(v => v.id === id)
  const updated = exists
    ? savedVerses.filter(v => v.id !== id)
    : [...savedVerses, { id, ...entry }]
  localStorage.setItem('saved_verses', JSON.stringify(updated))
  return updated
}

function Bible() {
  const [testament, setTestament] = useState(() => {
    return localStorage.getItem('bible_testament') || null
  })
  const [book, setBook] = useState(() => {
    const slug = localStorage.getItem('bible_book')
    return slug ? getBookBySlug(slug) : null
  })
  const [chapter, setChapter] = useState(() => {
    const ch = localStorage.getItem('bible_chapter')
    return ch ? parseInt(ch) : null
  })
  const [verses, setVerses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [chapterCache, setChapterCache] = useState({})
  const [direction, setDirection] = useState(0)
  const [readChapters, setReadChapters] = useState(getReadChapters)
  const [sortAlpha, setSortAlpha] = useState(false)
  const [dailyVerse] = useState(getRandomVerse)
  const [lastRead, setLastReadState] = useState(getLastRead)
  const [savedVerses, setSavedVerses] = useState(getSavedVerses)
  const [selectedVerse, setSelectedVerse] = useState(null)
  const dragStartX = useRef(null)
  const dragStartY = useRef(null)

  useEffect(() => {
    const img = new Image()
    img.src = '/parchment.png'
  }, [])

  useEffect(() => {
    if (book && chapter) {
      loadChapter(book.slug, chapter)
    }
  }, [])

  useEffect(() => {
    if (testament) localStorage.setItem('bible_testament', testament)
    else localStorage.removeItem('bible_testament')
  }, [testament])

  useEffect(() => {
    if (book) localStorage.setItem('bible_book', book.slug)
    else localStorage.removeItem('bible_book')
  }, [book])

  useEffect(() => {
    if (chapter) localStorage.setItem('bible_chapter', chapter.toString())
    else localStorage.removeItem('bible_chapter')
  }, [chapter])

  useEffect(() => {
    const el = document.querySelector('.page-content')
    if (el) el.scrollTop = 0
  }, [testament, book, chapter])

  // Deselect any highlighted verse whenever the chapter changes
  useEffect(() => {
    setSelectedVerse(null)
  }, [book, chapter])

  useEffect(() => {
    if (!book || !chapter) return

    if (chapter < book.chapters) {
      const nextKey = `${book.slug}-${chapter + 1}`
      if (!chapterCache[nextKey]) {
        authFetch(`/bible/chapter/${book.slug}/${chapter + 1}`)
          .then(r => r.json())
          .then(data => setChapterCache(prev => ({ ...prev, [nextKey]: data.verses })))
          .catch(() => {})
      }
    }

    if (chapter > 1) {
      const prevKey = `${book.slug}-${chapter - 1}`
      if (!chapterCache[prevKey]) {
        authFetch(`/bible/chapter/${book.slug}/${chapter - 1}`)
          .then(r => r.json())
          .then(data => setChapterCache(prev => ({ ...prev, [prevKey]: data.verses })))
          .catch(() => {})
      }
    }
  }, [book, chapter])

  async function loadChapter(bookSlug, chapterNum) {
    const cacheKey = `${bookSlug}-${chapterNum}`
    if (chapterCache[cacheKey]) {
      setVerses(chapterCache[cacheKey])
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await authFetch(`/bible/chapter/${bookSlug}/${chapterNum}`)
      if (!response.ok) throw new Error('Could not load chapter')
      const data = await response.json()
      setVerses(data.verses)
      setChapterCache(prev => ({ ...prev, [cacheKey]: data.verses }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function goToChapter(num, dir) {
    setDirection(dir)
    setChapter(num)
    loadChapter(book.slug, num)
  }

  function handleToggleRead() {
    const updated = toggleChapterRead(book.slug, chapter)
    setReadChapters({ ...updated })
  }

  function handleVerseTap(verseNum) {
    setSelectedVerse(prev => (prev === verseNum ? null : verseNum))
  }

  function handleSaveVerse() {
    if (selectedVerse == null || !book) return
    const v = verses.find(v => v.verse === selectedVerse)
    if (!v) return
    const updated = toggleSavedVerse(savedVerses, {
      bookSlug: book.slug,
      bookName: book.name,
      chapter,
      verse: v.verse,
      text: v.text,
    })
    setSavedVerses(updated)
    setSelectedVerse(null)
  }

  function handleTouchStart(e) {
    dragStartX.current = e.touches[0].clientX
    dragStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e) {
    if (dragStartX.current === null) return
    const dx = e.changedTouches[0].clientX - dragStartX.current
    const dy = e.changedTouches[0].clientY - dragStartY.current
    dragStartX.current = null
    dragStartY.current = null
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    if (dx < 0 && chapter < book.chapters) goToChapter(chapter + 1, 1)
    else if (dx > 0 && chapter > 1) goToChapter(chapter - 1, -1)
  }

  useEffect(() => {
    if (book && chapter) {
      setLastRead(book.slug, book.name, chapter)
      setLastReadState({ bookSlug: book.slug, bookName: book.name, chapter })
    }
  }, [book, chapter])

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
  }

  // Chapter reading view
  if (chapter !== null && book !== null) {
    const alreadyRead = readChapters[book.slug]?.includes(chapter)
    const selectedIsSaved = selectedVerse != null &&
      isVerseSaved(savedVerses, book.slug, chapter, selectedVerse)

    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={() => { setChapter(null); setVerses([]) }} />
          <p className="readings-eyebrow">{book.name}</p>
          <div className="bible-chapter-title-row">
            <h1 className="bible-chapter-title">Chapter {chapter}</h1>
            <button
              className={`bible-read-toggle ${alreadyRead ? 'read' : ''}`}
              onClick={handleToggleRead}
              aria-label={alreadyRead ? 'Mark chapter as unread' : 'Mark chapter as read'}
              title={alreadyRead ? 'Read' : 'Mark as read'}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
                   stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                {alreadyRead && <polyline points="8.5 12.2 11 14.7 15.7 9.7" />}
              </svg>
            </button>
          </div>
        </div>
        <div className="page-content">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={chapter}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {loading && <p className="readings-loading">Loading...</p>}
              {error && <p className="auth-error">{error}</p>}
              {!loading && verses.length > 0 && (
                <div className="bible-verses">
                  {verses.map(v => {
                    const heading = PERICOPES[book.slug]?.[chapter]?.[v.verse]
                    const saved = isVerseSaved(savedVerses, book.slug, chapter, v.verse)
                    const isSelected = selectedVerse === v.verse
                    return (
                      <div key={v.verse}>
                        {heading && <p className="bible-section-heading">{heading}</p>}
                        <div
                          className={`bible-verse ${isSelected ? 'selected' : ''} ${saved ? 'saved' : ''}`}
                          onClick={() => handleVerseTap(v.verse)}
                        >
                          <span className="bible-verse-num">{v.verse}</span>
                          <span className="bible-verse-text">{v.text}</span>
                          {saved && <span className="bible-verse-saved-mark">★</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {!loading && !error && verses.length > 0 && (
                <div className="bible-nav-row">
                  {chapter > 1 && (
                    <button className="bible-nav-btn" onClick={() => goToChapter(chapter - 1, -1)}>
                      ← Chapter {chapter - 1}
                    </button>
                  )}
                  {chapter < book.chapters && (
                    <button className="bible-nav-btn" onClick={() => goToChapter(chapter + 1, 1)}>
                      Chapter {chapter + 1} →
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {selectedVerse != null && (
          <div className="bible-save-verse-bar">
            <span className="bible-save-verse-ref">{book.name} {chapter}:{selectedVerse}</span>
            <button className="bible-save-verse-btn" onClick={handleSaveVerse}>
              {selectedIsSaved ? 'Remove Verse' : 'Save Verse'}
            </button>
          </div>
        )}
      </div>
    )
  }

  // Chapter selection view
  if (book !== null) {
    const chapterNums = Array.from({ length: book.chapters }, (_, i) => i + 1)
    const bookRead = readChapters[book.slug] || []
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={() => setBook(null)} />
          <p className="readings-eyebrow">{testament === 'OT' ? 'Old Testament' : 'New Testament'}</p>
          <h1 className="bible-book-title">{book.name}</h1>
          {bookRead.length > 0 && (
            <p className="bible-book-progress">{bookRead.length} of {book.chapters} chapters read</p>
          )}
        </div>
        <div className="page-content">
          <div className="bible-chapter-grid">
            {chapterNums.map(num => (
              <button
                key={num}
                className={`bible-chapter-btn ${bookRead.includes(num) ? 'read' : ''}`}
                onClick={() => {
                  setDirection(1)
                  setChapter(num)
                  loadChapter(book.slug, num)
                }}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Book list view
  if (testament !== null) {
    const books = BIBLE_BOOKS[testament]
    const displayBooks = sortAlpha
      ? [...books].sort((a, b) => a.name.localeCompare(b.name))
      : books

    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={() => setTestament(null)} />
          <p className="readings-eyebrow">Douay-Rheims Bible</p>
          <div className="bible-list-header-row">
            <h1 className="bible-testament-title">
              {testament === 'OT' ? 'Old Testament' : 'New Testament'}
            </h1>
            <button
              className={`bible-sort-btn ${sortAlpha ? 'active' : ''}`}
              onClick={() => setSortAlpha(v => !v)}
            >
              {sortAlpha ? 'A–Z' : 'Traditional'}
            </button>
          </div>
        </div>
        <div className="page-content">
          <div className="bible-book-list">
            {displayBooks.map(b => {
              const bookRead = readChapters[b.slug] || []
              return (
                <button key={b.slug} className="bible-book-btn" onClick={() => setBook(b)}>
                  <span className="bible-book-name">{b.name}</span>
                  <span className="bible-book-chapters">
                    {bookRead.length > 0 ? `${bookRead.length}/${b.chapters}` : `${b.chapters} ch`}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Home view
  const totalChaptersRead = Object.values(readChapters).reduce((sum, chs) => sum + chs.length, 0)
  const booksStarted = Object.values(readChapters).filter(chs => chs.length > 0).length

  return (
    <div className="page">
      <div className="page-header">
        <BackButton />
        <p className="readings-eyebrow">Douay-Rheims Bible</p>
        <h1 className="bible-testament-title">The Holy Bible</h1>
      </div>
      <div className="page-content">

        {dailyVerse && (
          <div className="bible-verse-card">
            <p className="bible-verse-card-text">"{dailyVerse.text}"</p>
            <p className="bible-verse-card-ref">{dailyVerse.ref}</p>
          </div>
        )}

        <div className="bible-testament-btns">
          <button className="bible-testament-btn" onClick={() => setTestament('OT')}>
            <svg className="bible-testament-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <p className="bible-testament-btn-title">Old Testament</p>
            <p className="bible-testament-btn-sub">46 books</p>
          </button>
          <button className="bible-testament-btn" onClick={() => setTestament('NT')}>
            <svg className="bible-testament-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="2" x2="12" y2="22"/>
              <line x1="6" y1="8" x2="18" y2="8"/>
            </svg>
            <p className="bible-testament-btn-title">New Testament</p>
            <p className="bible-testament-btn-sub">27 books</p>
          </button>
        </div>

        {lastRead && (
          <button
            className="bible-continue-card"
            onClick={() => {
              const b = getBookBySlug(lastRead.bookSlug)
              if (!b) return
              setTestament(BIBLE_BOOKS.OT.some(x => x.slug === b.slug) ? 'OT' : 'NT')
              setBook(b)
              setChapter(lastRead.chapter)
              loadChapter(b.slug, lastRead.chapter)
            }}
          >
            <div className="bible-continue-text">
              <p className="bible-continue-label">Continue Reading</p>
              <p className="bible-continue-value">{lastRead.bookName}, chapter {lastRead.chapter}</p>
            </div>
            <span className="bible-continue-arrow">→</span>
          </button>
        )}

        {totalChaptersRead > 0 && (
          <div className="bible-stats-row">
            <div className="bible-stat-card">
              <p className="bible-stat-value">{totalChaptersRead}</p>
              <p className="bible-stat-label">Chapters Read</p>
            </div>
            <div className="bible-stat-card">
              <p className="bible-stat-value">{booksStarted}</p>
              <p className="bible-stat-label">Books Started</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Bible
