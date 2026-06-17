import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Profile(){
  const navigate = useNavigate()
  const { user } = React.useContext(AuthContext)

  const accent = '#F5A623'
  const bg = '#0a0a0a'
  const text = '#ffffff'
  const textMuted = '#a0a0a0'
  const cardBg = '#1a1a1a'
  const cardBorder = '#2a2a2a'

  function handleLogout(){
    try{ localStorage.removeItem('token'); localStorage.removeItem('user'); }catch(_){}
    window.location.href = '/login'
  }

  function getUserName(){
    return user?.name || 'Utilisateur'
  }

  function getInitial(name){
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
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

  return (
    <div style={{minHeight:'100vh',background:bg,color:text,fontFamily:'Inter,system-ui'}}>
      <NavBar />

      <main style={{padding:'48px 24px',maxWidth:600,margin:'0 auto'}}>
        {/* Profile Card */}
        <div style={{background:cardBg,border:`1px solid ${cardBorder}`,borderRadius:16,padding:36,textAlign:'center',marginBottom:24}}>
          <div style={{width:80,height:80,borderRadius:40,background:accent,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',color:'#000',fontSize:32,fontWeight:800}}>
            {getInitial(user?.name)}
          </div>
          <h1 style={{margin:'0 0 6px',fontSize:24,color:text}}>{user?.name || 'Utilisateur'}</h1>
          <div style={{color:textMuted,fontSize:15,marginBottom:14}}>{user?.email || '—'}</div>
          <span style={{display:'inline-block',background:'rgba(245,166,35,0.12)',color:accent,padding:'5px 14px',borderRadius:999,fontSize:13,fontWeight:700,textTransform:'uppercase'}}>
            {user?.role || 'USER'}
          </span>
        </div>

        {/* Account Info Card */}
        <div style={{background:cardBg,border:`1px solid ${cardBorder}`,borderRadius:16,padding:28}}>
          <h2 style={{marginTop:0,marginBottom:20,fontSize:18}}>Informations du compte</h2>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${cardBorder}`}}>
              <span style={{color:textMuted}}>Nom complet</span>
              <span style={{color:text,fontWeight:600}}>{user?.name || '—'}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${cardBorder}`}}>
              <span style={{color:textMuted}}>Email</span>
              <span style={{color:text,fontWeight:600}}>{user?.email || '—'}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${cardBorder}`}}>
              <span style={{color:textMuted}}>Rôle</span>
              <span style={{color:text,fontWeight:600}}>{user?.role || 'USER'}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0'}}>
              <span style={{color:textMuted}}>ID utilisateur</span>
              <span style={{color:text,fontWeight:600}}>{user?.id || '—'}</span>
            </div>
          </div>

          <div style={{marginTop:24}}>
            <button
              onClick={()=> alert('Modification du profil à venir.')}
              style={{background:accent,color:'#000',border:'none',padding:'12px 20px',borderRadius:10,cursor:'pointer',fontWeight:700,fontSize:14}}
            >
              Modifier le profil
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
