import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from '../pages/AuthPage'
import Home from '../pages/Home'
import Dashboard from '../pages/Dashboard'
import Books from '../pages/Books'
import BookDetails from '../pages/BookDetails'
import Profile from '../pages/Profile'
import AdminPanel from '../pages/AdminPanel'
import Chatbot from '../pages/Chatbot'
import Contact from '../pages/Contact'
import LiveChat from '../pages/LiveChat'
import QuizArena from '../pages/QuizArena'
import { AuthContext } from '../context/AuthContext'

const RequireAuth = ({ children }) => {
  const { user } = useContext(AuthContext)
  if (!user) return <Navigate to="/login" replace />
  return children
}

const RequireAdmin = ({ children }) => {
  const { user } = useContext(AuthContext)
  if (!user || user.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

export default function AppRoutes(){
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/login" element={<AuthPage/>} />
      <Route path="/dashboard" element={<RequireAuth><Dashboard/></RequireAuth>} />
      <Route path="/books" element={<Books/>} />
      <Route path="/books/:id" element={<BookDetails/>} />
      <Route path="/profile" element={<Profile/>} />
      <Route path="/contact" element={<Contact/>} />
      <Route path="/admin" element={<RequireAdmin><AdminPanel/></RequireAdmin>} />
      <Route path="/chat" element={<Chatbot/>} />
      <Route path="/live-chat" element={<RequireAuth><LiveChat/></RequireAuth>} />
      <Route path="/quiz" element={<RequireAuth><QuizArena/></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
