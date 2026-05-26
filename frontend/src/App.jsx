import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/shared/ProtectedRoute'

import Login          from './pages/Login'
import HomePage       from './pages/HomePage'
import Katalog        from './pages/mahasiswa/Katalog'
import DetailBarang   from './pages/mahasiswa/DetailBarang'
import LaporBarang    from './pages/mahasiswa/LaporBarang'
import Leaderboard    from './pages/mahasiswa/Leaderboard'
import Notifikasi     from './pages/mahasiswa/Notifikasi'
import KlaimSaya      from './pages/mahasiswa/KlaimSaya'
import RekomendasiMatch from './pages/mahasiswa/RekomendasiMatch'
import Dashboard      from './pages/admin/Dashboard'
import KelolaBarang   from './pages/admin/KelolaBarang'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/katalog" element={<Katalog />} />
          <Route path="/barang/:id" element={<DetailBarang />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* Mahasiswa only */}
          <Route path="/lapor" element={
            <ProtectedRoute role="mahasiswa"><LaporBarang /></ProtectedRoute>
          }/>
          <Route path="/notifikasi" element={
            <ProtectedRoute role="mahasiswa"><Notifikasi /></ProtectedRoute>
          }/>
          <Route path="/klaim-saya" element={
            <ProtectedRoute role="mahasiswa"><KlaimSaya /></ProtectedRoute>
          }/>
          <Route path="/rekomendasi" element={
            <ProtectedRoute role="mahasiswa"><RekomendasiMatch /></ProtectedRoute>
          }/>

          {/* Admin only */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin"><Dashboard /></ProtectedRoute>
          }/>
          <Route path="/admin/barang" element={
            <ProtectedRoute role="admin"><KelolaBarang /></ProtectedRoute>
          }/>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
