import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BackButton from '../components/BackButton'
import { authFetch } from '../api'
import BIBLE_BOOKS, { getBookBySlug } from '../data/bible'
import PERICOPES from '../data/pericopes'

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

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
  }

  // Chapter reading view
  if (chapter !== null && book !== null) {
    const alreadyRead = readChapters[book.slug]?.includes(chapter)
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
                    return (
                      <div key={v.verse}>
                        {heading && <p className="bible-section-heading">{heading}</p>}
                        <div className="bible-verse">
                          <span className="bible-verse-num">{v.verse}</span>
                          <span className="bible-verse-text">{v.text}</span>
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
  return (
    <div className="page">
      <div className="page-header">
        <BackButton />
        <p className="readings-eyebrow">Douay-Rheims Bible</p>
        <h1 className="bible-testament-title">The Holy Bible</h1>
      </div>
      <div className="page-content">
        <div className="bible-testament-btns">
          <button className="bible-testament-btn" onClick={() => setTestament('OT')}>
            <p className="bible-testament-btn-title">Old Testament</p>
            <p className="bible-testament-btn-sub">46 books</p>
          </button>
          <button className="bible-testament-btn" onClick={() => setTestament('NT')}>
            <p className="bible-testament-btn-title">New Testament</p>
            <p className="bible-testament-btn-sub">27 books</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Bible
