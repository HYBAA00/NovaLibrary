import React from 'react'
import api from '../services/api'

export default function AdminPanel(){
  const accent = '#F5A623'
  const bg = '#0a0a0a'
  const text = '#ffffff'
  const textMuted = '#a0a0a0'
  const cardBg = '#1a1a1a'
  const cardBorder = '#2a2a2a'

  const [active, setActive] = React.useState('dashboard')
  const [books, setBooks] = React.useState([])
  const [users, setUsers] = React.useState([])
  const [categories, setCategories] = React.useState([])
  const [authors, setAuthors] = React.useState([])
  const [reviews, setReviews] = React.useState([])
  const [stats, setStats] = React.useState({})

  const [modalOpen, setModalOpen] = React.useState(false)
  const [modalMode, setModalMode] = React.useState('add')
  const [modalEntity, setModalEntity] = React.useState('book')
  const [formData, setFormData] = React.useState({})
  const [pdfFile, setPdfFile] = React.useState(null)
  const [coverFile, setCoverFile] = React.useState(null)

  const [selectedCategory, setSelectedCategory] = React.useState('')
  const [newCategory, setNewCategory] = React.useState('')
  const [selectedAuthor, setSelectedAuthor] = React.useState('')
  const [newAuthor, setNewAuthor] = React.useState('')
  const [searchText, setSearchText] = React.useState('')
  const [filterCategory, setFilterCategory] = React.useState('')

  React.useEffect(()=>{
    fetchAll()
  },[])

  const fetchAll = async ()=>{
    try{
      const [sRes, bRes, booksStatsRes, usersStatsRes, cRes, aRes, revRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/books'),
        api.get('/admin/books-stats'),
        api.get('/admin/users-stats'),
        api.get('/categories'),
        api.get('/authors'),
        api.get('/reviews/all')
      ])
      setStats(sRes.data || {})
      // merge books with stats
      const booksData = bRes.data || []
      const booksStats = booksStatsRes.data || []
      const booksMap = {}
      booksStats.forEach(s=> { booksMap[s.id] = s })
      setBooks(booksData.map(b => ({ ...b, reading_count: booksMap[b.id]?.reading_count || 0, favorites_count: booksMap[b.id]?.favorites_count || 0 })))
      setUsers(usersStatsRes.data || [])
      setCategories(cRes.data || [])
      setAuthors(aRes.data || [])
      setReviews(revRes.data || [])
    }catch(e){
      console.error('fetchAll error', e)
    }
  }

  const getUserName = ()=>{
    try{ const t = localStorage.getItem('token'); if(!t) return 'Admin'; const p = JSON.parse(atob(t.split('.')[1])); return p.name || 'Admin' }catch{ return 'Admin' }
  }

  const logout = ()=>{ localStorage.removeItem('token'); window.location.href = '/login' }

  const NavBar = ()=> {
    const navItems = [
      {k:'dashboard', label:'Dashboard'},
      {k:'books', label:'Books'},
      {k:'users', label:'Users'},
      {k:'categories', label:'Categories'},
      {k:'authors', label:'Authors'},
      {k:'reviews', label:'Reviews'},
    ]
    return (
      <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:14,background:'#111',borderBottom:`1px solid ${cardBorder}`}}>
        <div style={{color:accent,fontWeight:800,fontSize:18}}>NovaLibrary</div>
        <nav style={{display:'flex',gap:20,color:textMuted}}>
          {navItems.map(item => (
            <a key={item.k} href="#" onClick={(e)=>{e.preventDefault(); setActive(item.k)}} style={{color:active===item.k?'#fff':textMuted,textDecoration:'none',fontWeight:active===item.k?700:400}}>
              {item.label}
            </a>
          ))}
        </nav>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{color:textMuted}}>Bienvenue, {getUserName()}</div>
          <button onClick={logout} style={{background:'transparent',border:`1px solid ${cardBorder}`,color:text,padding:'8px 10px',borderRadius:8,cursor:'pointer'}}>Déconnexion</button>
        </div>
      </header>
    )
  }

  /* Sidebar removed; navigation moved to NavBar */

  /* Book CRUD */
  const openAddBook = ()=>{
    setModalEntity('book')
    setModalMode('add')
    setFormData({ title:'', description:'', author:'', category:'', published_at:'' })
    setSelectedCategory(''); setNewCategory('')
    setSelectedAuthor(''); setNewAuthor('')
    setPdfFile(null); setCoverFile(null); setModalOpen(true)
  }
  const openEditBook = (b)=>{
    setModalEntity('book')
    setModalMode('edit')
    setFormData({ ...b })

    const catName = b.category_name || b.category || ''
    if (categories.some(c => c.name === catName)) {
      setSelectedCategory(catName); setNewCategory('')
    } else {
      setSelectedCategory(''); setNewCategory(catName)
    }

    const authName = b.author_name || b.author || ''
    if (authors.some(a => a.name === authName)) {
      setSelectedAuthor(authName); setNewAuthor('')
    } else {
      setSelectedAuthor(''); setNewAuthor(authName)
    }

    setPdfFile(null); setCoverFile(null); setModalOpen(true)
  }
  const submitBook = async (e)=>{
    e.preventDefault()
    try{
      const fd = new FormData()
      fd.append('title', formData.title || '')
      fd.append('description', formData.description || '')
      fd.append('author', formData.author || '')
      fd.append('category', formData.category || '')
      fd.append('published_at', formData.published_at || '')
      if(pdfFile) fd.append('pdf', pdfFile)
      if(coverFile) fd.append('cover', coverFile)

      if(modalMode === 'add'){
        await api.post('/books', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }else{
        const id = formData.id
        await api.put(`/books/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      setModalOpen(false)
      fetchAll()
    }catch(err){ console.error('submitBook', err); alert(err.response?.data?.message || err.message) }
  }
  const deleteBook = async (id)=>{
    if(!confirm('Supprimer ce livre ?')) return
    try{ await api.delete(`/books/${id}`); fetchAll() }catch(e){ console.error(e); alert('Erreur') }
  }

  /* Users */
  const updateUserRole = async (id, role)=>{
    try{ await api.put(`/users/${id}`, { role }); fetchAll() }catch(e){ console.error(e); alert('Erreur') }
  }

  /* Categories & Authors edit/delete only */
  const openEditEntity = (entity, item)=>{ setModalEntity(entity); setModalMode('edit'); setFormData({ ...item }); setModalOpen(true) }
  const submitEntity = async (e)=>{
    e.preventDefault()
    try{
      if(modalEntity === 'category'){
        await api.put(`/categories/${formData.id}`, { name: formData.name })
      }
      if(modalEntity === 'author'){
        await api.put(`/authors/${formData.id}`, { name: formData.name })
      }
      setModalOpen(false); fetchAll()
    }catch(e){ console.error(e); alert('Erreur') }
  }
  const deleteEntity = async (entity, id)=>{
    if(!confirm('Supprimer ?')) return
    try{
      await api.delete(`/${entity}/${id}`)
      fetchAll()
    }catch(e){ console.error(e); alert('Erreur') }
  }

  const deleteReview = async (id)=>{
    if(!confirm('Supprimer cette review ?')) return
    try{
      await api.delete(`/reviews/${id}`)
      fetchAll()
    }catch(e){ console.error(e); alert('Erreur') }
  }

  const formatDate = (date)=>{
    if (!date) return 'Non définie'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  return (
    <div style={{minHeight:'100vh',background:bg,color:text,fontFamily:'Inter, system-ui'}}>
      <NavBar />
      <div style={{padding:24}}>
        <main style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
            <h2 style={{margin:0}}>{active==='dashboard' ? 'Tableau de bord' : active==='books' ? 'Livres' : active==='users' ? 'Utilisateurs' : active==='categories' ? 'Catégories' : active==='authors' ? 'Auteurs' : 'Reviews'}</h2>
            {active==='books' && <button onClick={openAddBook} style={{background:accent,color:'#000',border:'none',padding:'10px 14px',borderRadius:8,cursor:'pointer',fontWeight:700}}>Ajouter</button>}
          </div>

          {active==='dashboard' && (
            <section>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
                <div style={{background:cardBg,border:`1px solid ${cardBorder}`,padding:18,borderRadius:12}}><div style={{color:textMuted}}>Ouvrages</div><div style={{fontSize:24,fontWeight:800,color:accent}}>{stats?.books ?? '—'}</div></div>
                <div style={{background:cardBg,border:`1px solid ${cardBorder}`,padding:18,borderRadius:12}}><div style={{color:textMuted}}>Utilisateurs</div><div style={{fontSize:24,fontWeight:800,color:accent}}>{stats?.users ?? '—'}</div></div>
                <div style={{background:cardBg,border:`1px solid ${cardBorder}`,padding:18,borderRadius:12}}><div style={{color:textMuted}}>Catégories</div><div style={{fontSize:24,fontWeight:800,color:accent}}>{stats?.categories ?? '—'}</div></div>
                <div style={{background:cardBg,border:`1px solid ${cardBorder}`,padding:18,borderRadius:12}}><div style={{color:textMuted}}>Auteurs</div><div style={{fontSize:24,fontWeight:800,color:accent}}>{stats?.authors ?? '—'}</div></div>
              </div>
            </section>
          )}

          {active==='books' && (
            <section>
              <div style={{marginBottom:12,display:'flex',gap:8}}>
                <input
                  placeholder="Rechercher..."
                  value={searchText}
                  onChange={(e)=>setSearchText(e.target.value)}
                  style={{background:cardBg,border:`1px solid ${cardBorder}`,color:text,padding:10,borderRadius:8}}
                />
                <select
                  value={filterCategory}
                  onChange={(e)=>setFilterCategory(e.target.value)}
                  style={{background:cardBg,border:`1px solid ${cardBorder}`,color:text,padding:10,borderRadius:8}}
                >
                  <option value="">Toutes catégories</option>
                  {categories.map(c=> <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div style={{background:cardBg,border:`1px solid ${cardBorder}`,borderRadius:12,overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead style={{background:'#0f0f0f',color:textMuted}}>
                    <tr>
                      <th style={{padding:12,textAlign:'left'}}>ID</th>
                      <th style={{padding:12,textAlign:'left'}}>Titre</th>
                      <th style={{padding:12,textAlign:'left'}}>Auteur</th>
                      <th style={{padding:12,textAlign:'left'}}>Catégorie</th>
                      <th style={{padding:12,textAlign:'left'}}>Date</th>
                      <th style={{padding:12,textAlign:'left'}}>PDF</th>
                      <th style={{padding:12,textAlign:'left'}}>Statut</th>
                      <th style={{padding:12,textAlign:'left'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books
                      .filter(b => {
                        const q = searchText.trim().toLowerCase()
                        const cat = filterCategory
                        if (cat && (b.category_name || b.category || '') !== cat) return false
                        if (!q) return true
                        const title = (b.title || '').toLowerCase()
                        const author = (b.author_name || b.author || '').toLowerCase()
                        const category = (b.category_name || b.category || '').toLowerCase()
                        return title.includes(q) || author.includes(q) || category.includes(q)
                      })
                      .map((b,i)=> (
                        <tr key={b.id} style={{background: i%2===0? '#1a1a1a':'#161616'}}>
                          <td style={{padding:12,color:textMuted}}>{b.id}</td>
                          <td style={{padding:12}}>{b.title}</td>
                          <td style={{padding:12,color:textMuted}}>{b.author_name || b.author}</td>
                          <td style={{padding:12}}>{b.category_name || b.category}</td>
                          <td style={{padding:12,color:textMuted}}>{formatDate(b.published_date)}</td>
                          <td style={{padding:12}}>{b.file_url ? <button onClick={()=>window.open('http://localhost:5000/' + ((b.file_url||'').replace(/^\/+/, '').replace('/uploads/pdfs/', '/uploads/books/') || ''), '_blank')} style={{background:accent,color:'#000',border:'none',padding:'6px 8px',borderRadius:8}}>Voir PDF</button> : '-'}</td>
                          <td style={{padding:12}}>
                            <div style={{display:'flex',gap:8,alignItems:'center'}}>
                              <span style={{background:'rgba(245,166,35,0.12)',color:accent,padding:'4px 8px',borderRadius:999,fontWeight:700}}>En lecture: {b.reading_count ?? 0}</span>
                              <span style={{background:'rgba(245,120,0,0.08)',color:'#F59E0B',padding:'4px 8px',borderRadius:999,fontWeight:700}}>Favoris: {b.favorites_count ?? 0}</span>
                            </div>
                          </td>
                          <td style={{padding:12,display:'flex',gap:8}}>
                            <button onClick={()=>openEditBook(b)} style={{background:accent,color:'#000',border:'none',padding:'8px 10px',borderRadius:8,cursor:'pointer'}}>Éditer</button>
                            <button onClick={()=>deleteBook(b.id)} style={{background:'#ef4444',color:'#fff',border:'none',padding:'8px 10px',borderRadius:8,cursor:'pointer'}}>Supprimer</button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {active==='users' && (
            <section>
              <div style={{background:cardBg,border:`1px solid ${cardBorder}`,borderRadius:12,overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead style={{background:'#0f0f0f',color:textMuted}}>
                    <tr>
                      <th style={{padding:12,textAlign:'left'}}>Nom</th>
                      <th style={{padding:12,textAlign:'left'}}>Email</th>
                      <th style={{padding:12,textAlign:'left'}}>Rôle</th>
                      <th style={{padding:12,textAlign:'left'}}>Livres lus</th>
                      <th style={{padding:12,textAlign:'left'}}>Favoris</th>
                      <th style={{padding:12,textAlign:'left'}}>Top catégorie</th>
                      <th style={{padding:12,textAlign:'left'}}>Top auteur</th>
                      <th style={{padding:12,textAlign:'left'}}>Inscription</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u,i)=> (
                      <tr key={u.id} style={{background: i%2===0? '#1a1a1a':'#161616'}}>
                        <td style={{padding:12}}>{u.name}</td>
                        <td style={{padding:12,color:textMuted}}>{u.email}</td>
                        <td style={{padding:12}}>
                          <select defaultValue={u.role} onChange={(e)=>updateUserRole(u.id, e.target.value)} style={{background:cardBg,border:`1px solid ${cardBorder}`,color:text,padding:8,borderRadius:8}}>
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td style={{padding:12,color:accent,fontWeight:800}}>{u.reading_count ?? 0}</td>
                        <td style={{padding:12,color:'#F59E0B',fontWeight:800}}>{u.favorites_count ?? 0}</td>
                        <td style={{padding:12,color:textMuted}}>{u.top_category || '—'}</td>
                        <td style={{padding:12,color:textMuted}}>{u.top_author || '—'}</td>
                        <td style={{padding:12,color:textMuted}}>{u.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {active==='categories' && (
            <section>
              <div style={{marginBottom:12}}>
                <h3 style={{margin:0}}>Catégories</h3>
              </div>
              <div style={{background:cardBg,border:`1px solid ${cardBorder}`,borderRadius:12,overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead style={{background:'#0f0f0f',color:textMuted}}><tr><th style={{padding:12,textAlign:'left'}}>Nom</th><th style={{padding:12,textAlign:'left'}}>Actions</th></tr></thead>
                  <tbody>
                    {categories.map((c,i)=> (
                      <tr key={c.id} style={{background: i%2===0? '#1a1a1a':'#161616'}}>
                        <td style={{padding:12}}>{c.name}</td>
                        <td style={{padding:12,display:'flex',gap:8}}>
                          <button onClick={()=>openEditEntity('category', c)} style={{background:accent,color:'#000',border:'none',padding:'6px 10px',borderRadius:8}}>Modifier</button>
                          <button onClick={()=>deleteEntity('categories', c.id)} style={{background:'#ef4444',color:'#fff',border:'none',padding:'6px 10px',borderRadius:8}}>Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {active==='authors' && (
            <section>
              <div style={{marginBottom:12}}>
                <h3 style={{margin:0}}>Auteurs</h3>
              </div>
              <div style={{background:cardBg,border:`1px solid ${cardBorder}`,borderRadius:12,overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead style={{background:'#0f0f0f',color:textMuted}}><tr><th style={{padding:12,textAlign:'left'}}>Nom</th><th style={{padding:12,textAlign:'left'}}>Actions</th></tr></thead>
                  <tbody>
                    {authors.map((a,i)=> (
                      <tr key={a.id} style={{background: i%2===0? '#1a1a1a':'#161616'}}>
                        <td style={{padding:12}}>{a.name}</td>
                        <td style={{padding:12,display:'flex',gap:8}}>
                          <button onClick={()=>openEditEntity('author', a)} style={{background:accent,color:'#000',border:'none',padding:'6px 10px',borderRadius:8}}>Modifier</button>
                          <button onClick={()=>deleteEntity('authors', a.id)} style={{background:'#ef4444',color:'#fff',border:'none',padding:'6px 10px',borderRadius:8}}>Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {active==='reviews' && (
            <section>
              <div style={{marginBottom:12}}>
                <h3 style={{margin:0}}>Reviews</h3>
              </div>
              <div style={{background:cardBg,border:`1px solid ${cardBorder}`,borderRadius:12,overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead style={{background:'#0f0f0f',color:textMuted}}>
                    <tr>
                      <th style={{padding:12,textAlign:'left'}}>ID</th>
                      <th style={{padding:12,textAlign:'left'}}>Livre</th>
                      <th style={{padding:12,textAlign:'left'}}>User</th>
                      <th style={{padding:12,textAlign:'left'}}>Note</th>
                      <th style={{padding:12,textAlign:'left'}}>Commentaire</th>
                      <th style={{padding:12,textAlign:'left'}}>Date</th>
                      <th style={{padding:12,textAlign:'left'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((r,i)=> (
                      <tr key={r.id} style={{background: i%2===0? '#1a1a1a':'#161616'}}>
                        <td style={{padding:12,color:textMuted}}>{r.id}</td>
                        <td style={{padding:12}}>{r.book_title || '—'}</td>
                        <td style={{padding:12,color:textMuted}}>{r.user_name || '—'}</td>
                        <td style={{padding:12,color:accent}}>{'★'.repeat(r.rating || 0)}{'☆'.repeat(5 - (r.rating || 0))}</td>
                        <td style={{padding:12,color:'#c0c0c0',maxWidth:300,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.comment || ''}</td>
                        <td style={{padding:12,color:textMuted,fontSize:13}}>{r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                        <td style={{padding:12}}>
                          <button onClick={()=>deleteReview(r.id)} style={{background:'#ef4444',color:'#fff',border:'none',padding:'6px 10px',borderRadius:8,cursor:'pointer'}}>Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Modal for book / category / author */}
          {modalOpen && (
            <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{width:720,background:cardBg,border:`1px solid ${cardBorder}`,padding:18,borderRadius:12}}>
                <h3 style={{marginTop:0}}>{modalMode==='add' ? 'Ajouter' : 'Modifier'} {modalEntity}</h3>
                {modalEntity==='book' ? (
                  <form onSubmit={submitBook}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                      <div>
                        <label style={{color:text}}>Titre</label>
                        <input value={formData.title||''} onChange={e=>setFormData({...formData,title:e.target.value})} style={{width:'100%',background:cardBg,border:`1px solid ${cardBorder}`,color:text,padding:8,borderRadius:8}} />
                      </div>
                      <div>
                        <label style={{color:text}}>Auteur</label>
                        <select
                          value={selectedAuthor}
                          onChange={(e)=>{
                            const val = e.target.value
                            setSelectedAuthor(val)
                            setNewAuthor('')
                            setFormData(prev=>({...prev,author:val}))
                          }}
                          style={{width:'100%',background:cardBg,border:`1px solid ${cardBorder}`,color:text,padding:8,borderRadius:8,marginBottom:8}}
                        >
                          <option value="">-- Choisir un auteur --</option>
                          {authors.map(a=> <option key={a.id} value={a.name}>{a.name}</option>)}
                        </select>
                        <input
                          placeholder="Ou saisir un nouvel auteur"
                          value={newAuthor}
                          onChange={(e)=>{
                            setNewAuthor(e.target.value)
                            setSelectedAuthor('')
                            setFormData(prev=>({...prev,author:e.target.value}))
                          }}
                          disabled={!!selectedAuthor}
                          style={{width:'100%',background:cardBg,border:`1px solid ${cardBorder}`,color:selectedAuthor?textMuted:text,padding:8,borderRadius:8}}
                        />
                      </div>
                      <div>
                        <label style={{color:text}}>Catégorie</label>
                        <select
                          value={selectedCategory}
                          onChange={(e)=>{
                            const val = e.target.value
                            setSelectedCategory(val)
                            setNewCategory('')
                            setFormData(prev=>({...prev,category:val}))
                          }}
                          style={{width:'100%',background:cardBg,border:`1px solid ${cardBorder}`,color:text,padding:8,borderRadius:8,marginBottom:8}}
                        >
                          {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                        </select>
                        <input
                          placeholder="Ou saisir une nouvelle catégorie"
                          value={newCategory}
                          onChange={(e)=>{
                            setNewCategory(e.target.value)
                            setSelectedCategory('')
                            setFormData(prev=>({...prev,category:e.target.value}))
                          }}
                          disabled={!!selectedCategory}
                          style={{width:'100%',background:cardBg,border:`1px solid ${cardBorder}`,color:selectedCategory?textMuted:text,padding:8,borderRadius:8}}
                        />
                      </div>
                      <div>
                        <label style={{color:text}}>Date publication</label>
                        <input type="date" value={formData.published_at||''} onChange={e=>setFormData({...formData,published_at:e.target.value})} style={{width:'100%',background:cardBg,border:`1px solid ${cardBorder}`,color:text,padding:8,borderRadius:8}} />
                      </div>
                      <div style={{gridColumn:'1/3'}}>
                        <label style={{color:text}}>Description</label>
                        <textarea value={formData.description||''} onChange={e=>setFormData({...formData,description:e.target.value})} rows={4} style={{width:'100%',background:cardBg,border:`1px solid ${cardBorder}`,color:text,padding:8,borderRadius:8}} />
                      </div>
                      <div>
                        <label style={{color:text}}>Fichier PDF</label>
                        <input type="file" accept="application/pdf" onChange={e=>setPdfFile(e.target.files[0]||null)} style={{width:'100%'}} />
                      </div>
                      <div>
                        <label style={{color:text}}>Cover</label>
                        <input type="file" accept="image/*" onChange={e=>setCoverFile(e.target.files[0]||null)} style={{width:'100%'}} />
                      </div>
                    </div>
                    <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12}}>
                      <button type="button" onClick={()=>setModalOpen(false)} style={{background:cardBg,color:text,border:`1px solid ${cardBorder}`,padding:'8px 12px',borderRadius:8}}>Annuler</button>
                      <button type="submit" style={{background:accent,color:'#000',border:'none',padding:'8px 12px',borderRadius:8}}>{modalMode==='add' ? 'Créer' : 'Sauvegarder'}</button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={submitEntity}>
                    <div style={{display:'flex',gap:8}}>
                      <input value={formData.name||''} onChange={e=>setFormData({...formData,name:e.target.value})} placeholder="Nom" style={{flex:1,background:cardBg,border:`1px solid ${cardBorder}`,color:text,padding:10,borderRadius:8}} />
                      <button type="button" onClick={()=>setModalOpen(false)} style={{background:cardBg,color:text,border:`1px solid ${cardBorder}`,padding:'8px 12px',borderRadius:8}}>Annuler</button>
                      <button type="submit" style={{background:accent,color:'#000',border:'none',padding:'8px 12px',borderRadius:8}}>{modalMode==='add' ? 'Créer' : 'Sauvegarder'}</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
