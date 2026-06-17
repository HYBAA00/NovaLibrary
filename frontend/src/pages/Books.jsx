import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import api from '../services/api'
import AppHeader from '../components/AppHeader'
import BookCard from '../components/BookCard'
import { AuthContext } from '../context/AuthContext'
import { collection, meta } from '../utils/format'

export default function Books() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = React.useContext(AuthContext)

  const [books, setBooks] = React.useState([])
  const [categories, setCategories] = React.useState([])
  const [pagination, setPagination] = React.useState({ page: 1, totalPages: 1, total: 0 })
  const [search, setSearch] = React.useState(searchParams.get('search') || '')
  const [category, setCategory] = React.useState(searchParams.get('category') || '')
  const [sort, setSort] = React.useState(searchParams.get('sort') || 'published')
  const [page, setPage] = React.useState(Number(searchParams.get('page') || 1))
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const [requestOpen, setRequestOpen] = React.useState(false)
  const [request, setRequest] = React.useState({ title: '', author: '', note: '' })
  const [requestMessage, setRequestMessage] = React.useState('')

  React.useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(collection(res.data)))
      .catch(() => setCategories([]))
  }, [])

  React.useEffect(() => {
    loadBooks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort, category])

  async function loadBooks(nextSearch = search) {
    setLoading(true)
    setError('')
    try {
      const params = { page, pageSize: 12, sort }
      if (nextSearch.trim()) params.search = nextSearch.trim()
      if (category) params.category = category
      const res = await api.get('/books', { params })
      setBooks(collection(res.data))
      setPagination(meta(res.data))
      setSearchParams(Object.fromEntries(Object.entries(params).filter(([, value]) => value)))
    } catch (err) {
      setBooks([])
      setError(err.response?.data?.message || 'Impossible de charger le catalogue')
    } finally {
      setLoading(false)
    }
  }

  function submitSearch(e) {
    e.preventDefault()
    setPage(1)
    loadBooks(search)
  }

  async function submitRequest(e) {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }

    setRequestMessage('')
    try {
      await api.post('/book-requests', request)
      setRequest({ title: '', author: '', note: '' })
      setRequestMessage('Demande envoyee avec succes.')
      setTimeout(() => {
        setRequestOpen(false)
        setRequestMessage('')
      }, 900)
    } catch (err) {
      setRequestMessage(err.response?.data?.message || 'Demande impossible')
    }
  }

  return (
    <div className="page">
      <AppHeader />
      <main className="container section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Catalogue</span>
            <h1 style={{ margin: '12px 0 0' }}>Explorer les livres</h1>
            <p className="section-lead">Recherchez par titre, auteur, description ou categorie.</p>
          </div>
          <button className="button button-secondary" onClick={() => setRequestOpen(true)}>
            <Plus size={18} /> Demander un livre
          </button>
        </div>

        <form className="toolbar" onSubmit={submitSearch}>
          <input className="search-box" value={search} onChange={e => setSearch(e.target.value)} placeholder="Titre, auteur, mot-cle..." />
          <select className="select" value={sort} onChange={e => { setSort(e.target.value); setPage(1) }}>
            <option value="published">Publication</option>
            <option value="newest">Ajout recent</option>
            <option value="popular">Popularite</option>
            <option value="rating">Meilleures notes</option>
            <option value="title">Titre A-Z</option>
          </select>
          <button className="button button-primary" type="submit"><Search size={18} /> Rechercher</button>
        </form>

        <div className="filters">
          <button className={`filter-chip ${!category ? 'active' : ''}`} onClick={() => { setCategory(''); setPage(1) }}>Toutes</button>
          {categories.map(item => (
            <button
              key={item.id}
              className={`filter-chip ${category === item.name ? 'active' : ''}`}
              onClick={() => { setCategory(category === item.name ? '' : item.name); setPage(1) }}
            >
              {item.name}
            </button>
          ))}
        </div>

        {error && <div className="alert">{error}</div>}

        {loading ? (
          <div className="empty-state">Chargement du catalogue...</div>
        ) : books.length ? (
          <>
            <div className="grid-books">
              {books.map(book => (
                <BookCard key={book.id} book={book} onOpen={id => navigate(`/books/${id}`)} />
              ))}
            </div>

            <div className="actions-row" style={{ justifyContent: 'space-between', marginTop: 20 }}>
              <span className="muted">{pagination.total} livre(s) trouve(s)</span>
              <div className="actions-row">
                <button className="button button-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Precedent</button>
                <span className="status-pill">Page {pagination.page} / {pagination.totalPages}</span>
                <button className="button button-secondary" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Suivant</button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">Aucun livre trouve. Essayez un autre filtre.</div>
        )}
      </main>

      {requestOpen && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setRequestOpen(false)}>
          <form className="modal-card form-stack" onSubmit={submitRequest}>
            <h2 style={{ margin: 0 }}>Demander un livre</h2>
            <input className="input" required value={request.title} onChange={e => setRequest({ ...request, title: e.target.value })} placeholder="Titre du livre" />
            <input className="input" value={request.author} onChange={e => setRequest({ ...request, author: e.target.value })} placeholder="Auteur" />
            <textarea className="textarea" value={request.note} onChange={e => setRequest({ ...request, note: e.target.value })} placeholder="Pourquoi ce livre ?" />
            {requestMessage && <div className={requestMessage.includes('succes') ? 'success' : 'alert'}>{requestMessage}</div>}
            <div className="actions-row" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="button button-secondary" onClick={() => setRequestOpen(false)}>Annuler</button>
              <button type="submit" className="button button-primary">Envoyer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
