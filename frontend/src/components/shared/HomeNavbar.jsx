import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function HomeNavbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Jadi solid saat di-scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/beranda')
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || menuOpen
        ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
        : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/beranda" className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
              scrolled ? 'bg-blue-600' : 'bg-white/20 backdrop-blur-sm border border-white/30'
            }`}>
              <span className={`font-bold text-sm ${scrolled ? 'text-white' : 'text-white'}`}>LF</span>
            </div>
            <span className={`font-bold text-base hidden sm:block transition-colors ${
              scrolled ? 'text-gray-900' : 'text-white'
            }`}>
              IPB Lost &amp; Found
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-7">
            {[
              { label: 'Beranda',         to: '/beranda' },
              { label: 'Database Barang', to: '/' },
              { label: 'Leaderboard',     to: '/leaderboard' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:opacity-80 ${
                  scrolled ? 'text-gray-700 hover:text-blue-700' : 'text-white/90 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <span className={`text-sm transition-colors ${scrolled ? 'text-gray-600' : 'text-white/80'}`}>
                  Halo, <span className="font-semibold">{user.nama?.split(' ')[0]}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className={`text-sm font-medium px-4 py-1.5 rounded-md border transition-colors ${
                    scrolled
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'border-white/40 text-white hover:bg-white/10'
                  }`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-sm font-medium px-4 py-1.5 rounded-md border transition-colors ${
                    scrolled
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'border-white/40 text-white hover:bg-white/10'
                  }`}
                >
                  Sign in
                </Link>
                <Link
                  to="/login"
                  className="text-sm font-semibold px-4 py-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-700 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-1"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className={`w-6 h-6 transition-colors ${scrolled || menuOpen ? 'text-gray-700' : 'text-white'}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 flex flex-col gap-3 pb-5">
            {[
              { label: 'Beranda',         to: '/beranda' },
              { label: 'Database Barang', to: '/' },
              { label: 'Leaderboard',     to: '/leaderboard' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-gray-700 hover:text-blue-700"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100 flex gap-2">
              {user ? (
                <button onClick={handleLogout}
                  className="flex-1 text-sm font-medium py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center text-sm font-medium py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    Sign in
                  </Link>
                  <Link to="/login" onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center text-sm font-semibold py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
