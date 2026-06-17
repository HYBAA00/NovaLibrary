import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function AuthPage() {
  const navigate = useNavigate()
  const { login } = React.useContext(AuthContext)
  const [mode, setMode] = React.useState('login')
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const payload = mode === 'login' ? { email, password } : { name, email, password }
      const res = await api.post(endpoint, payload)
      const token = res.data?.token
      if (!token) throw new Error('Token non recu')

      login(res.data?.user || {}, token)
      const role = res.data?.user?.role || 'USER'
      navigate(role === 'ADMIN' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Action impossible pour le moment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="brand" style={{ marginBottom: 20 }}>
          <span className="brand-mark"><BookOpen size={20} /></span>
          <span>NovaLibrary</span>
        </Link>

        <h1>{mode === 'login' ? 'Connexion' : 'Creer un compte'}</h1>
        <p className="muted" style={{ marginTop: 8 }}>
          {mode === 'login'
            ? 'Accedez a votre bibliotheque personnelle.'
            : 'Le premier compte cree devient administrateur automatiquement.'}
        </p>

        <form onSubmit={submit} className="form-stack" style={{ marginTop: 18 }}>
          {mode === 'register' && (
            <label className="form-stack">
              <span>Nom complet</span>
              <input className="input" value={name} onChange={e => setName(e.target.value)} required placeholder="Votre nom" />
            </label>
          )}

          <label className="form-stack">
            <span>Email</span>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@exemple.com" />
          </label>

          <label className="form-stack">
            <span>Mot de passe</span>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="8 caracteres minimum" />
          </label>

          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? 'Veuillez patienter...' : mode === 'login' ? 'Se connecter' : 'Creer le compte'}
          </button>
        </form>

        {error && <div className="alert" style={{ marginTop: 14 }}>{error}</div>}

        <button
          type="button"
          className="button button-secondary"
          style={{ width: '100%', marginTop: 12 }}
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
        >
          {mode === 'login' ? 'Je veux creer un compte' : 'J ai deja un compte'}
        </button>
      </div>
    </div>
  )
}
