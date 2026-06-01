import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/shared/Navbar'
import Badge from '../../components/shared/Badge'
import api from '../../services/api'

const KATEGORI = [
  'semua', 'elektronik', 'dompet', 'kunci', 'kartu', 'pakaian', 'tas', 'botol', 'lainnya'
]

const LOKASI = [
  { label: 'Semua Lokasi', value: 'semua' },
  { label: 'Common Class Room (CCR)', value: 'Common Class Room (CCR)' },
  { label: 'Gedung Kuliah Bersama (GKB)', value: 'Gedung Kuliah Bersama (GKB)' },
  { label: 'Perpustakaan Pusat', value: 'Perpustakaan Pusat' },
  { label: 'Masjid Al-Hurriyyah', value: 'Masjid Al-Hurriyyah' },
  { label: 'Gymnasium', value: 'Gymnasium' },
  { label: 'Auditorium Andi Hakim Nasoetion', value: 'Auditorium Andi Hakim Nasoetion' },
  { label: 'Asrama Putra (Astra)', value: 'Asrama Putra (Astra)' },
  { label: 'Asrama Putri (Astri)', value: 'Asrama Putri (Astri)' },
  { label: 'Kantin Stevia', value: 'Kantin Stevia' },
  { label: 'Kantin Ungu', value: 'Kantin Ungu' },
  { label: 'Blue Corner', value: 'Blue Corner' },
  { label: 'Yellow Corner', value: 'Yellow Corner' },
  { label: 'Kantin Nays', value: 'Kantin Nays' },
  { label: 'Kantin Rimbawan', value: 'Kantin Rimbawan' },
  { label: 'Kantin Sapta', value: 'Kantin Sapta' },
  { label: 'Kantin Plasma', value: 'Kantin Plasma' },
  { label: 'Kantin Empat (Kanpat)', value: 'Kantin Empat (Kanpat)' },
  { label: 'Kantin Ibu Sayang', value: 'Kantin Ibu Sayang' },
  { label: 'Kantin Makjan', value: 'Kantin Makjan' },
  { label: 'Fakultas Pertanian (Faperta)', value: 'Fakultas Pertanian (Faperta)' },
  { label: 'Fakultas Kedokteran Hewan (FKH)', value: 'Fakultas Kedokteran Hewan (FKH)' },
  { label: 'Fakultas Perikanan dan Ilmu Kelautan (FPIK)', value: 'Fakultas Perikanan dan Ilmu Kelautan (FPIK)' },
  { label: 'Fakultas Peternakan (Fapet)', value: 'Fakultas Peternakan (Fapet)' },
  { label: 'Fakultas Kehutanan dan Lingkungan (Fahutan)', value: 'Fakultas Kehutanan dan Lingkungan (Fahutan)' },
  { label: 'Fakultas Teknologi Pertanian (Fateta)', value: 'Fakultas Teknologi Pertanian (Fateta)' },
  { label: 'Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA)', value: 'Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA)' },
  { label: 'Fakultas Ekonomi dan Manajemen (FEM)', value: 'Fakultas Ekonomi dan Manajemen (FEM)' },
  { label: 'Fakultas Ekologi Manusia (FEMA)', value: 'Fakultas Ekologi Manusia (FEMA)' },
  { label: 'Sekolah Kedokteran Hewan and Biomedis (SKHB)', value: 'Sekolah Kedokteran Hewan and Biomedis (SKHB)' },
  { label: 'Sekolah Bisnis (SB)', value: 'Sekolah Bisnis (SB)' },
  { label: 'Sekolah Vokasi (SV)', value: 'Sekolah Vokasi (SV)' },
  { label: 'Halte Bus / Lintas', value: 'Halte Bus / Lintas' },
  { label: 'Area Jalanan Kampus', value: 'Area Jalanan Kampus' },
  { label: 'Lainnya', value: 'Lainnya' },
]

const PERIODE = [
  { label: 'Semua Waktu', value: 'all_time' },
  { label: 'Hari Ini', value: 'today' },
  { label: 'Minggu Ini', value: 'this_week' },
  { label: 'Bulan Ini', value: 'this_month' },
]

const STATUS_OPTS = [
  { label: 'Semua Status', value: 'semua' },
  { label: 'OPEN', value: 'OPEN' },
  { label: 'PENDING', value: 'PENDING' },
  { label: 'CLOSED', value: 'CLOSED' },
  { label: 'EXPIRED', value: 'EXPIRED' },
]

export default function KelolaBarang() {
  const navigate = useNavigate()

  const [items, setItems]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [tipe, setTipe]               = useState('semua')
  const [kategori, setKategori]       = useState('semua')
  const [status, setStatus]           = useState('semua')
  const [lokasi, setLokasi]           = useState('semua')
  const [period, setPeriod]           = useState('all_time')
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

  useEffect(() => { fetchItems() }, [tipe, kategori, status, lokasi, period, search])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = {}
      if (tipe !== 'semua')     params.tipe     = tipe
      if (kategori !== 'semua') params.kategori  = kategori
      if (lokasi !== 'semua')   params.lokasi    = lokasi
      if (period !== 'all_time') params.period   = period
      if (status !== 'semua')   params.status    = status
      if (search)               params.q         = search

      const res = await api.get('/items/admin/all', { params })
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

  // Stats (Based on current items in memory)
  const stats = {
    total:   items.length,
    open:    items.filter(i => i.status === 'OPEN').length,
    pending: items.filter(i => i.status === 'PENDING').length,
    closed:  items.filter(i => i.status === 'CLOSED').length,
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
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

        {/* Search Bar (Like Katalog) */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Cari nama barang..."
            className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-700"
          />
          <button
            type="submit"
            className="bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors"
          >
            Cari
          </button>
          {(search || kategori !== 'semua' || lokasi !== 'semua' || period !== 'all_time' || status !== 'semua' || tipe !== 'semua') && (
            <button
              type="button"
              onClick={() => { 
                setSearch(''); 
                setSearchInput('');
                setKategori('semua');
                setLokasi('semua');
                setPeriod('all_time');
                setStatus('semua');
                setTipe('semua');
              }}
              className="px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-500 hover:bg-gray-100"
            >
              Reset
            </button>
          )}
        </form>

        {/* Tipe Toggle (Like Katalog) */}
        <div className="flex gap-2 mb-6">
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
              {opt.value === 'LOST'  && ` (${stats.lost})`}
              {opt.value === 'FOUND' && ` (${stats.found})`}
            </button>
          ))}
        </div>

        {/* Dropdown Filters (Like Katalog + Status) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <div className="relative">
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-md px-3 py-2 pr-9 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-700"
              >
                {STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Kategori</label>
            <div className="relative">
              <select
                value={kategori}
                onChange={e => setKategori(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-md px-3 py-2 pr-9 text-sm capitalize cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-700"
              >
                {KATEGORI.map(k => <option key={k} value={k}>{k === 'semua' ? 'Semua Kategori' : k}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Lokasi</label>
            <div className="relative">
              <select
                value={lokasi}
                onChange={e => setLokasi(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-md px-3 py-2 pr-9 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-700"
              >
                {LOKASI.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Waktu</label>
            <div className="relative">
              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-md px-3 py-2 pr-9 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-700"
              >
                {PERIODE.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Barang */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              {items.length} barang ditemukan
            </p>
          </div>

          {loading ? (
            <div className="divide-y divide-gray-100">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                  <div className="w-12 h-12 bg-gray-100 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <p>Tidak ada barang ditemukan</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map(item => {
                const foto = item.foto?.[0]?.url
                return (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden shrink-0">
                      {foto && (
                        <img
                          src={foto.startsWith('http') ? foto : `${import.meta.env.VITE_API_URL}${foto}`}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.nama_publik}</p>
                        <Badge text={item.tipe} />
                      </div>
                      <p className="text-xs text-gray-400 capitalize">
                        {item.kategori} · {formatTanggal(item.created_at)}
                      </p>
                    </div>
                    <Badge text={item.status} />
                    <div className="flex items-center gap-1">
                      <button onClick={() => openDetail(item)} className="p-1.5 text-gray-400 hover:text-blue-700 rounded-md">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth={2} /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeWidth={2} /></svg>
                      </button>
                      <button onClick={() => openHapus(item)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth={2} /></svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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
                  <a key={i} href={f.url.startsWith('http') ? f.url : `${import.meta.env.VITE_API_URL}${f.url}`} target="_blank" rel="noreferrer">
                    <img src={f.url.startsWith('http') ? f.url : `${import.meta.env.VITE_API_URL}${f.url}`} alt=""
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
                { label: 'Pelapor',              value: detailItem.user_nama || '-' },
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
                    <a key={i} href={url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`} target="_blank" rel="noreferrer">
                      <img src={url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`} alt=""
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
