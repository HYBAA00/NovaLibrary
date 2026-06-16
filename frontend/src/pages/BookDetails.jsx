import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function BookDetails(){
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = React.useContext(AuthContext)

  const accent = '#F5A623'
  const bg = '#0a0a0a'
  const text = '#ffffff'
  const textMuted = '#a0a0a0'
  const cardBg = '#1a1a1a'
  const cardBorder = '#2a2a2a'

  const [book, setBook] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const [reviews, setReviews] = React.useState([])
  const [rating, setRating] = React.useState(0)
  const [hoverRating, setHoverRating] = React.useState(0)
  const [comment, setComment] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [isFavorite, setIsFavorite] = React.useState(false)
  const [readingStatus, setReadingStatus] = React.useState(null)
  const [listsOpen, setListsOpen] = React.useState(false)
  const [readingLists, setReadingLists] = React.useState([])
  const [creatingList, setCreatingList] = React.useState('')
  const [addingToListFeedback, setAddingToListFeedback] = React.useState(null)

  const readerRef = React.useRef(null)

  React.useEffect(()=>{
    if (!id) return
    loadBook()
    loadReviews()
    checkFavorite()
    checkReadingStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function checkFavorite(){
    try{
      const res = await api.get(`/favorites/${id}/check`)
      setIsFavorite(res.data?.isFavorite || false)
    }catch(e){ console.error('checkFavorite', e) }
  }

  async function checkReadingStatus(){
    try{
      const res = await api.get(`/reading-status/${id}/check`)
      setReadingStatus(res.data?.status || null)
    }catch(e){ console.error('checkReadingStatus', e) }
  }

  async function loadBook(){
    setLoading(true); setError('')
    try{
      const res = await api.get(`/books/${id}`)
      setBook(res.data || null)
    }catch(e){
      console.error('load book', e)
      setError('Impossible de charger le livre')
    }finally{ setLoading(false) }
  }

  async function loadReviews(){
    try{
      const res = await api.get(`/reviews/${id}`)
      setReviews(res.data || [])
    }catch(e){
      console.error('load reviews', e)
      setReviews([])
    }
  }

  async function submitReview(e){
    e.preventDefault()
    if (!user) { alert('Veuillez vous connecter pour laisser un avis.'); return }
    if (rating < 1 || rating > 5) { alert('Veuillez choisir une note.'); return }
    setSubmitting(true)
    try{
      await api.post('/reviews', { book_id: Number(id), rating, comment })
      setRating(0)
      setComment('')
      loadReviews()
    }catch(err){
      console.error('submit review', err)
      alert(err.response?.data?.message || 'Erreur lors de l\'envoi de l\'avis')
    }finally{ setSubmitting(false) }
  }

  async function deleteReview(reviewId){
    if (!confirm('Supprimer cet avis ?')) return
    try{
      await api.delete(`/reviews/${reviewId}`)
      loadReviews()
    }catch(err){
      console.error('delete review', err)
      alert(err.response?.data?.message || 'Erreur')
    }
  }

  function formatDate(dt){
    if (!dt) return ''
    const d = new Date(dt)
    return d.toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })
  }

  const userHasReviewed = user ? reviews.some(r => String(r.user_id) === String(user.id)) : false

  function handleLogout(){
    try{ localStorage.removeItem('token'); localStorage.removeItem('user'); }catch(_){}
    window.location.href = '/login'
  }

  function getUserName(){
    return user?.name || 'Utilisateur'
  }

  function scrollToReader(){
    readerRef.current?.scrollIntoView({ behavior:'smooth' })
  }

  async function handleReadNow(){
    if (!user){ alert('Veuillez vous connecter pour commencer la lecture.'); return }
    try{
      await api.post('/reading-status', { book_id: Number(id), status: 'reading' })
      setReadingStatus('reading')
      scrollToReader()
    }catch(e){ console.error('handleReadNow', e); alert('Erreur') }
  }

  async function toggleFavorite(){
    if (!user){ alert('Veuillez vous connecter pour utiliser les favoris.'); return }
    try{
      if (isFavorite){
        await api.delete(`/favorites/${id}`)
        setIsFavorite(false)
      } else {
        await api.post('/favorites', { book_id: Number(id) })
        setIsFavorite(true)
      }
    }catch(e){ console.error('toggleFavorite', e); alert('Erreur') }
  }

  async function openListsModal(){
    if (!user){ alert('Veuillez vous connecter pour gérer vos listes.'); return }
    try{
      const res = await api.get('/reading-lists')
      setReadingLists(res.data || [])
      setListsOpen(true)
    }catch(e){ console.error('openListsModal', e); alert('Erreur') }
  }

  async function createList(){
    if (!creatingList.trim()) return
    try{
      const res = await api.post('/reading-lists', { name: creatingList.trim() })
      setReadingLists(prev => [res.data, ...prev])
      setCreatingList('')
    }catch(e){ console.error('createList', e); alert('Erreur') }
  }

  async function addToList(listId){
    try{
      await api.post(`/reading-lists/${listId}/books`, { book_id: Number(id) })
      setAddingToListFeedback('Ajouté ✓')
      setTimeout(()=>setAddingToListFeedback(null), 1600)
    }catch(e){ console.error('addToList', e); alert('Erreur') }
  }

  const coverUrl = (url)=>{
    if (!url) return null
    let clean = url.replace(/^\/+/,'').replace('/uploads/pdfs/', '/uploads/books/')
    if (!clean.startsWith('uploads/')) clean = 'uploads/covers/' + clean
    return 'http://localhost:5000/' + clean
  }

  const NavBar = ()=> (
    <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:14,background:'#111',borderBottom:`1px solid ${cardBorder}`}}>
      <div style={{color:accent,fontWeight:800,fontSize:18,cursor:'pointer'}} onClick={()=>navigate('/')}>NovaLibrary</div>
      <nav style={{display:'flex',gap:20,color:textMuted}}>
        <a href="#" onClick={(e)=>{e.preventDefault(); navigate('/')}} style={{color:textMuted,textDecoration:'none'}}>Accueil</a>
        <a href="#" onClick={(e)=>{e.preventDefault(); navigate('/books')}} style={{color:textMuted,textDecoration:'none'}}>Catalogue</a>
      </nav>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{color:textMuted}}>Bienvenue, {getUserName()}</div>
        <button onClick={handleLogout} style={{background:'transparent',border:`1px solid ${cardBorder}`,color:text,padding:'8px 10px',borderRadius:8,cursor:'pointer'}}>Déconnexion</button>
      </div>
    </header>
  )

  if (loading){
    return (
      <div style={{minHeight:'100vh',background:bg,color:text,fontFamily:'Inter,system-ui'}}>
        <NavBar />
        <div style={{padding:40,textAlign:'center',color:textMuted}}>Chargement…</div>
      </div>
    )
  }

  if (error){
    return (
      <div style={{minHeight:'100vh',background:bg,color:text,fontFamily:'Inter,system-ui'}}>
        <NavBar />
        <div style={{padding:40,textAlign:'center',color:'#ef4444'}}>{error}</div>
      </div>
    )
  }

  if (!book){
    return (
      <div style={{minHeight:'100vh',background:bg,color:text,fontFamily:'Inter,system-ui'}}>
        <NavBar />
        <div style={{padding:40,textAlign:'center',color:textMuted}}>Livre introuvable</div>
      </div>
    )
  }

  const coverSrc = coverUrl(book.cover_url)
  const pdfUrl = book?.file_url ? ('http://localhost:5000/' + book.file_url.replace(/^\/+/, '').replace('/uploads/pdfs/', '/uploads/books/')) : null

  return (
    <div style={{minHeight:'100vh',background:bg,color:text,fontFamily:'Inter,system-ui'}}>
      <NavBar />

      <main style={{padding:'32px 24px',maxWidth:1200,margin:'0 auto'}}>
        {/* Two column layout */}
        <div style={{display:'flex',gap:32,flexWrap:'wrap',marginBottom:32}}>
          {/* Cover */}
          <div style={{flex:'0 0 300px',maxWidth:'100%'}}>
            {coverSrc ? (
              <img src={coverSrc} alt={book.title} style={{width:'100%',borderRadius:12,boxShadow:'0 8px 24px rgba(0,0,0,0.5)',display:'block'}} />
            ) : (
              <div style={{width:'100%',aspectRatio:'2/3',background:cardBg,border:`1px solid ${cardBorder}`,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:64}}>📚</div>
            )}
          </div>

          {/* Info */}
          <div style={{flex:1,minWidth:280}}>
            <h1 style={{margin:'0 0 8px',fontSize:32,color:text}}>{book.title}</h1>
            <div style={{color:textMuted,fontSize:18,marginBottom:12}}>{book.author_name || 'Auteur inconnu'}</div>
            <div style={{marginBottom:16}}>
              <span style={{background:'rgba(245,166,35,0.12)',color:accent,padding:'5px 12px',borderRadius:999,fontSize:13,fontWeight:700}}>{book.category_name || '—'}</span>
            </div>
            <p style={{color:'#c0c0c0',lineHeight:1.6,whiteSpace:'pre-wrap',marginBottom:16}}>{book.description || 'Pas de description disponible.'}</p>
            <div style={{color:textMuted,marginBottom:24}}>Publié le : {book.published_date || '—'}</div>

            <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}}>
              {readingStatus === 'reading' ? (
                <div style={{background:'rgba(52,211,153,0.12)',color:'#34D399',padding:'12px 18px',borderRadius:10,fontWeight:700}}>En cours de lecture ✓</div>
              ) : (
                <button onClick={handleReadNow} style={{background:accent,color:'#000',border:'none',padding:'14px 20px',borderRadius:10,cursor:'pointer',fontWeight:800,fontSize:15}}>📖 Lire maintenant</button>
              )}

              <button onClick={toggleFavorite} style={{background:cardBg,color:isFavorite?accent:text,border:`1px solid ${cardBorder}`,padding:'12px 16px',borderRadius:10,cursor:'pointer',fontWeight:700}}>
                {isFavorite ? '♥ Favori' : '♡ Favoris'}
              </button>

              <button onClick={openListsModal} style={{background:cardBg,color:text,border:`1px solid ${cardBorder}`,padding:'12px 16px',borderRadius:10,cursor:'pointer',fontWeight:700}}>+ Bibliothèque</button>

              <button onClick={()=>navigate(-1)} style={{background:cardBg,color:text,border:`1px solid ${cardBorder}`,padding:'12px 16px',borderRadius:10,cursor:'pointer',fontWeight:700}}>← Retour</button>
            </div>

            {/* Lists modal */}
            {listsOpen && (
              <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1200}} onClick={(e)=>{ if(e.target===e.currentTarget) setListsOpen(false) }}>
                <div style={{width:420,maxWidth:'95%',background:cardBg,border:`1px solid ${cardBorder}`,padding:18,borderRadius:12}}>
                  <h3 style={{marginTop:0,marginBottom:12}}>Ajouter à une liste</h3>
                  <div style={{display:'flex',gap:8,marginBottom:12}}>
                    <input value={creatingList} onChange={e=>setCreatingList(e.target.value)} placeholder="Nouvelle liste" style={{flex:1,background:bg,border:`1px solid ${cardBorder}`,color:text,padding:8,borderRadius:8}} />
                    <button onClick={createList} style={{background:accent,color:'#000',border:'none',padding:'8px 12px',borderRadius:8}}>Créer</button>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:8,maxHeight:260,overflow:'auto'}}>
                    {readingLists.length === 0 && <div style={{color:textMuted}}>Aucune liste</div>}
                    {readingLists.map(l => (
                      <div key={l.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:8,border:`1px solid ${cardBorder}`,borderRadius:8}}>
                        <div>{l.name}</div>
                        <div style={{display:'flex',gap:8}}>
                          <button onClick={()=>addToList(l.id)} style={{background:accent,color:'#000',border:'none',padding:'6px 10px',borderRadius:8}}>Ajouter</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {addingToListFeedback && <div style={{marginTop:12,color:'#34D399'}}>{addingToListFeedback}</div>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PDF Reader */}
        {pdfUrl ? (
          <div ref={readerRef} style={{marginBottom:40}}>
            <h2 style={{marginBottom:12,fontSize:20}}>Lecteur PDF</h2>
            <iframe 
              src={pdfUrl} 
              width="100%" 
              height="650px"
              style={{ border: 'none', borderRadius: '8px' }}
              title="Lecteur PDF"
            />
          </div>
        ) : (
          <div style={{marginBottom:40,color:textMuted}}>Aucun PDF disponible</div>
        )}

        {/* Reviews */}
        <section style={{marginBottom:40}}>
          <h2 style={{marginBottom:16,fontSize:20}}>Avis des lecteurs</h2>

          <div style={{display:'flex',flexDirection:'column',gap:16,marginBottom:28}}>
            {reviews.length === 0 && (
              <div style={{color:textMuted,background:cardBg,border:`1px solid ${cardBorder}`,padding:18,borderRadius:12}}>Aucun avis pour le moment. Soyez le premier !</div>
            )}
            {reviews.map((r,i)=> (
              <div key={r.id || i} style={{background:cardBg,border:`1px solid ${cardBorder}`,padding:18,borderRadius:12}}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:'rgba(245,166,35,0.15)',display:'flex',alignItems:'center',justifyContent:'center',color:accent,fontWeight:800,fontSize:14,flexShrink:0}}>
                    {(r.user_name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,color:text,fontSize:15}}>{r.user_name || 'Anonyme'}</div>
                    <div style={{color:textMuted,fontSize:12}}>{formatDate(r.created_at)}</div>
                  </div>
                  <div style={{color:accent,fontSize:16,letterSpacing:2}}>
                    {'★'.repeat(r.rating || 0)}{'☆'.repeat(5 - (r.rating || 0))}
                  </div>
                </div>
                <div style={{color:'#c0c0c0',lineHeight:1.5,marginBottom:8}}>{r.comment || ''}</div>
                {user && (String(r.user_id) === String(user.id) || user.role === 'ADMIN') && (
                  <button onClick={()=>deleteReview(r.id)} style={{background:'transparent',border:'none',color:'#ef4444',cursor:'pointer',fontSize:13,padding:0}}>Supprimer</button>
                )}
              </div>
            ))}
          </div>

          {/* Review form */}
          {user && !userHasReviewed && (
            <div style={{background:cardBg,border:`1px solid ${cardBorder}`,padding:20,borderRadius:12}}>
              <h3 style={{marginTop:0,marginBottom:14,fontSize:17}}>Laisser un avis</h3>
              <form onSubmit={submitReview}>
                <div style={{marginBottom:14}}>
                  <label style={{display:'block',color:textMuted,marginBottom:8,fontSize:14}}>Note</label>
                  <div style={{display:'flex',gap:6,fontSize:28,cursor:'pointer'}}>
                    {[1,2,3,4,5].map((star)=> (
                      <span
                        key={star}
                        onClick={()=>setRating(star)}
                        onMouseEnter={()=>setHoverRating(star)}
                        onMouseLeave={()=>setHoverRating(0)}
                        style={{color: (hoverRating ? star <= hoverRating : star <= rating) ? accent : '#444',transition:'color .15s'}}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{marginBottom:14}}>
                  <label style={{display:'block',color:textMuted,marginBottom:8,fontSize:14}}>Commentaire</label>
                  <textarea
                    value={comment}
                    onChange={(e)=>setComment(e.target.value)}
                    rows={4}
                    placeholder="Partagez votre opinion..."
                    style={{width:'100%',background:bg,border:`1px solid ${cardBorder}`,color:text,padding:12,borderRadius:8,resize:'vertical',outline:'none',fontFamily:'inherit'}}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{background:accent,color:'#000',border:'none',padding:'10px 18px',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:14,opacity:submitting?0.7:1}}
                >
                  {submitting ? 'Envoi…' : 'Soumettre'}
                </button>
              </form>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

