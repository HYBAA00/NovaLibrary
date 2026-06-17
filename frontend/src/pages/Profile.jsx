import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Shield, UserRound } from 'lucide-react'
import AppHeader from '../components/AppHeader'
import { AuthContext } from '../context/AuthContext'
import { initials } from '../utils/format'

export default function Profile() {
  const navigate = useNavigate()
  const { user } = React.useContext(AuthContext)

  React.useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  return (
    <div className="page">
      <AppHeader />
      <main className="container section" style={{ maxWidth: 760 }}>
        <div className="panel" style={{ textAlign: 'center' }}>
          <div className="brand-mark" style={{ width: 78, height: 78, margin: '0 auto 16px', fontSize: 30 }}>
            {initials(user?.name || user?.email)}
          </div>
          <h1 style={{ marginBottom: 6 }}>{user?.name || 'Utilisateur'}</h1>
          <p className="muted">{user?.email || 'Email non defini'}</p>
          <span className="status-pill">{user?.role || 'USER'}</span>
        </div>

        <div className="panel form-stack" style={{ marginTop: 18 }}>
          <h2 style={{ margin: 0 }}>Informations du compte</h2>
          <div className="list-row actions-row" style={{ justifyContent: 'space-between' }}>
            <span className="actions-row"><UserRound size={18} /> Nom</span>
            <strong>{user?.name || 'Non defini'}</strong>
          </div>
          <div className="list-row actions-row" style={{ justifyContent: 'space-between' }}>
            <span className="actions-row"><Mail size={18} /> Email</span>
            <strong>{user?.email || 'Non defini'}</strong>
          </div>
          <div className="list-row actions-row" style={{ justifyContent: 'space-between' }}>
            <span className="actions-row"><Shield size={18} /> Role</span>
            <strong>{user?.role || 'USER'}</strong>
          </div>
        </div>
      </main>
    </div>
  )
}
