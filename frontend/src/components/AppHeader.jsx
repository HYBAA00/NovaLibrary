import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { BookOpen, Bot, LayoutDashboard, Library, LogOut, Shield, User } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

export default function AppHeader() {
  const navigate = useNavigate()
  const { user, logout } = React.useContext(AuthContext)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const nav = user
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/books', label: 'Catalogue', icon: Library },
        { to: '/chat', label: 'Assistant', icon: Bot },
        { to: '/profile', label: 'Profil', icon: User },
      ]
    : [
        { to: '/books', label: 'Catalogue', icon: Library },
        { to: '/contact', label: 'Contact', icon: BookOpen },
      ]

  return (
    <header className="app-header">
      <Link to="/" className="brand" aria-label="NovaLibrary home">
        <span className="brand-mark"><BookOpen size={20} /></span>
        <span>NovaLibrary</span>
      </Link>

      <nav className="main-nav" aria-label="Navigation principale">
        {nav.map(item => {
          const Icon = item.icon
          return (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
        {user?.role === 'ADMIN' && (
          <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Shield size={16} />
            <span>Admin</span>
          </NavLink>
        )}
      </nav>

      <div className="header-actions">
        {user ? (
          <>
            <span className="user-pill">{user.name || user.email || 'Utilisateur'}</span>
            <button type="button" className="icon-button" onClick={handleLogout} title="Deconnexion" aria-label="Deconnexion">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <Link to="/login" className="button button-primary">Connexion</Link>
        )}
      </div>
    </header>
  )
}
