import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BookMarked, Heart, Library, ListPlus, Search } from 'lucide-react'
import api from '../services/api'
import AppHeader from '../components/AppHeader'
import BookCard from '../components/BookCard'
import { AuthContext } from '../context/AuthContext'
import { collection, statusLabel } from '../utils/format'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = React.useContext(AuthContext)
  const [activeTab, setActiveTab] = React.useState('recent')
  const [books, setBooks] = React.useState([])
  const [currentReads, setCurrentReads] = React.useState([])
  const [favorites, setFavorites] = React.useState([])
  const [lists, setLists] = React.useState([])
  const [selectedListBooks, setSelectedListBooks] = React.useState([])
  const [newListName, setNewListName] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  async function loadDashboard() {
    setLoading(true)
    const [booksRes, readsRes, favoritesRes, listsRes] = await Promise.all([
      api.get('/books', { params: { pageSize: 8, sort: 'newest' } }).catch(() => ({ data: [] })),
      api.get('/reading-status').catch(() => ({ data: [] })),
      api.get('/favorites').catch(() => ({ data: [] })),
      api.get('/reading-lists').catch(() => ({ data: [] })),
    ])
    setBooks(collection(booksRes.data))
    setCurrentReads(readsRes.data || [])
    setFavorites(favoritesRes.data || [])
    setLists(listsRes.data || [])
    setLoading(false)
  }

  async function createList() {
    if (!newListName.trim()) return
    const res = await api.post('/reading-lists', { name: newListName.trim() })
    setLists(prev => [res.data, ...prev])
    setNewListName('')
  }

  async function deleteList(id) {
    if (!confirm('Supprimer cette liste ?')) return
    await api.delete(`/reading-lists/${id}`)
    setLists(prev => prev.filter(list => list.id !== id))
    setSelectedListBooks([])
  }

  async function openList(id) {
    const res = await api.get(`/reading-lists/${id}/books`)
    setSelectedListBooks(res.data || [])
  }

  function goSearch(e) {
    e.preventDefault()
    navigate(search.trim() ? `/books?search=${encodeURIComponent(search.trim())}` : '/books')
  }

  const statItems = [
    { label: 'Lectures suivies', value: currentReads.length, icon: BookMarked, color: 'var(--accent-2)' },
    { label: 'Favoris', value: favorites.length, icon: Heart, color: 'var(--danger)' },
    { label: 'Listes', value: lists.length, icon: ListPlus, color: 'var(--accent)' },
    { label: 'Nouveautes', value: books.length, icon: Library, color: 'var(--accent-3)' },
  ]

  return (
    <div className="page">
      <AppHeader />
      <main className="container section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Espace lecteur</span>
            <h1 style={{ margin: '12px 0 0' }}>Bonjour {user?.name || 'lecteur'}</h1>
            <p className="section-lead">Suivez vos lectures, favoris et listes depuis un seul endroit.</p>
          </div>
        </div>

        <form className="toolbar" onSubmit={goSearch}>
          <input className="search-box" value={search} onChange={e => setSearch(e.target.value)} placeholder="Chercher dans le catalogue..." />
          <button className="button button-primary"><Search size={18} /> Rechercher</button>
        </form>

        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {statItems.map(item => {
            const Icon = item.icon
            return (
              <div className="stat-card" key={item.label}>
                <Icon size={22} color={item.color} />
                <div className="stat-value">{item.value}</div>
                <div className="stat-label">{item.label}</div>
              </div>
            )
          })}
        </div>

        <div className="tabs" style={{ marginBottom: 18 }}>
          {[
            ['recent', 'Recents'],
            ['reading', 'En lecture'],
            ['favorites', 'Favoris'],
            ['lists', 'Mes listes'],
          ].map(([key, label]) => (
            <button key={key} className={`tab ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>{label}</button>
          ))}
        </div>

        {loading && <div className="empty-state">Chargement...</div>}

        {!loading && activeTab === 'recent' && (
          <div className="grid-books">
            {books.map(book => <BookCard key={book.id} book={book} onOpen={id => navigate(`/books/${id}`)} />)}
          </div>
        )}

        {!loading && activeTab === 'reading' && (
          currentReads.length ? (
            <div className="grid-books">
              {currentReads.map(book => (
                <BookCard key={book.id} book={{ ...book, category_name: statusLabel(book.status) }} onOpen={id => navigate(`/books/${id}`)} />
              ))}
            </div>
          ) : <div className="empty-state">Aucune lecture suivie pour le moment.</div>
        )}

        {!loading && activeTab === 'favorites' && (
          favorites.length ? (
            <div className="grid-books">
              {favorites.map(book => <BookCard key={book.id} book={book} onOpen={id => navigate(`/books/${id}`)} />)}
            </div>
          ) : <div className="empty-state">Aucun favori pour le moment.</div>
        )}

        {!loading && activeTab === 'lists' && (
          <section className="panel">
            <div className="section-header">
              <h2>Mes listes</h2>
              <div className="form-row">
                <input className="input" value={newListName} onChange={e => setNewListName(e.target.value)} placeholder="Nouvelle liste" />
                <button className="button button-primary" onClick={createList}>Creer</button>
              </div>
            </div>

            <div className="dashboard-grid">
              {lists.map(list => (
                <div className="panel" key={list.id}>
                  <h3 style={{ marginTop: 0 }}>{list.name}</h3>
                  <p className="muted">{list.book_count || 0} livre(s)</p>
                  <div className="actions-row">
                    <button className="button button-secondary" onClick={() => openList(list.id)}>Ouvrir</button>
                    <button className="button button-danger" onClick={() => deleteList(list.id)}>Supprimer</button>
                  </div>
                </div>
              ))}
            </div>

            {selectedListBooks.length > 0 && (
              <>
                <h3>Livres de la liste</h3>
                <div className="grid-books">
                  {selectedListBooks.map(book => <BookCard key={book.id} book={book} onOpen={id => navigate(`/books/${id}`)} />)}
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
