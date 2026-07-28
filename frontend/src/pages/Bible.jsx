import { useState, useEffect } from 'react'
import BackButton from '../components/BackButton'
import API_URL from '../config'
import BIBLE_BOOKS from '../data/bible'

function Bible() {
  const [testament, setTestament] = useState(null)
  const [book, setBook] = useState(null)
  const [chapter, setChapter] = useState(null)
  const [verses, setVerses] = useState([])
  const [bookTitle, setBookTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const el = document.querySelector('.page-content')
    if (el) el.scrollTop = 0
  }, [testament, book, chapter])

  async function loadChapter(bookSlug, chapterNum) {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/bible/chapter/${bookSlug}/${chapterNum}`)
      if (!response.ok) throw new Error('Could not load chapter')
      const data = await response.json()
      setVerses(data.verses)
      setBookTitle(data.book_title)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Chapter reading view
  if (chapter !== null && book !== null) {
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={() => { setChapter(null) }} />
          <p className="readings-eyebrow">{book.name}</p>
          <h1 className="bible-chapter-title">Chapter {chapter}</h1>
        </div>
        <div className="page-content">
          {loading && <p className="readings-loading">Loading...</p>}
          {error && <p className="auth-error">{error}</p>}
          {!loading && verses.length > 0 && (
            <div className="bible-verses">
              {verses.map(v => (
                <div key={v.verse} className="bible-verse">
                  <span className="bible-verse-num">{v.verse}</span>
                  <span className="bible-verse-text">{v.text}</span>
                </div>
              ))}
            </div>
          )}
          {!loading && !error && chapter > 1 && (
            <div className="bible-nav-row">
              <button
                className="bible-nav-btn"
                onClick={() => {
                  const prev = chapter - 1
                  setChapter(prev)
                  loadChapter(book.slug, prev)
                }}
              >
                ← Chapter {chapter - 1}
              </button>
              {chapter < book.chapters && (
                <button
                  className="bible-nav-btn"
                  onClick={() => {
                    const next = chapter + 1
                    setChapter(next)
                    loadChapter(book.slug, next)
                  }}
                >
                  Chapter {chapter + 1} →
                </button>
              )}
            </div>
          )}
          {!loading && !error && chapter === 1 && chapter < book.chapters && (
            <div className="bible-nav-row">
              <button
                className="bible-nav-btn"
                onClick={() => {
                  const next = chapter + 1
                  setChapter(next)
                  loadChapter(book.slug, next)
                }}
              >
                Chapter {chapter + 1} →
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Chapter selection view
  if (book !== null) {
    const chapterNums = Array.from({ length: book.chapters }, (_, i) => i + 1)
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={() => setBook(null)} />
          <p className="readings-eyebrow">{testament === 'OT' ? 'Old Testament' : 'New Testament'}</p>
          <h1 className="bible-book-title">{book.name}</h1>
        </div>
        <div className="page-content">
          <div className="bible-chapter-grid">
            {chapterNums.map(num => (
              <button
                key={num}
                className="bible-chapter-btn"
                onClick={() => {
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
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={() => setTestament(null)} />
          <p className="readings-eyebrow">Douay-Rheims Bible</p>
          <h1 className="bible-testament-title">{testament === 'OT' ? 'Old Testament' : 'New Testament'}</h1>
        </div>
        <div className="page-content">
          <div className="bible-book-list">
            {books.map(b => (
              <button
                key={b.slug}
                className="bible-book-btn"
                onClick={() => setBook(b)}
              >
                <span className="bible-book-name">{b.name}</span>
                <span className="bible-book-chapters">{b.chapters} ch</span>
              </button>
            ))}
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
          <button
            className="bible-testament-btn"
            onClick={() => setTestament('OT')}
          >
            <p className="bible-testament-btn-title">Old Testament</p>
            <p className="bible-testament-btn-sub">46 books</p>
          </button>
          <button
            className="bible-testament-btn"
            onClick={() => setTestament('NT')}
          >
            <p className="bible-testament-btn-title">New Testament</p>
            <p className="bible-testament-btn-sub">27 books</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Bible
