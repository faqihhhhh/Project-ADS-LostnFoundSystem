import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/shared/Navbar'
import Footer from '../../components/shared/Footer'
import api from '../../services/api'

export default function Notifikasi() {
  const navigate = useNavigate()

  const [notifs, setNotifs]   = useState([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  useEffect(() => { fetchNotifs() }, [])

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifs(res.data)
    } catch {
      setNotifs([])
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAllRead = async () => {
    setMarking(true)
    try {
      await api.patch('/notifications/read')
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    } finally {
      setMarking(false)
    }
  }

  const unreadCount = notifs.filter(n => !n.is_read).length

  const formatTanggal = (dateStr) => {
    const date = new Date(dateStr)
    const now  = new Date()
    const diff = Math.floor((now - date) / 1000)

    if (diff < 60)    return 'Baru saja'
    if (diff < 3600)  return `${Math.floor(diff / 60)} menit lalu`
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getIcon = (judul) => {
    if (judul.toLowerCase().includes('disetujui') || judul.toLowerCase().includes('ditemukan')) {
      return (
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )
    }
    if (judul.toLowerCase().includes('ditolak')) {
      return (
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )
    }
    if (judul.toLowerCase().includes('poin')) {
      return (
        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      )
    }
    return (
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-0.5">
                {unreadCount} belum dibaca
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={marking}
              className="text-sm text-blue-700 font-medium hover:underline disabled:opacity-50"
            >
              {marking ? 'Menandai...' : 'Tandai semua dibaca'}
            </button>
          )}
        </div>

        {/* List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {loading ? (
            <div className="divide-y divide-gray-100">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4 px-5 py-4 animate-pulse">
                  <div className="w-10 h-10 bg-gray-100 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifs.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium text-sm">Belum ada notifikasi</p>
              <p className="text-gray-400 text-xs mt-1">
                Notifikasi akan muncul saat ada update klaim atau barang yang cocok
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifs.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex gap-4 px-5 py-4 transition-colors ${
                    !notif.is_read ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Icon */}
                  {getIcon(notif.judul)}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${
                        !notif.is_read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notif.judul}
                      </p>
                      {!notif.is_read && (
                        <span className="w-2 h-2 bg-blue-700 rounded-full shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                      {notif.pesan}
                    </p>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {formatTanggal(notif.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kembali */}
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Katalog
        </button>
      </main>

      <Footer />
    </div>
  )
}
