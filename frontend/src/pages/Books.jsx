import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function Books(){
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = React.useContext(AuthContext)

  const accent = '#F5A623'
  const bg = '#0a0a0a'
  const text = '#ffffff'
  const textMuted = '#a0a0a0'
  const cardBg = '#1a1a1a'
  const cardBorder = '#2a2a2a'

  const [books, setBooks] = React.useState([])
  const [filtered, setFiltered] = React.useState([])
  const [categories, setCategories] = React.useState([])
  const [search, setSearch] = React.useState(searchParams.get('search') || '')
  const [activeCategory, setActiveCategory] = React.useState(searchParams.get('category') || '')
  const [loading, setLoading] = React.useState(true)
  const [reqOpen, setReqOpen] = React.useState(false)
  const [reqTitle, setReqTitle] = React.useState('')
  const [reqAuthor, setReqAuthor] = React.useState('')

  React.useEffect(()=>{ loadCategories() }, [])
  React.useEffect(()=>{ // reload books when sort param changes
    loadBooks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('sort')])

  React.useEffect(()=>{ applyFilter() }, [books, search, activeCategory])

  async function loadBooks(){
    setLoading(true)
    try{
      const res = await api.get('/books')
      let data = res.data || []
      const sort = searchParams.get('sort')
      if (sort === 'newest'){
        data = data.slice().sort((a,b)=>{
          const ta = a.created_at ? new Date(a.created_at).getTime() : 0
          const tb = b.created_at ? new Date(b.created_at).getTime() : 0
          return tb - ta
        })
      }
      setBooks(data)
    }catch(e){
      console.error('loadBooks', e)
      setBooks([])
    }finally{ setLoading(false) }
  }

  async function loadCategories(){
    try{
      const res = await api.get('/categories')
      setCategories(res.data || [])
    }catch(e){
      console.error('loadCategories', e)
      setCategories([])
    }
  }

  function applyFilter(){
    const q = (search || '').toLowerCase().trim()
    const result = books.filter(b=>{
      const title = (b.title||'').toLowerCase()
      const author = (b.author_name||'').toLowerCase()
      const matchesText = !q || title.includes(q) || author.includes(q)
      const matchesCategory = !activeCategory || (b.category_name === activeCategory)
      return matchesText && matchesCategory
    })
    setFiltered(result)
  }

  function handleLogout(){
    try{ localStorage.removeItem('token'); localStorage.removeItem('user'); }catch(_){}
    window.location.href = '/login'
  }

  function getUserName(){
    return user?.name || 'Utilisateur'
  }

  function openBook(id){ navigate(`/books/${id}`) }

  function selectCategory(catName){
    setActiveCategory(prev => prev === catName ? '' : catName)
  }

  const coverUrl = (url)=>{
    if (!url) return null
    let clean = url.replace(/^\/+/,'').replace('/uploads/pdfs/', '/uploads/books/')
    if (!clean.startsWith('uploads/')) clean = 'uploads/covers/' + clean
    return 'http://localhost:5000/' + clean
  }

  const NavBar = ()=> {
    const [hovered, setHovered] = React.useState(null)
    const linkBase = { textDecoration:'none', transition:'color .2s', cursor:'pointer', whiteSpace:'nowrap' }
    return (
      <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:14,background:'#111',borderBottom:`1px solid ${cardBorder}`}}>
        <div style={{color:accent,fontWeight:800,fontSize:18,cursor:'pointer'}} onClick={()=>navigate('/')}>NovaLibrary</div>
        <nav style={{display:'flex',gap:18,color:textMuted,alignItems:'center'}}>
          {[
            {k:'home',label:'Accueil',to:'/dashboard'},
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
        <div style={{display:'flex',gap:0,marginBottom:20,justifyContent:'center'}}>
          <input
            placeholder="Rechercher un livre, un auteur..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            style={{flex:1,maxWidth:640,background:cardBg,border:`1px solid ${cardBorder}`,borderRight:'none',color:text,padding:'14px 18px',borderRadius:'12px 0 0 12px',outline:'none',fontSize:16}}
          />
          <button
            onClick={applyFilter}
            style={{background:accent,color:'#000',border:'none',padding:'14px 22px',borderRadius:'0 12px 12px 0',cursor:'pointer',fontWeight:700,fontSize:15}}
          >
            Rechercher
          </button>
        </div>

        {/* Category filters */}
        <div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom:28,justifyContent:'center'}}>
          {categories.map((c)=> {
            const isActive = activeCategory === c.name
            return (
              <button
                key={c.id}
                onClick={()=>selectCategory(c.name)}
                style={{
                  background: isActive ? accent : cardBg,
                  color: isActive ? '#000' : text,
                  border: `1px solid ${isActive ? accent : cardBorder}`,
                  padding:'8px 14px',
                  borderRadius:999,
                  cursor:'pointer',
                  fontWeight:600,
                  fontSize:13
                }}
              >
                {c.name}
              </button>
            )
          })}
        </div>

        {/* Book grid */}
        {loading ? (
          <div style={{textAlign:'center',padding:40,color:textMuted}}>Chargement…</div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:18}}>
            {(filtered.length ? filtered : books).map((b)=> (
              <div
                key={b.id}
                style={{background:cardBg,border:`1px solid ${cardBorder}`,borderRadius:12,overflow:'hidden',display:'flex',flexDirection:'column',transition:'transform .15s'}}
                onMouseEnter={(e)=>{ e.currentTarget.style.transform='translateY(-4px)' }}
                onMouseLeave={(e)=>{ e.currentTarget.style.transform='translateY(0)' }}
              >
                <div onClick={()=>openBook(b.id)} style={{cursor:'pointer',width:'100%',aspectRatio:'2/3',background:'#121212',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                  {b.cover_url ? (
                    <img src={coverUrl(b.cover_url)} alt={b.title} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  ) : (
                    <span style={{fontSize:48}}>📚</span>
                  )}
                </div>
                <div style={{padding:14,display:'flex',flexDirection:'column',gap:8,flex:1}}>
                  <div onClick={()=>openBook(b.id)} style={{cursor:'pointer',fontWeight:700,fontSize:15,color:text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={b.title}>{b.title}</div>
                  <div style={{color:textMuted,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.author_name || '-'}</div>
                  <div style={{marginTop:'auto',display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                    <span style={{background:'rgba(245,166,35,0.12)',color:accent,padding:'4px 10px',borderRadius:999,fontSize:11,fontWeight:700}}>{b.category_name || '—'}</span>
                    <button
                      onClick={(e)=>{ e.stopPropagation(); openBook(b.id) }}
                      style={{background:accent,color:'#000',border:'none',padding:'6px 12px',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:12}}
                    >
                      Lire
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && books.length > 0 && (
          <div style={{textAlign:'center',padding:40,color:textMuted}}>Aucun livre ne correspond à votre recherche.</div>
        )}
      </main>
    </div>
  )
}
