import React from 'react'
import { Send, Sparkles } from 'lucide-react'
import api from '../services/api'
import AppHeader from '../components/AppHeader'
import { AuthContext } from '../context/AuthContext'

export default function Chatbot() {
  const { user } = React.useContext(AuthContext)
  const [messages, setMessages] = React.useState([
    { role: 'assistant', content: 'Bonjour. Demandez-moi un livre, un auteur, une categorie ou une recommandation depuis le catalogue.' },
  ])
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  async function send(text = input) {
    const content = text.trim()
    if (!content || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content }])
    setLoading(true)
    try {
      const res = await api.post('/chatbot/message', { message: content })
      setMessages(prev => [...prev, { role: 'assistant', content: res.data?.reply || 'Je n ai pas de reponse pour le moment.' }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: err.response?.data?.message || 'Connexion requise pour utiliser l assistant.' }])
    } finally {
      setLoading(false)
    }
  }

  const prompts = ['Recommande-moi un livre populaire', 'Je cherche un livre de science', 'Quels livres sont bien notes ?']

  return (
    <div className="page">
      <AppHeader />
      <main className="container section">
        <div className="section-header">
          <div>
            <span className="eyebrow"><Sparkles size={16} /> Assistant catalogue</span>
            <h1 style={{ margin: '12px 0 0' }}>Chatbot NovaLibrary</h1>
            <p className="section-lead">L assistant recherche dans votre base de livres et sauvegarde l historique.</p>
          </div>
        </div>

        {!user && <div className="alert" style={{ marginBottom: 14 }}>Connectez-vous pour utiliser l assistant.</div>}

        <section className="chat-card form-stack" style={{ padding: 18 }}>
          <div className="actions-row">
            {prompts.map(prompt => (
              <button key={prompt} className="filter-chip" onClick={() => send(prompt)} disabled={!user || loading}>{prompt}</button>
            ))}
          </div>

          <div className="form-stack" style={{ minHeight: 360 }}>
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`message ${message.role}`}>
                {message.content}
              </div>
            ))}
            {loading && <div className="message assistant">Recherche dans le catalogue...</div>}
          </div>

          <form className="toolbar" onSubmit={e => { e.preventDefault(); send() }}>
            <input className="search-box" value={input} onChange={e => setInput(e.target.value)} placeholder="Posez une question..." disabled={!user} />
            <button className="button button-primary" disabled={!user || loading || !input.trim()}><Send size={18} /> Envoyer</button>
          </form>
        </section>
      </main>
    </div>
  )
}
