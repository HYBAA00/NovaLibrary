import React from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function AuthPage(){
  const accent = '#F5A623'
  const bg = '#0a0a0a'
  const text = '#ffffff'
  const cardBg = '#1a1a1a'
  const border = '#2a2a2a'

  const [mode,setMode] = React.useState('login')
  const [email,setEmail] = React.useState('')
  const [password,setPassword] = React.useState('')
  const [error,setError] = React.useState('')
  const [loading,setLoading] = React.useState(false)

  const navigate = useNavigate()
  const { login } = React.useContext(AuthContext)

  const handleLogin = async (e)=>{
    e.preventDefault()
    setError('')
    setLoading(true)
    try{
      const res = await api.post('/auth/login', { email, password })
      const token = res.data?.token || res.data?.accessToken || res.data?.access_token
      if(!token) throw new Error('Token non reçu')
      // store token via AuthContext
      login({}, token)
      // decode payload to read role
      const payload = JSON.parse(atob(token.split('.')[1]))
      const role = payload?.role || payload?.roles || 'USER'
      if(role === 'ADMIN') navigate('/admin')
      else navigate('/dashboard')
    }catch(err){
      setError(err.response?.data?.message || err.message || 'Erreur lors de la connexion')
    }finally{ setLoading(false) }
  }

  const submit = (e)=>{
    if(mode==='login') return handleLogin(e)
    e.preventDefault()
    // registration left unchanged (simple behavior)
    setError('')
    alert('Inscription désactivée dans cette démo')
  }

  return (
    <div style={{minHeight:'100vh',background:bg,color:text,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter, system-ui'}}>
      <div style={{position:'absolute',top:24,left:24,color:accent,fontWeight:800}}>NovaLibrary</div>
      <div style={{width:420,background:cardBg,border:`1px solid ${border}`,padding:28,borderRadius:12}}>
        <div style={{textAlign:'center',color:accent,fontWeight:800,fontSize:28,marginBottom:18}}>NovaLibrary</div>
        <h2 style={{marginTop:0}}>{mode==='login' ? 'Se connecter' : "S'inscrire"}</h2>
        <form onSubmit={submit}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <label style={{color:text, fontWeight:700}}>Email</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="email@exemple.com" style={{background:cardBg,border:`1px solid ${border}`,color:text,padding:10,borderRadius:8}} />
            <label style={{color:text,fontWeight:700}}>Mot de passe</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••" style={{background:cardBg,border:`1px solid ${border}`,color:text,padding:10,borderRadius:8}} />
            <button type="submit" style={{background:accent,color:'#000',padding:12,borderRadius:8,border:'none',fontWeight:800,cursor:'pointer'}} disabled={loading}>{mode==='login'? (loading? 'Connexion...' : 'Se connecter') : "S'inscrire"}</button>
          </div>
        </form>

        {error && <div style={{marginTop:12,color:'#fecaca',background:'#3b0b0b',padding:10,borderRadius:8}}>{error}</div>}

        <div style={{marginTop:12,textAlign:'center',color:'#a0a0a0'}}>
          <a href="#" onClick={(e)=>{e.preventDefault(); setMode(mode==='login'?'register':'login'); setError('')}} style={{color:accent,textDecoration:'none'}}>{mode==='login'? 'Créer un compte' : 'Déjà un compte ? Se connecter'}</a>
        </div>
      </div>
    </div>
  )
}
