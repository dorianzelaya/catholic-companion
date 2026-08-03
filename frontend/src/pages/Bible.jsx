import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BackButton from '../components/BackButton'
import { authFetch } from '../api'
import BIBLE_BOOKS, { getBookBySlug } from '../data/bible'
import PERICOPES from '../data/pericopes'

// Items enter in sequence rather than all at once.
const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.035, delayChildren: 0.02 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
}

// Chapter grids can run to 150 items (Psalms). Staggering every one
// would take 5+ seconds, so cap the delay and let the rest come in together.
const chapterItemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.24,
      delay: Math.min(i * 0.012, 0.5),
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

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
          <h1 className="bible-chapter-title">Chapter {chapter}</h1>
        </div>
        <div className="page-content" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
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
                <>
                  <div className="bible-mark-read-row">
                    <button
                      className={`bible-mark-read-btn ${alreadyRead ? 'read' : ''}`}
                      onClick={handleToggleRead}
                    >
                      {alreadyRead ? '✓ Read — tap to unmark' : 'Mark as Read'}
                    </button>
                  </div>
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
                </>
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
            {chapterNums.map((num, i) => (
              <motion.button
                key={num}
                custom={i}
                variants={chapterItemVariants}
                initial="hidden"
                animate="show"
                className={`bible-chapter-btn ${bookRead.includes(num) ? 'read' : ''}`}
                onClick={() => {
                  setDirection(1)
                  setChapter(num)
                  loadChapter(book.slug, num)
                }}
              >
                {num}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Book list view
  if (testament !== null) {
    const books = BIBLE_BOOKS[testament]
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={() => setTestament(null)} />
          <p className="readings-eyebrow">Douay-Rheims Bible</p>
          <h1 className="bible-testament-title">{testament === 'OT' ? 'Old Testament' : 'New Testament'}</h1>
        </div>
        <div className="page-content">
          <motion.div
            className="bible-book-list"
            key={testament}
            variants={listVariants}
            initial="hidden"
            animate="show"
          >
            {books.map(b => {
              const bookRead = readChapters[b.slug] || []
              return (
                <motion.button key={b.slug} variants={itemVariants} className="bible-book-btn" onClick={() => setBook(b)}>
                  <span className="bible-book-name">{b.name}</span>
                  <span className="bible-book-chapters">
                    {bookRead.length > 0 ? `${bookRead.length}/${b.chapters}` : `${b.chapters} ch`}
                  </span>
                </motion.button>
              )
            })}
          </motion.div>
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
        <motion.div
          className="bible-testament-btns"
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          <motion.button variants={itemVariants} className="bible-testament-btn" onClick={() => setTestament('OT')}>
            <p className="bible-testament-btn-title">Old Testament</p>
            <p className="bible-testament-btn-sub">46 books</p>
          </motion.button>
          <motion.button variants={itemVariants} className="bible-testament-btn" onClick={() => setTestament('NT')}>
            <p className="bible-testament-btn-title">New Testament</p>
            <p className="bible-testament-btn-sub">27 books</p>
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

export default Bible
