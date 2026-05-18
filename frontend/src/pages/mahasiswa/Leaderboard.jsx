import { useState, useEffect } from 'react'
import Navbar from '../../components/shared/Navbar'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function Leaderboard() {
  const { user } = useAuth()

  const [data, setData] = useState(null)
  const [riwayat, setRiwayat] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('leaderboard') // leaderboard | riwayat

  useEffect(() => {
    fetchLeaderboard()
    if (user?.role === 'mahasiswa') fetchRiwayat()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/leaderboard')
      setData(res.data)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchRiwayat = async () => {
    try {
      const res = await api.get('/leaderboard/me/riwayat')
      setRiwayat(res.data)
    } catch {
      setRiwayat([])
    }
  }

  const formatTanggal = (dateStr) => new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  const medalColor = (rank) => {
    if (rank === 1) return 'text-yellow-500'
    if (rank === 2) return 'text-gray-400'
    if (rank === 3) return 'text-amber-600'
    return 'text-gray-300'
  }

  const medalIcon = (rank) => (
    <svg className={`w-5 h-5 ${medalColor(rank)}`} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard Civitas Peduli</h1>
          <p className="text-sm text-gray-500 mt-1">
            Mahasiswa dengan poin tertinggi dari mengembalikan barang temuan
          </p>
        </div>

        {/* Poin Saya — hanya mahasiswa */}
        {user?.role === 'mahasiswa' && data && (
          <div className="bg-blue-700 rounded-lg p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Total Poin Kamu</p>
              <p className="text-white text-3xl font-bold mt-0.5">{data.poin_saya ?? 0}</p>
              <p className="text-blue-200 text-sm mt-1">
                Peringkat #{data.peringkat_saya ?? '-'} dari semua mahasiswa
              </p>
            </div>
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          </div>
        )}

        {/* Tab — hanya mahasiswa */}
        {user?.role === 'mahasiswa' && (
          <div className="flex gap-2 mb-4">
            {[
              { label: 'Top 10 Mahasiswa', value: 'leaderboard' },
              { label: 'Riwayat Poin Saya', value: 'riwayat' },
            ].map(t => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`text-sm font-medium px-4 py-1.5 rounded-md transition-colors ${tab === t.value
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Tab: Leaderboard ── */}
        {tab === 'leaderboard' && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {loading ? (
              <div className="divide-y divide-gray-100">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                    <div className="w-8 h-8 bg-gray-100 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                    </div>
                    <div className="h-4 bg-gray-100 rounded w-12" />
                  </div>
                ))}
              </div>
            ) : !data?.top10?.length ? (
              <div className="py-16 text-center">
                <p className="text-gray-400 text-sm">Belum ada data leaderboard</p>
                <p className="text-gray-300 text-xs mt-1">
                  Laporkan barang temuan untuk mendapatkan poin pertamamu!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.top10.map((entry) => {
                  const isMe = data.poin_saya !== null &&
                    entry.peringkat === data.peringkat_saya &&
                    entry.poin === data.poin_saya

                  return (
                    <div
                      key={entry.user_id}
                      className={`flex items-center gap-4 px-5 py-4 transition-colors ${isMe ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                    >
                      {/* Rank */}
                      <div className="w-8 flex items-center justify-center shrink-0">
                        {entry.peringkat <= 3
                          ? medalIcon(entry.peringkat)
                          : <span className="text-sm font-bold text-gray-400">#{entry.peringkat}</span>
                        }
                      </div>

                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-blue-700' : 'bg-gray-100'
                        }`}>
                        <span className={`text-sm font-bold ${isMe ? 'text-white' : 'text-gray-500'}`}>
                          {entry.nama.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isMe ? 'text-blue-700' : 'text-gray-900'
                          }`}>
                          {entry.nama} {isMe && <span className="text-xs font-normal">(Kamu)</span>}
                        </p>
                      </div>

                      {/* Poin */}
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${entry.peringkat === 1 ? 'text-yellow-500' :
                            isMe ? 'text-blue-700' : 'text-gray-700'
                          }`}>
                          {entry.poin} poin
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Footer info */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400 text-center">
                Poin didapat setiap kali barang temuan berhasil dikembalikan ke pemiliknya (+10 poin)
              </p>
            </div>
          </div>
        )}

        {/* ── Tab: Riwayat Poin ── */}
        {tab === 'riwayat' && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {!riwayat.length ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm font-medium">Belum ada poin</p>
                <p className="text-gray-400 text-xs mt-1">
                  Lapor barang temuan dan bantu kembalikan ke pemiliknya untuk mendapat poin!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {riwayat.map((log) => (
                  <div key={log.id} className="flex items-center gap-4 px-5 py-4">
                    {/* Icon */}
                    <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{log.alasan}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatTanggal(log.created_at)}</p>
                    </div>

                    {/* Poin */}
                    <span className="text-sm font-bold text-green-600 shrink-0">
                      +{log.jumlah}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {riwayat.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                <p className="text-xs text-gray-400">{riwayat.length} transaksi poin</p>
                <p className="text-xs font-medium text-gray-700">
                  Total: {riwayat.reduce((sum, l) => sum + l.jumlah, 0)} poin
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info Box — guest */}
        {!user && (
          <div className="mt-4 bg-white border border-gray-200 rounded-lg p-5 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Login untuk melihat poin dan peringkat kamu
            </p>
            <a href="/login"
              className="inline-block bg-blue-700 text-white text-sm font-medium px-6 py-2 rounded-md hover:bg-blue-800">
              Login Sekarang
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
