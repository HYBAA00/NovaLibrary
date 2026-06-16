import React, { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch(e){ return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  // helper to decode JWT payload
  function decodeJwt(t) {
    try{
      const part = t.split('.')[1]
      const b = part.replace(/-/g, '+').replace(/_/g, '/')
      const padded = b + '='.repeat((4 - b.length % 4) % 4)
      const json = decodeURIComponent(atob(padded).split('').map(function(c){ return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2) }).join(''))
      return JSON.parse(json)
    }catch(e){ return null }
  }

  // persist token/user to localStorage
  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user, token])

  // when token changes, ensure user is populated from token payload (includes name)
  useEffect(() => {
    if (token) {
      const p = decodeJwt(token)
      if (p) {
        setUser(prev => ({ id: p.id, name: p.name || prev?.name, email: p.email || prev?.email, role: p.role || prev?.role }))
      }
    }
  }, [token])

  const login = (userObj, jwt) => {
    if (jwt) {
      const p = decodeJwt(jwt)
      if (p) {
        setUser({ id: p.id, name: p.name, email: p.email, role: p.role })
        setToken(jwt)
        return
      }
    }
    setUser(userObj)
    setToken(jwt || (userObj && userObj.token) || null)
  }
  const logout = () => { setUser(null); setToken(null); }

  const value = { user, token, login, logout, isAuthenticated: !!user }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
