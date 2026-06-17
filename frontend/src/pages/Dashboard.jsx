import React from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function Dashboard(){
  const navigate = useNavigate()
  const { user } = React.useContext(AuthContext)

  const accent = '#F5A623'
  const bg = '#0a0a0a'
  const text = '#ffffff'
  const textMuted = '#a0a0a0'
  const cardBg = '#1a1a1a'
  const cardBorder = '#2a2a2a'

  const [loading, setLoading] = React.useState(true)
  const [books, setBooks] = React.useState([])
  const [categories, setCategories] = React.useState([])
  const [search, setSearch] = React.useState('')
  const [reqOpen, setReqOpen] = React.useState(false)
  const [reqTitle, setReqTitle] = React.useState('')
  const [reqAuthor, setReqAuthor] = React.useState('')
  const [activeTab, setActiveTab] = React.useState(0)
  const [recentBooks, setRecentBooks] = React.useState([])
  const [currentReads, setCurrentReads] = React.useState([])
  const [favorites, setFavorites] = React.useState([])
  const [readingLists, setReadingLists] = React.useState([])
  const [newListName, setNewListName] = React.useState('')
  const [selectedListBooks, setSelectedListBooks] = React.useState([])

  React.useEffect(()=>{
    if (!user) { navigate('/login'); return }
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadAll(){
    setLoading(true)
    try{
      const [bRes, cRes] = await Promise.all([
        api.get('/books').catch(()=>({ data: [] })),
        api.get('/categories').catch(()=>({ data: [] }))
      ])
      setBooks(bRes.data || [])
      setRecentBooks((bRes.data || []).slice().sort((a,b)=> new Date(b.created_at || 0) - new Date(a.created_at || 0)))
      setCategories(cRes.data || [])
    }catch(e){
      console.error('dashboard loadAll', e)
    }finally{
      setLoading(false)
    }
  }

  React.useEffect(()=>{
    // load tab-specific data when tab changes
    if (activeTab === 1) { // current reads
      api.get('/reading-status').then(r=> setCurrentReads(r.data || [])).catch(()=>setCurrentReads([]))
    }
    if (activeTab === 2) { // favorites
      api.get('/favorites').then(r=> setFavorites(r.data || [])).catch(()=>setFavorites([]))
    }
    if (activeTab === 3) { // reading lists
      api.get('/reading-lists').then(r=> setReadingLists(r.data || [])).catch(()=>setReadingLists([]))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  async function createList(){
    if (!newListName.trim()) return
    try{
      const res = await api.post('/reading-lists', { name: newListName.trim() })
      setReadingLists(prev => [res.data, ...prev])
      setNewListName('')
    }catch(e){ console.error('createList', e); alert('Erreur') }
  }

  async function loadListBooks(listId){
    try{
      const res = await api.get(`/reading-lists/${listId}/books`)
      setSelectedListBooks(res.data || [])
    }catch(e){ console.error('loadListBooks', e); setSelectedListBooks([]) }
  }

  async function deleteList(id){
    if(!confirm('Supprimer cette liste ?')) return
    try{ await api.delete(`/reading-lists/${id}`); setReadingLists(prev => prev.filter(l=>l.id!==id)); setSelectedListBooks([]) }catch(e){ console.error(e); alert('Erreur') }
  }

  function handleLogout(){
    try{ localStorage.removeItem('token'); localStorage.removeItem('user'); }catch(_){}
    window.location.href = '/login'
  }

  function getUserName(){
    return user?.name || 'Utilisateur'
  }

  function openBook(id){ navigate(`/books/${id}`) }

  function goToBooksWithSearch(){
    if (search.trim()) navigate(`/books?search=${encodeURIComponent(search.trim())}`)
    else navigate('/books')
  }

  function goToBooksWithCategory(catName){
    navigate(`/books?category=${encodeURIComponent(catName)}`)
  }

  

  const NavBar = ()=> {
    const [hovered, setHovered] = React.useState(null)
    const linkBase = { textDecoration:'none', transition:'color .2s', cursor:'pointer', whiteSpace:'nowrap' }
    return (
      <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:14,background:'#111',borderBottom:`1px solid ${cardBorder}`}}>
        <div style={{color:accent,fontWeight:800,fontSize:18,cursor:'pointer'}} onClick={()=>navigate('/')}>NovaLibrary</div>
        <nav style={{display:'flex',gap:18,color:textMuted,alignItems:'center'}}>
          {[
            {k:'home',label:'Accueil',to:'/dashboard'} ,
            {k:'catalogue',label:'Catalogue',to:'/books'},
            {k:'new',label:'New Releases',to:'/books?sort=newest'},
            {k:'genres',label:'Genres',to:'/books?filter=genres'},
            {k:'authors',label:'Authors',to:'/authors'},
            {k:'request',label:'Request a Book',action:()=>setReqOpen(true)},
            {k:'contact',label:'Contact',to:'/contact'},
            {k:'profile',label:'Edit Profile',to:'/profile'},
          ].map(item => (
            <a key={item.k} href="#"
               onClick={(e)=>{e.preventDefault(); item.action ? item.action() : navigate(item.to)}}
               onMouseEnter={()=>setHovered(item.k)} onMouseLeave={()=>setHovered(null)}
               style={{...linkBase,color:hovered===item.k?accent:textMuted}}>
              {item.label}
            </a>
          ))}
        </nav>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{color:textMuted,whiteSpace:'nowrap'}}>Bienvenue, {getUserName()}</div>
          <button onClick={handleLogout} style={{background:'transparent',border:`1px solid ${cardBorder}`,color:text,padding:'8px 10px',borderRadius:8,cursor:'pointer',whiteSpace:'nowrap'}}>Déconnexion</button>
        </div>
      </header>
    )
  }

  const coverUrl = (url)=>{
    if (!url) return null
    let clean = url.replace(/^\/+/,'').replace('/uploads/pdfs/', '/uploads/books/')
    if (!clean.startsWith('uploads/')) clean = 'uploads/covers/' + clean
    return 'http://localhost:5000/' + clean
  }

  if (loading){
    return (
      <div style={{minHeight:'100vh',background:bg,color:text,fontFamily:'Inter,system-ui',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <NavBar />
        <div>Chargement…</div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:bg,color:text,fontFamily:'Inter,system-ui'}}>
      <NavBar />

      {reqOpen && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}} onClick={(e)=>{ if(e.target===e.currentTarget) setReqOpen(false) }}>
          <div style={{background:cardBg,border:`1px solid ${cardBorder}`,padding:24,borderRadius:12,width:400,maxWidth:'90%'}}>
            <h3 style={{marginTop:0,marginBottom:18,color:text}}>Request a Book</h3>
            <div style={{marginBottom:14}}>
              <label style={{display:'block',color:textMuted,marginBottom:6,fontSize:14}}>Titre du livre</label>
              <input required value={reqTitle} onChange={e=>setReqTitle(e.target.value)} style={{width:'100%',background:bg,border:`1px solid ${cardBorder}`,color:text,padding:10,borderRadius:8,outline:'none'}} />
            </div>
            <div style={{marginBottom:18}}>
              <label style={{display:'block',color:textMuted,marginBottom:6,fontSize:14}}>Auteur</label>
              <input required value={reqAuthor} onChange={e=>setReqAuthor(e.target.value)} style={{width:'100%',background:bg,border:`1px solid ${cardBorder}`,color:text,padding:10,borderRadius:8,outline:'none'}} />
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button type="button" onClick={()=>setReqOpen(false)} style={{background:cardBg,color:text,border:`1px solid ${cardBorder}`,padding:'8px 14px',borderRadius:8,cursor:'pointer'}}>Annuler</button>
              <button type="button" disabled={!reqTitle.trim() || !reqAuthor.trim()} onClick={()=>{ alert(`Demande envoyée !\nTitre: ${reqTitle.trim()}\nAuteur: ${reqAuthor.trim()}`); setReqOpen(false); setReqTitle(''); setReqAuthor(''); }} style={{background:accent,color:'#000',border:'none',padding:'8px 14px',borderRadius:8,cursor:'pointer',fontWeight:700}}>Envoyer</button>
            </div>
          </div>
        </div>
      )}

      <main style={{padding:'32px 24px',maxWidth:1200,margin:'0 auto'}}>
        {/* Search */}
        <div style={{display:'flex',gap:0,marginBottom:32,justifyContent:'center'}}>
          <input
            placeholder="Rechercher un livre, un auteur..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            onKeyDown={(e)=>{ if (e.key==='Enter') goToBooksWithSearch() }}
            style={{flex:1,maxWidth:640,background:cardBg,border:`1px solid ${cardBorder}`,borderRight:'none',color:text,padding:'14px 18px',borderRadius:'12px 0 0 12px',outline:'none',fontSize:16}}
          />
          <button
            onClick={goToBooksWithSearch}
            style={{background:accent,color:'#000',border:'none',padding:'14px 22px',borderRadius:'0 12px 12px 0',cursor:'pointer',fontWeight:700,fontSize:15}}
          >
            Rechercher
          </button>
        </div>

        {/* Popular Categories removed per request */}

        {/* Tabs: Recent / Current Reads / Favorites / My Lists */}
        <section>
          <div style={{display:'flex',gap:12,marginBottom:16}}>
            {['Livres récents','Current Reads','Favoris','Mes Listes'].map((t,i)=> (
              <button key={t} onClick={()=>setActiveTab(i)} style={{padding:'8px 12px',borderRadius:8,cursor:'pointer',background: activeTab===i? accent : cardBg, color: activeTab===i? '#000': text, border:`1px solid ${cardBorder}`}}>{t}</button>
            ))}
          </div>

          {activeTab === 0 && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <h2 style={{margin:0}}>Livres récents</h2>
                <button onClick={()=>navigate('/books')} style={{background:accent,color:'#000',border:'none',padding:'8px 12px',borderRadius:8}}>Voir toute la bibliothèque</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:16}}>
                {recentBooks.slice(0,6).map(b=> (
                  <div key={b.id} onClick={()=>openBook(b.id)} style={{background:cardBg,border:`1px solid ${cardBorder}`,borderRadius:12,overflow:'hidden',cursor:'pointer',display:'flex',flexDirection:'column'}}>
                    <div style={{width:'100%',aspectRatio:'2/3',background:'#121212',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                      {b.cover_url ? <img src={coverUrl(b.cover_url)} alt={b.title} style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <span style={{fontSize:40}}>📚</span>}
                    </div>
                    <div style={{padding:12,display:'flex',flexDirection:'column',gap:6}}>
                      <div style={{fontWeight:700,fontSize:14,color:text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={b.title}>{b.title}</div>
                      <div style={{color:textMuted,fontSize:13}}>{b.author_name || '-'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div>
              <h2 style={{marginTop:0}}>Current Reads</h2>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:16}}>
                {currentReads.map(b=> (
                  <div key={b.id} style={{background:cardBg,border:`1px solid ${cardBorder}`,borderRadius:12,overflow:'hidden',display:'flex',flexDirection:'column'}}>
                    <div onClick={()=>openBook(b.id)} style={{width:'100%',aspectRatio:'2/3',background:'#121212',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',cursor:'pointer'}}>
                      {b.cover_url ? <img src={coverUrl(b.cover_url)} alt={b.title} style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <span style={{fontSize:40}}>📚</span>}
                    </div>
                    <div style={{padding:12,display:'flex',flexDirection:'column',gap:6}}>
                      <div style={{fontWeight:700,color:text}}>{b.title}</div>
                      <div style={{color:textMuted,fontSize:13}}>{b.author_name || '-'}</div>
                      <div style={{marginTop:'auto',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <span style={{background:'rgba(245,166,35,0.12)',color:accent,padding:'4px 8px',borderRadius:999,fontWeight:700}}>En cours</span>
                        <button onClick={()=>navigate(`/books/${b.id}`)} style={{background:accent,color:'#000',border:'none',padding:'6px 10px',borderRadius:8}}>Continuer la lecture</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div>
              <h2 style={{marginTop:0}}>Favoris</h2>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:16}}>
                {favorites.map(b=> (
                  <div key={b.id} style={{background:cardBg,border:`1px solid ${cardBorder}`,borderRadius:12,overflow:'hidden',display:'flex',flexDirection:'column'}}>
                    <div onClick={()=>openBook(b.id)} style={{width:'100%',aspectRatio:'2/3',background:'#121212',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',cursor:'pointer'}}>
                      {b.cover_url ? <img src={coverUrl(b.cover_url)} alt={b.title} style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <span style={{fontSize:40}}>📚</span>}
                    </div>
                    <div style={{padding:12,display:'flex',flexDirection:'column',gap:6}}>
                      <div style={{fontWeight:700,color:text}}>{b.title}</div>
                      <div style={{color:textMuted,fontSize:13}}>{b.author_name || '-'}</div>
                      <div style={{marginTop:'auto',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <span style={{color:'#ef4444',fontWeight:800}}>♥</span>
                        <button onClick={()=>navigate(`/books/${b.id}`)} style={{background:accent,color:'#000',border:'none',padding:'6px 10px',borderRadius:8}}>Lire</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 3 && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <h2 style={{margin:0}}>Mes Listes</h2>
                <div style={{display:'flex',gap:8}}>
                  <input value={newListName} onChange={e=>setNewListName(e.target.value)} placeholder="Nouvelle liste" style={{background:cardBg,border:`1px solid ${cardBorder}`,color:text,padding:8,borderRadius:8}} />
                  <button onClick={createList} style={{background:accent,color:'#000',border:'none',padding:'8px 12px',borderRadius:8}}>Créer une liste</button>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:16}}>
                {readingLists.map(lst => (
                  <div key={lst.id} style={{background:cardBg,border:`1px solid ${cardBorder}`,padding:12,borderRadius:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                      <div style={{fontWeight:800}}>{lst.name}</div>
                      <div style={{display:'flex',gap:8}}>
                        <button onClick={()=>loadListBooks(lst.id)} style={{background:'#0b0b0b',color:text,border:`1px solid ${cardBorder}`,padding:'6px 8px',borderRadius:8}}>Ouvrir</button>
                        <button onClick={()=>deleteList(lst.id)} style={{background:'#ef4444',color:'#fff',border:'none',padding:'6px 8px',borderRadius:8}}>Supprimer</button>
                      </div>
                    </div>
                    <div style={{color:textMuted}}>{lst.book_count ? `${lst.book_count} livres` : ''}</div>
                  </div>
                ))}
              </div>

              {selectedListBooks.length > 0 && (
                <div style={{marginTop:18}}>
                  <h3>Livres dans la liste</h3>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12}}>
                    {selectedListBooks.map(b=> (
                      <div key={b.id} onClick={()=>openBook(b.id)} style={{background:cardBg,border:`1px solid ${cardBorder}`,borderRadius:12,overflow:'hidden',cursor:'pointer'}}>
                        <div style={{width:'100%',aspectRatio:'2/3',background:'#121212',display:'flex',alignItems:'center',justifyContent:'center'}}>{b.cover_url ? <img src={coverUrl(b.cover_url)} alt={b.title} style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <span style={{fontSize:40}}>📚</span>}</div>
                        <div style={{padding:8}}><div style={{fontWeight:700}}>{b.title}</div><div style={{color:textMuted,fontSize:13}}>{b.author_name || '-'}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
