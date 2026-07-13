import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Readings from './pages/Readings'
import Rosary from './pages/Rosary'
import Struggle from './pages/Struggle'
import Register from './pages/Register'
import Login from './pages/Login'
import Saint from './pages/Saint'
import ExaminationOfConscience from './pages/ExaminationOfConscience'
import Prayers from './pages/Prayers'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <div className="app-content">
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
              <Route path="/struggle" element={
                <ProtectedRoute><Struggle /></ProtectedRoute>
              } />
              <Route path="/saint" element={
                <ProtectedRoute><Saint /></ProtectedRoute>
              } />
              <Route path="/examination" element={
                <ProtectedRoute><ExaminationOfConscience /></ProtectedRoute>
              } />

              <Route path="/prayers" element={
                <ProtectedRoute><Prayers /></ProtectedRoute>
              } />
            </Routes>
          </div>
          <NavBar />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App