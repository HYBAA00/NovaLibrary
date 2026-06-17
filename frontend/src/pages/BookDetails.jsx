import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Heart, ListPlus, Star } from 'lucide-react'
import api from '../services/api'
import AppHeader from '../components/AppHeader'
import { AuthContext } from '../context/AuthContext'
import { assetUrl, formatDate, statusLabel } from '../utils/format'

export default function BookDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = React.useContext(AuthContext)
  const readerRef = React.useRef(null)

  const [book, setBook] = React.useState(null)
  const [reviews, setReviews] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [favorite, setFavorite] = React.useState(false)
  const [readingStatus, setReadingStatus] = React.useState(null)
  const [rating, setRating] = React.useState(0)
  const [comment, setComment] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [listsOpen, setListsOpen] = React.useState(false)
  const [lists, setLists] = React.useState([])
  const [newList, setNewList] = React.useState('')
  const [feedback, setFeedback] = React.useState('')

  React.useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const requests = [api.get(`/books/${id}`), api.get(`/reviews/${id}`)]
      if (user) {
        requests.push(api.get(`/favorites/${id}/check`).catch(() => ({ data: {} })))
        requests.push(api.get(`/reading-status/${id}/check`).catch(() => ({ data: {} })))
      }
      const [bookRes, reviewsRes, favoriteRes, statusRes] = await Promise.all(requests)
      setBook(bookRes.data)
      setReviews(reviewsRes.data || [])
      setFavorite(!!favoriteRes?.data?.isFavorite)
      setReadingStatus(statusRes?.data?.status || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Livre introuvable')
    } finally {
      setLoading(false)
    }
  }

  async function setStatus(status) {
    if (!user) return navigate('/login')
    await api.post('/reading-status', { book_id: Number(id), status })
    setReadingStatus(status)
    if (status === 'reading') readerRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function toggleFavorite() {
    if (!user) return navigate('/login')
    if (favorite) {
      await api.delete(`/favorites/${id}`)
      setFavorite(false)
    } else {
      await api.post('/favorites', { book_id: Number(id) })
      setFavorite(true)
    }
  }

  async function submitReview(e) {
    e.preventDefault()
    if (!user) return navigate('/login')
    if (rating < 1) return
    setSubmitting(true)
    try {
      await api.post('/reviews', { book_id: Number(id), rating, comment })
      setRating(0)
      setComment('')
      const res = await api.get(`/reviews/${id}`)
      setReviews(res.data || [])
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Avis impossible')
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteReview(reviewId) {
    if (!confirm('Supprimer cet avis ?')) return
    await api.delete(`/reviews/${reviewId}`)
    setReviews(reviews.filter(review => review.id !== reviewId))
  }

  async function openLists() {
    if (!user) return navigate('/login')
    const res = await api.get('/reading-lists')
    setLists(res.data || [])
    setListsOpen(true)
  }

  async function createList() {
    if (!newList.trim()) return
    const res = await api.post('/reading-lists', { name: newList.trim() })
    setLists(prev => [res.data, ...prev])
    setNewList('')
  }

  async function addToList(listId) {
    await api.post(`/reading-lists/${listId}/books`, { book_id: Number(id) })
    setFeedback('Livre ajoute a la liste.')
    setTimeout(() => setFeedback(''), 1200)
  }

  const userHasReviewed = user && reviews.some(review => String(review.user_id) === String(user.id))
  const pdfUrl = assetUrl(book?.file_url)
  const cover = assetUrl(book?.cover_url)

  return (
    <div className="page">
      <AppHeader />
      <main className="container section">
        {loading && <div className="empty-state">Chargement du livre...</div>}
        {error && <div className="alert">{error}</div>}

        {!loading && book && (
          <>
            <button className="button button-secondary" onClick={() => navigate(-1)} style={{ marginBottom: 18 }}>
              <ArrowLeft size={18} /> Retour
            </button>

            <section className="book-detail">
              <div className="detail-cover">
                {cover ? <img src={cover} alt={book.title} /> : <div className="book-cover"><BookOpen size={72} /></div>}
              </div>

              <div className="panel">
                <span className="tag">{book.category_name || 'General'}</span>
                <h1 style={{ margin: '14px 0 6px' }}>{book.title}</h1>
                <p className="muted" style={{ fontSize: 18, marginTop: 0 }}>{book.author_name || 'Auteur inconnu'}</p>
                <div className="actions-row" style={{ margin: '14px 0' }}>
                  <span className="rating"><Star size={16} fill="currentColor" /> {Number(book.average_rating || 0).toFixed(1)} ({book.review_count || 0} avis)</span>
                  <span className="status-pill">{statusLabel(readingStatus)}</span>
                  <span className="muted">Publie le {formatDate(book.published_date)}</span>
                </div>
                <p style={{ color: '#d8e1ea', whiteSpace: 'pre-wrap' }}>{book.description || 'Aucune description disponible.'}</p>

                <div className="actions-row" style={{ marginTop: 20 }}>
                  <button className="button button-primary" onClick={() => setStatus('reading')}>
                    <BookOpen size={18} /> Lire maintenant
                  </button>
                  <button className="button button-secondary" onClick={() => setStatus('want_to_read')}>A lire</button>
                  <button className="button button-secondary" onClick={() => setStatus('completed')}>Termine</button>
                  <button className="button button-secondary" onClick={toggleFavorite}>
                    <Heart size={18} fill={favorite ? 'currentColor' : 'none'} /> {favorite ? 'Favori' : 'Favoris'}
                  </button>
                  <button className="button button-secondary" onClick={openLists}>
                    <ListPlus size={18} /> Ajouter a une liste
                  </button>
                </div>
              </div>
            </section>

            <section className="section" ref={readerRef}>
              <div className="section-header">
                <h2>Lecteur PDF</h2>
              </div>
              {pdfUrl ? <iframe className="reader-frame" src={pdfUrl} title={`Lecture ${book.title}`} /> : <div className="empty-state">Aucun PDF disponible.</div>}
            </section>

            <section className="section">
              <div className="section-header">
                <h2>Avis des lecteurs</h2>
              </div>

              <div className="form-stack">
                {reviews.length === 0 && <div className="empty-state">Aucun avis pour le moment.</div>}
                {reviews.map(review => (
                  <article className="review-card" key={review.id}>
                    <div className="actions-row" style={{ justifyContent: 'space-between' }}>
                      <strong>{review.user_name || 'Lecteur'}</strong>
                      <span className="rating">{'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}</span>
                    </div>
                    <p className="muted">{formatDate(review.created_at)}</p>
                    <p>{review.comment || 'Sans commentaire.'}</p>
                    {user && (String(review.user_id) === String(user.id) || user.role === 'ADMIN') && (
                      <button className="button button-danger" onClick={() => deleteReview(review.id)}>Supprimer</button>
                    )}
                  </article>
                ))}
              </div>

              {user && !userHasReviewed && (
                <form className="panel form-stack" onSubmit={submitReview} style={{ marginTop: 18 }}>
                  <h3 style={{ margin: 0 }}>Laisser un avis</h3>
                  <div className="actions-row">
                    {[1, 2, 3, 4, 5].map(value => (
                      <button key={value} type="button" className="icon-button" onClick={() => setRating(value)} title={`${value} etoile`}>
                        <Star size={18} fill={value <= rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                  <textarea className="textarea" value={comment} onChange={e => setComment(e.target.value)} placeholder="Votre avis..." />
                  {feedback && <div className={feedback.includes('ajoute') ? 'success' : 'alert'}>{feedback}</div>}
                  <button className="button button-primary" disabled={submitting || rating < 1}>Publier</button>
                </form>
              )}
            </section>
          </>
        )}
      </main>

      {listsOpen && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setListsOpen(false)}>
          <div className="modal-card form-stack">
            <h2 style={{ margin: 0 }}>Ajouter a une liste</h2>
            <div className="form-row">
              <input className="input" value={newList} onChange={e => setNewList(e.target.value)} placeholder="Nouvelle liste" style={{ flex: 1 }} />
              <button className="button button-primary" onClick={createList}>Creer</button>
            </div>
            {lists.length === 0 && <p className="muted">Aucune liste creee.</p>}
            {lists.map(list => (
              <div className="list-row actions-row" style={{ justifyContent: 'space-between' }} key={list.id}>
                <span>{list.name}</span>
                <button className="button button-secondary" onClick={() => addToList(list.id)}>Ajouter</button>
              </div>
            ))}
            {feedback && <div className="success">{feedback}</div>}
          </div>
        </div>
      )}
    </div>
  )
}
