import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Readings from './pages/Readings'
import Rosary from './pages/Rosary'
import Examine from './pages/Examine'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/readings" element={<Readings />} />
        <Route path="/rosary" element={<Rosary />} />
        <Route path="/examine" element={<Examine />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App