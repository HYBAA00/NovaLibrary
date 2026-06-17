import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, MessageSquareWarning } from 'lucide-react'
import AppHeader from '../components/AppHeader'

export default function Contact() {
  return (
    <div className="page">
      <AppHeader />
      <main className="container section" style={{ maxWidth: 860 }}>
        <div className="section-header">
          <div>
            <span className="eyebrow"><Mail size={16} /> Contact</span>
            <h1 style={{ margin: '12px 0 0' }}>Nous contacter</h1>
            <p className="section-lead">Signalez un probleme, proposez une amelioration ou demandez un livre depuis le catalogue.</p>
          </div>
        </div>

        <div className="panel form-stack">
          <div className="list-row">
            <h3 style={{ marginTop: 0 }}>Signaler un probleme</h3>
            <p className="muted">
              Pour un lien casse, une couverture incorrecte ou un fichier PDF invalide, contactez l equipe a
              {' '}<a style={{ color: 'var(--accent)' }} href="mailto:NovaLibrary@gmail.com">NovaLibrary@gmail.com</a>.
            </p>
          </div>

          <div className="list-row">
            <h3 style={{ marginTop: 0 }}>Demander un livre</h3>
            <p className="muted">Les demandes de livres passent maintenant par le catalogue pour rester suivies par l administration.</p>
            <Link className="button button-primary" to="/books"><MessageSquareWarning size={18} /> Ouvrir le catalogue</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
