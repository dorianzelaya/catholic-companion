import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Readings from './pages/Readings'
import Rosary from './pages/Rosary'
import Examine from './pages/Examine'
import Register from './pages/Register'
import Login from './pages/Login'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route path="/home" element={
            <ProtectedRoute><Home /></ProtectedRoute>
          } />
          <Route path="/readings" element={
            <ProtectedRoute><Readings /></ProtectedRoute>
          } />
          <Route path="/rosary" element={
            <ProtectedRoute><Rosary /></ProtectedRoute>
          } />
          <Route path="/examine" element={
            <ProtectedRoute><Examine /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App