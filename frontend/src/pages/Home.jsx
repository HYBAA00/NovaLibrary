import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Bot, BrainCircuit, Library, Radio, Search, ShieldCheck, Sparkles } from 'lucide-react'
import api from '../services/api'
import AppHeader from '../components/AppHeader'
import BookCard from '../components/BookCard'
import { collection } from '../utils/format'
import { AuthContext } from '../context/AuthContext'

export default function Home() {
  const navigate = useNavigate()
  const { user } = React.useContext(AuthContext)
  const [books, setBooks] = React.useState([])
  const [categories, setCategories] = React.useState([])

  React.useEffect(() => {
    Promise.all([
      api.get('/books', { params: { pageSize: 6, sort: 'popular' } }).catch(() => ({ data: [] })),
      api.get('/categories').catch(() => ({ data: [] })),
    ]).then(([booksRes, categoriesRes]) => {
      setBooks(collection(booksRes.data))
      setCategories(collection(categoriesRes.data))
    })
  }, [])

  return (
    <div className="page">
      <AppHeader />

      <main className="container">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><Sparkles size={16} /> Bibliotheque digitale intelligente</span>
            <h1>NovaLibrary</h1>
            <p>
              Un espace moderne pour organiser les livres, lire les PDF, suivre les favoris,
              gerer les listes, collecter les avis et aider les lecteurs avec un assistant de recherche.
            </p>

            <div className="hero-actions" style={{ marginTop: 22 }}>
              <Link className="button button-primary" to="/books">
                Explorer le catalogue <ArrowRight size={18} />
              </Link>
              <Link className="button button-secondary" to={user ? '/dashboard' : '/login'}>
                {user ? 'Ouvrir mon espace' : 'Commencer'}
              </Link>
              <Link className="button button-secondary" to={user ? '/quiz' : '/login'}>
                QCM ranking <BrainCircuit size={18} />
              </Link>
            </div>
          </div>

          <div className="hero-panel">
            <div className="showcase-grid">
              {books.slice(0, 4).map(book => (
                <BookCard key={book.id} book={book} onOpen={id => navigate(`/books/${id}`)} />
              ))}
              {books.length === 0 && (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  Ajoutez des livres depuis l espace admin pour voir le catalogue ici.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="stats-grid">
            <div className="stat-card">
              <Library size={22} color="var(--accent-2)" />
              <div className="stat-value">{books.length ? `${books.length}+` : '0'}</div>
              <div className="stat-label">Livres visibles rapidement</div>
            </div>
            <div className="stat-card">
              <Search size={22} color="var(--accent-3)" />
              <div className="stat-value">{categories.length}</div>
              <div className="stat-label">Categories indexees</div>
            </div>
            <div className="stat-card">
              <Bot size={22} color="var(--accent)" />
              <div className="stat-value">AI</div>
              <div className="stat-label">Assistant connecte au catalogue</div>
            </div>
            <div className="stat-card">
              <ShieldCheck size={22} color="var(--success)" />
              <div className="stat-value">Admin</div>
              <div className="stat-label">CRUD securise par role</div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <div>
              <span className="eyebrow">Fonctionnalites</span>
              <h2 style={{ margin: '12px 0 0' }}>Un socle beaucoup plus complet</h2>
            </div>
          </div>

          <div className="dashboard-grid">
            {[
              ['Catalogue avance', 'Recherche, tri, categories, notes et popularite.'],
              ['Espace lecteur', 'Favoris, listes personnelles et statuts de lecture.'],
              ['Live chat', 'Discussion en temps reel entre lecteurs connectes.'],
              ['QCM ranking', 'Mistral genere des quiz, points et classement global.'],
              ['Administration', 'Gestion des livres, auteurs, categories, avis et demandes.'],
              ['Qualite API', 'Validation, securite, health check, pagination et erreurs propres.'],
            ].map(([title, body], index) => (
              <div className="panel" key={title}>
                <h3 style={{ marginTop: 0, display: 'flex', gap: 8, alignItems: 'center' }}>
                  {index === 2 && <Radio size={18} />}
                  {index === 3 && <BrainCircuit size={18} />}
                  {index === 5 && <Bot size={18} />}
                  {title}
                </h3>
                <p className="muted">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
