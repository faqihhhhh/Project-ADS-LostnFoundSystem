import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/shared/Navbar'
import Badge from '../../components/shared/Badge'
import Footer from '../../components/shared/Footer'
import api from '../../services/api'

export default function RekomendasiMatch() {
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      // Backend mungkin butuh endpoint khusus mahasiswa untuk melihat match miliknya
      // Untuk sementara kita filter dari list barang atau gunakan endpoint notifikasi
      // Namun idealnya ada endpoint /matches/me
      const res = await api.get('/notifications')
      const matchNotifs = res.data.filter(n => n.judul.toLowerCase().includes('cocok'))
      setMatches(matchNotifs)
    } catch {
      setMatches([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Rekomendasi Barang Cocok</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sistem mendeteksi barang-barang berikut mungkin adalah milikmu atau yang kamu cari
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-white border border-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg py-16 text-center">
            <p className="text-gray-500">Belum ada rekomendasi yang cocok saat ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map(m => (
              <div key={m.id} className="bg-white border border-gray-200 rounded-lg p-5 flex gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{m.judul}</p>
                  <p className="text-sm text-gray-600 mt-1">{m.pesan}</p>
                  <button 
                    onClick={() => navigate('/')} 
                    className="mt-3 text-xs font-medium text-blue-700 hover:underline"
                  >
                    Cek Katalog Sekarang →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
