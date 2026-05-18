import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/shared/Navbar'
import ItemCard from '../../components/shared/ItemCard'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const KATEGORI = [
  'semua', 'elektronik', 'dompet', 'kunci', 'kartu', 'pakaian', 'tas', 'botol', 'lainnya'
]

export default function Katalog() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [tipe, setTipe]         = useState('semua')       // semua | LOST | FOUND
  const [kategori, setKategori] = useState('semua')
  const [search, setSearch]     = useState('')
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    fetchItems()
  }, [tipe, kategori, search])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = {}
      if (tipe !== 'semua')     params.tipe     = tipe
      if (kategori !== 'semua') params.kategori  = kategori
      if (search)               params.q         = search
      const res = await api.get('/items', { params })
      setItems(res.data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const lostItems  = items.filter(i => i.tipe === 'LOST')
  const foundItems = items.filter(i => i.tipe === 'FOUND')

  const displayItems = tipe === 'semua'
    ? items
    : tipe === 'LOST' ? lostItems : foundItems

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── KIRI: Main Content ── */}
          <div className="flex-1">

            {/* Page Title */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Katalog Barang</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {items.length} barang ditemukan
                </p>
              </div>
              {user?.role === 'mahasiswa' && (
                <button
                  onClick={() => navigate('/lapor')}
                  className="bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-800 transition-colors hidden sm:block"
                >
                  + Lapor Barang
                </button>
              )}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Cari nama barang atau lokasi..."
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
              <button
                type="submit"
                className="bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors"
              >
                Cari
              </button>
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setSearchInput('') }}
                  className="px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-500 hover:bg-gray-100"
                >
                  Reset
                </button>
              )}
            </form>

            {/* Filter Tipe Toggle */}
            <div className="flex gap-2 mb-4">
              {[
                { label: 'Semua', value: 'semua' },
                { label: 'Barang Hilang', value: 'LOST' },
                { label: 'Barang Temuan', value: 'FOUND' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTipe(opt.value)}
                  className={`text-sm font-medium px-4 py-1.5 rounded-md transition-colors ${
                    tipe === opt.value
                      ? 'bg-blue-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                  {opt.value === 'LOST'  && ` (${lostItems.length})`}
                  {opt.value === 'FOUND' && ` (${foundItems.length})`}
                </button>
              ))}
            </div>

            {/* Filter Kategori */}
            <div className="relative mb-6">
              <label className="block text-xs font-medium text-gray-500 mb-1">Kategori</label>
              <div className="relative">
                <select
                  value={kategori}
                  onChange={e => setKategori(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-md px-3 py-2 pr-9 text-sm text-gray-700 capitalize cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-colors"
                >
                  {KATEGORI.map(k => (
                    <option key={k} value={k} className="capitalize">
                      {k.charAt(0).toUpperCase() + k.slice(1)}
                    </option>
                  ))}
                </select>
                {/* Chevron icon */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Grid Items */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-100" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">Tidak ada barang ditemukan</p>
                <p className="text-gray-400 text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {displayItems.map(item => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* ── KANAN: Sidebar Info ── */}
          <div className="w-full lg:w-72 shrink-0 space-y-4">

            {/* Statistik */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistik</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Barang</span>
                  <span className="text-sm font-bold text-gray-900">{items.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Barang Hilang</span>
                  <span className="text-sm font-bold text-red-600">{lostItems.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Barang Temuan</span>
                  <span className="text-sm font-bold text-green-600">{foundItems.length}</span>
                </div>
              </div>
            </div>

            {/* CTA Mahasiswa */}
            {user?.role === 'mahasiswa' && (
              <div className="bg-blue-700 rounded-lg p-5">
                <h2 className="text-base font-semibold text-white mb-1">Kehilangan sesuatu?</h2>
                <p className="text-blue-200 text-sm mb-4">
                  Laporkan barang hilangmu agar orang lain bisa membantumu menemukan.
                </p>
                <button
                  onClick={() => navigate('/lapor')}
                  className="w-full bg-white text-blue-700 text-sm font-medium py-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Lapor Sekarang
                </button>
              </div>
            )}

            {/* CTA Guest */}
            {!user && (
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-1">Punya akun IPB?</h2>
                <p className="text-gray-500 text-sm mb-4">
                  Login untuk melaporkan barang hilang atau mengajukan klaim barang temuan.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-blue-700 text-white text-sm font-medium py-2 rounded-md hover:bg-blue-800 transition-colors"
                >
                  Login Sekarang
                </button>
              </div>
            )}

            {/* Info Sistem */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Cara Kerja</h2>
              <div className="space-y-3">
                {[
                  { no: '1', text: 'Temukan barang? Lapor ke sistem' },
                  { no: '2', text: 'Kehilangan? Buat laporan barang hilang' },
                  { no: '3', text: 'Ajukan klaim jika barang itu milikmu' },
                  { no: '4', text: 'Admin verifikasi dan hubungi kamu' },
                ].map(step => (
                  <div key={step.no} className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-blue-700 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      {step.no}
                    </span>
                    <p className="text-sm text-gray-600">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      {user?.role === 'mahasiswa' && (
        <button
          onClick={() => navigate('/lapor')}
          className="fixed bottom-6 right-6 sm:hidden bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-800 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </div>
  )
}
