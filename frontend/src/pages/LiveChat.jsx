import React from 'react'
import { io } from 'socket.io-client'
import { Radio, Send, Sparkles } from 'lucide-react'
import AppHeader from '../components/AppHeader'
import api, { ASSET_BASE_URL } from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { formatDate, initials } from '../utils/format'

export default function LiveChat() {
  const { user, token } = React.useContext(AuthContext)
  const [messages, setMessages] = React.useState([])
  const [input, setInput] = React.useState('')
  const [connected, setConnected] = React.useState(false)
  const [events, setEvents] = React.useState([])
  const socketRef = React.useRef(null)

  React.useEffect(() => {
    if (!token) return

    api.get('/live-chat/messages')
      .then(res => setMessages(res.data || []))
      .catch(() => setMessages([]))

    const socket = io(ASSET_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('live:message', message => setMessages(prev => [...prev.slice(-120), message]))
    socket.on('live:presence', event => {
      setEvents(prev => [{ ...event, at: Date.now() }, ...prev].slice(0, 4))
    })

    return () => socket.disconnect()
  }, [token])

  function send(e) {
    e.preventDefault()
    const message = input.trim()
    if (!message || !socketRef.current) return
    socketRef.current.emit('live:message', { message }, ack => {
      if (!ack?.ok) console.warn(ack?.message)
    })
    setInput('')
  }

  return (
    <div className="page live-page">
      <AppHeader />
      <main className="container section">
        <div className="section-header">
          <div>
            <span className="eyebrow"><Radio size={16} /> Live chat</span>
            <h1 style={{ margin: '12px 0 0' }}>Salle de lecture en direct</h1>
            <p className="section-lead">Discutez avec les lecteurs connectes, partagez des recommandations et gardez l historique.</p>
          </div>
          <span className={`status-pill ${connected ? 'live-online' : ''}`}>{connected ? 'Connecte' : 'Hors ligne'}</span>
        </div>

        {!user && <div className="alert">Connectez-vous pour rejoindre le live chat.</div>}

        <section className="live-layout">
          <div className="chat-card live-chat-window">
            <div className="messages-list">
              {messages.map(message => {
                const mine = String(message.user_id) === String(user?.id)
                return (
                  <div key={message.id || `${message.created_at}-${message.message}`} className={`message ${mine ? 'user' : 'assistant'} live-message`}>
                    <div className="message-head">
                      <span className="avatar-mini">{initials(message.user_name)}</span>
                      <strong>{message.user_name || 'Lecteur'}</strong>
                      <span className="muted">{formatDate(message.created_at)}</span>
                    </div>
                    {message.message}
                  </div>
                )
              })}
              {messages.length === 0 && <div className="empty-state">Aucun message pour le moment. Lancez la conversation.</div>}
            </div>

            <form className="toolbar" onSubmit={send}>
              <input className="search-box" value={input} onChange={e => setInput(e.target.value)} placeholder="Ecrire un message..." disabled={!user || !connected} />
              <button className="button button-primary" disabled={!user || !connected || !input.trim()}><Send size={18} /> Envoyer</button>
            </form>
          </div>

          <aside className="panel live-side">
            <span className="eyebrow"><Sparkles size={16} /> Activite</span>
            <div className="form-stack" style={{ marginTop: 14 }}>
              {events.map(event => (
                <div className="list-row" key={`${event.type}-${event.user?.id}-${event.at}`}>
                  <strong>{event.user?.name || 'Utilisateur'}</strong>
                  <p className="muted">{event.type === 'join' ? 'a rejoint le chat' : 'a quitte le chat'}</p>
                </div>
              ))}
              {events.length === 0 && <p className="muted">Les mouvements apparaitront ici.</p>}
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}
