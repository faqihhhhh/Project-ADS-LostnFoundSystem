import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [notifCount, setNotifCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (user?.role === 'mahasiswa') {
      api.get('/notifications')
        .then(res => {
          const unread = res.data.filter(n => !n.is_read).length
          setNotifCount(unread)
        })
        .catch(() => {})
    }
  }, [user, location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  const linkClass = (path) =>
    `text-sm font-medium pb-1 transition-all ${
      isActive(path)
        ? 'text-white border-b-2 border-white'
        : 'text-blue-200 hover:text-white'
    }`

  return (
    <nav className="bg-blue-700 w-full shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-white font-bold text-lg">
              LostnFound
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">

            {/* Guest & Mahasiswa */}
            {user?.role !== 'admin' && (
              <>
                <Link to="/" className={linkClass('/')}>Beranda</Link>
                <Link to="/katalog" className={linkClass('/katalog')}>Database Barang</Link>
                <Link to="/lapor" className={linkClass('/lapor')}>Lapor Barang</Link>
                <Link to="/leaderboard" className={linkClass('/leaderboard')}>Leaderboard</Link>
              </>
            )}

            {/* Mahasiswa only */}
            {user?.role === 'mahasiswa' && (
              <>
                <Link to="/klaim-saya" className={linkClass('/klaim-saya')}>Klaim Saya</Link>

                {/* Notifikasi Bell */}
                <Link to="/notifikasi" className="relative">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* Admin only */}
            {user?.role === 'admin' && (
              <>
                <Link to="/admin" className={linkClass('/admin')}>Dashboard</Link>
                <Link to="/admin/barang" className={linkClass('/admin/barang')}>Kelola Barang</Link>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-blue-200 text-sm">
                  Halo, <span className="text-white font-medium">{user.nama?.split(' ')[0]}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm bg-white text-blue-700 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm bg-white text-blue-700 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-blue-600 py-3 flex flex-col gap-3 pb-4">
            {user?.role !== 'admin' && (
              <>
                <Link to="/" className="text-blue-100 text-sm font-medium"
                  onClick={() => setMenuOpen(false)}>Beranda</Link>
                <Link to="/katalog" className="text-blue-100 text-sm font-medium"
                  onClick={() => setMenuOpen(false)}>Database Barang</Link>
                <Link to="/lapor" className="text-blue-100 text-sm font-medium"
                  onClick={() => setMenuOpen(false)}>Lapor Barang</Link>
                <Link to="/leaderboard" className="text-blue-100 text-sm font-medium"
                  onClick={() => setMenuOpen(false)}>Leaderboard</Link>
              </>
            )}
            {user?.role === 'mahasiswa' && (
              <>
                <Link to="/klaim-saya" className="text-blue-100 text-sm font-medium"
                  onClick={() => setMenuOpen(false)}>Klaim Saya</Link>
                <Link to="/notifikasi" className="text-blue-100 text-sm font-medium"
                  onClick={() => setMenuOpen(false)}>
                  Notifikasi {notifCount > 0 && `(${notifCount})`}
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <Link to="/admin" className="text-blue-100 text-sm font-medium"
                  onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <Link to="/admin/barang" className="text-blue-100 text-sm font-medium"
                  onClick={() => setMenuOpen(false)}>Kelola Barang</Link>
              </>
            )}
            <div className="pt-2 border-t border-blue-600">
              {user ? (
                <button onClick={handleLogout}
                  className="text-sm bg-white text-blue-700 font-medium px-3 py-1.5 rounded-md w-full">
                  Logout
                </button>
              ) : (
                <Link to="/login"
                  className="block text-center text-sm bg-white text-blue-700 font-medium px-3 py-1.5 rounded-md"
                  onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
