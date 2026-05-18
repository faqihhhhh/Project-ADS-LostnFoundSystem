import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/shared/Navbar'
import Badge from '../../components/shared/Badge'
import api from '../../services/api'

const KATEGORI = ['semua', 'elektronik', 'dompet', 'kunci', 'kartu', 'pakaian', 'tas', 'botol', 'lainnya']
const STATUS   = ['semua', 'OPEN', 'PENDING', 'CLOSED', 'EXPIRED']

export default function KelolaBarang() {
  const navigate = useNavigate()

  const [items, setItems]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [tipe, setTipe]               = useState('semua')
  const [kategori, setKategori]       = useState('semua')
  const [status, setStatus]           = useState('semua')
  const [search, setSearch]           = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Modal hapus
  const [showHapus, setShowHapus]       = useState(false)
  const [hapusTarget, setHapusTarget]   = useState(null)
  const [hapusLoading, setHapusLoading] = useState(false)
  const [hapusError, setHapusError]     = useState('')

  // Modal detail
  const [showDetail, setShowDetail] = useState(false)
  const [detailItem, setDetailItem] = useState(null)

  useEffect(() => { fetchItems() }, [tipe, kategori, status, search])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await api.get('/items/admin/all')
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

  const handleHapus = async () => {
    if (!hapusTarget) return
    setHapusLoading(true)
    setHapusError('')
    try {
      await api.delete(`/items/${hapusTarget.id}`)
      setShowHapus(false)
      setHapusTarget(null)
      fetchItems()
    } catch (err) {
      setHapusError(err.response?.data?.detail || 'Gagal menghapus barang')
    } finally {
      setHapusLoading(false)
    }
  }

  const openHapus = (item) => {
    setHapusTarget(item)
    setHapusError('')
    setShowHapus(true)
  }

  const openDetail = (item) => {
    setDetailItem(item)
    setShowDetail(true)
  }

  const formatTanggal = (dateStr) => new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  // Filter lokal
  const filtered = items.filter(item => {
    if (tipe !== 'semua'     && item.tipe     !== tipe)     return false
    if (kategori !== 'semua' && item.kategori !== kategori) return false
    if (status !== 'semua'   && item.status   !== status)   return false
    if (search && !item.nama_publik.toLowerCase().includes(search.toLowerCase()) &&
        !item.lokasi_ditemukan?.toLowerCase().includes(search.toLowerCase()) &&
        !(item.lokasi_kemungkinan || []).join(' ').toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    return true
  })

  // Stats
  const stats = {
    total:   items.length,
    open:    items.filter(i => i.status === 'OPEN').length,
    pending: items.filter(i => i.status === 'PENDING').length,
    closed:  items.filter(i => i.status === 'CLOSED').length,
    expired: items.filter(i => i.status === 'EXPIRED').length,
    lost:    items.filter(i => i.tipe === 'LOST').length,
    found:   items.filter(i => i.tipe === 'FOUND').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Barang</h1>
            <p className="text-sm text-gray-500 mt-1">
              Lihat dan kelola semua laporan barang di sistem
            </p>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="text-sm text-blue-700 border border-blue-200 px-4 py-2 rounded-md hover:bg-blue-50"
          >
            ← Dashboard
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Barang', value: stats.total,   color: 'text-gray-900',   bg: 'bg-white' },
            { label: 'Masih OPEN',   value: stats.open,    color: 'text-blue-700',   bg: 'bg-blue-50' },
            { label: 'PENDING',      value: stats.pending, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'CLOSED',       value: stats.closed,  color: 'text-green-600',  bg: 'bg-green-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border border-gray-200 rounded-lg p-4 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Filter Sidebar ── */}
          <div className="w-full lg:w-56 shrink-0 space-y-4">

            {/* Search */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Pencarian</h2>
              <form onSubmit={handleSearch} className="space-y-2">
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Nama atau lokasi..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
                <button type="submit"
                  className="w-full bg-blue-700 text-white text-sm font-medium py-2 rounded-md hover:bg-blue-800">
                  Cari
                </button>
                {search && (
                  <button type="button"
                    onClick={() => { setSearch(''); setSearchInput('') }}
                    className="w-full border border-gray-200 text-gray-500 text-sm py-1.5 rounded-md hover:bg-gray-50">
                    Reset
                  </button>
                )}
              </form>
            </div>

            {/* Filter Tipe */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Tipe</h2>
              <div className="space-y-1">
                {[
                  { label: 'Semua',                   value: 'semua' },
                  { label: `LOST (${stats.lost})`,    value: 'LOST' },
                  { label: `FOUND (${stats.found})`,  value: 'FOUND' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => setTipe(opt.value)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
                      tipe === opt.value
                        ? 'bg-blue-700 text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Status</h2>
              <div className="space-y-1">
                {STATUS.map(s => (
                  <button key={s} onClick={() => setStatus(s)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors capitalize ${
                      status === s
                        ? 'bg-blue-700 text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                    {s === 'semua' ? 'Semua Status' : s}
                    {s !== 'semua' && (
                      <span className="ml-1 text-xs opacity-70">
                        ({items.filter(i => i.status === s).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Kategori */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Kategori</h2>
              <div className="space-y-1">
                {KATEGORI.map(k => (
                  <button key={k} onClick={() => setKategori(k)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-md capitalize transition-colors ${
                      kategori === k
                        ? 'bg-blue-700 text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                    {k === 'semua' ? 'Semua Kategori' : k}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Tabel Barang ── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">

              {/* Table Header */}
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  {filtered.length} barang ditemukan
                  {search && <span className="text-gray-400"> untuk "{search}"</span>}
                </p>
              </div>

              {loading ? (
                <div className="divide-y divide-gray-100">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                      <div className="w-12 h-12 bg-gray-100 rounded-md shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-100 rounded w-1/3" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                      <div className="h-6 w-16 bg-gray-100 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">Tidak ada barang ditemukan</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filtered.map(item => {
                    const foto   = item.foto?.[0]?.url
                    const lokasi = item.tipe === 'FOUND'
                      ? item.lokasi_ditemukan
                      : item.lokasi_kemungkinan?.[0]

                    return (
                      <div key={item.id}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">

                        {/* Foto */}
                        <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden shrink-0">
                          {foto ? (
                            <img src={`${import.meta.env.VITE_API_URL}${foto}`}
                              alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {item.nama_publik}
                            </p>
                            <Badge text={item.tipe} />
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="capitalize">{item.kategori}</span>
                            {lokasi && (
                              <>
                                <span>·</span>
                                <span className="truncate">{lokasi}</span>
                              </>
                            )}
                            <span>·</span>
                            <span>{formatTanggal(item.created_at)}</span>
                          </div>
                          {item.expired_at && item.status === 'OPEN' && (
                            <p className="text-xs text-yellow-500 mt-0.5">
                              Expired: {formatTanggal(item.expired_at)}
                            </p>
                          )}
                        </div>

                        {/* Status */}
                        <Badge text={item.status} />

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openDetail(item)}
                            className="p-1.5 text-gray-400 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                            title="Lihat detail"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => navigate(`/barang/${item.id}`)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="Buka halaman publik"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openHapus(item)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Hapus barang"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL DETAIL ── */}
      {showDetail && detailItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Detail Barang (Admin View)</h2>
              <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Foto */}
            {detailItem.foto?.length > 0 && (
              <div className="flex gap-2 mb-4 flex-wrap">
                {detailItem.foto.map((f, i) => (
                  <a key={i} href={`${import.meta.env.VITE_API_URL}${f.url}`} target="_blank" rel="noreferrer">
                    <img src={`${import.meta.env.VITE_API_URL}${f.url}`} alt=""
                      className="w-24 h-24 object-cover rounded-md border border-gray-200 hover:opacity-80" />
                  </a>
                ))}
              </div>
            )}

            {/* Info Grid */}
            <div className="space-y-3">
              {[
                { label: 'ID',                   value: `#${detailItem.id}` },
                { label: 'Tipe',                 value: detailItem.tipe },
                { label: 'Status',               value: detailItem.status },
                { label: 'Kategori',             value: detailItem.kategori },
                { label: 'Nama Publik',          value: detailItem.nama_publik },
                { label: 'Deskripsi Detail',     value: detailItem.deskripsi_detail || '-' },
                { label: 'Lokasi Ditemukan',     value: detailItem.lokasi_ditemukan || '-' },
                { label: 'Lokasi Sekarang',      value: detailItem.lokasi_sekarang || '-' },
                { label: 'Kemungkinan Lokasi',   value: detailItem.lokasi_kemungkinan?.join(', ') || '-' },
                { label: 'Tanggal Kejadian',     value: detailItem.tanggal ? new Date(detailItem.tanggal).toLocaleString('id-ID') : '-' },
                { label: 'Dilaporkan',           value: detailItem.created_at ? new Date(detailItem.created_at).toLocaleString('id-ID') : '-' },
                { label: 'Expired At',           value: detailItem.expired_at ? new Date(detailItem.expired_at).toLocaleString('id-ID') : '-' },
                { label: 'User ID',              value: `#${detailItem.user_id}` },
              ].map(row => (
                <div key={row.label} className="flex gap-3">
                  <p className="text-xs text-gray-400 w-36 shrink-0 pt-0.5">{row.label}</p>
                  <p className="text-sm text-gray-700 flex-1 capitalize">{row.value}</p>
                </div>
              ))}
            </div>

            {/* Bukti Kepemilikan */}
            {detailItem.bukti_kepemilikan?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2">Bukti Kepemilikan:</p>
                <div className="flex gap-2 flex-wrap">
                  {detailItem.bukti_kepemilikan.map((url, i) => (
                    <a key={i} href={`${import.meta.env.VITE_API_URL}${url}`} target="_blank" rel="noreferrer">
                      <img src={`${import.meta.env.VITE_API_URL}${url}`} alt=""
                        className="w-20 h-20 object-cover rounded-md border border-gray-200 hover:opacity-80" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <button onClick={() => { setShowDetail(false); openHapus(detailItem) }}
                className="flex-1 border border-red-200 text-red-600 text-sm font-medium py-2 rounded-md hover:bg-red-50">
                Hapus Barang
              </button>
              <button onClick={() => setShowDetail(false)}
                className="flex-1 bg-blue-700 text-white text-sm font-medium py-2 rounded-md hover:bg-blue-800">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL HAPUS ── */}
      {showHapus && hapusTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-gray-900 text-center mb-1">
              Hapus Barang?
            </h2>
            <p className="text-sm text-gray-500 text-center mb-2">
              <span className="font-medium text-gray-700">"{hapusTarget.nama_publik}"</span> akan
              dihapus permanen dari sistem beserta semua foto dan klaimnya.
            </p>
            <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-md mb-4">
              <p className="text-xs text-red-600 text-center">Tindakan ini tidak dapat dibatalkan.</p>
            </div>

            {hapusError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md mb-3">{hapusError}</p>
            )}

            <div className="flex gap-2">
              <button onClick={() => setShowHapus(false)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-md hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleHapus} disabled={hapusLoading}
                className="flex-1 bg-red-600 text-white text-sm font-medium py-2 rounded-md hover:bg-red-700 disabled:opacity-60">
                {hapusLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
