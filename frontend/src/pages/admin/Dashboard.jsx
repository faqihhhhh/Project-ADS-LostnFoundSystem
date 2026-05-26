import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/shared/Navbar'
import Badge from '../../components/shared/Badge'
import api from '../../services/api'

export default function Dashboard() {
  const navigate = useNavigate()

  const [tab, setTab]         = useState('claims')
  const [claims, setClaims]   = useState([])
  const [reports, setReports] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal approve/reject
  const [showModal, setShowModal]         = useState(false)
  const [modalData, setModalData]         = useState(null)
  const [catatan, setCatatan]             = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError]     = useState('')

  // Modal kode pengambilan
  const [showKode, setShowKode]     = useState(false)
  const [kodeData, setKodeData]     = useState(null)
  const [kodeLoading, setKodeLoading] = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [claimRes, reportRes, matchRes] = await Promise.all([
        api.get('/claims'),
        api.get('/found-reports'),
        api.get('/matches'),
      ])
      setClaims(claimRes.data)
      setReports(reportRes.data)
      setMatches(matchRes.data)
    } catch {
      setClaims([]); setReports([]); setMatches([])
    } finally {
      setLoading(false)
    }
  }

  const formatTanggal = (dateStr) => new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const openModal = (type, id, action) => {
    setModalData({ type, id, action })
    setCatatan('')
    setActionError('')
    setShowModal(true)
  }

  const handleAction = async () => {
    if (!modalData) return
    setActionLoading(true)
    setActionError('')
    const { type, id, action } = modalData
    try {
      const endpoint = {
        claim:  `/claims/${id}/${action}`,
        report: `/found-reports/${id}/${action}`,
        match:  `/matches/${id}/${action === 'approve' ? 'confirm' : 'reject'}`,
      }[type]

      await api.patch(`${endpoint}?catatan=${encodeURIComponent(catatan)}`)
      setShowModal(false)
      fetchAll()
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Gagal memproses')
    } finally {
      setActionLoading(false)
    }
  }

  const handleLihatKode = async (claimId) => {
    setKodeLoading(true)
    setKodeData(null)
    setShowKode(true)
    try {
      const res = await api.get(`/claims/${claimId}/kode`)
      setKodeData(res.data)
    } catch {
      setKodeData(null)
    } finally {
      setKodeLoading(false)
    }
  }

  // Stats
  const pendingClaims  = claims.filter(c => c.status === 'PENDING').length
  const pendingReports = reports.filter(r => r.status === 'PENDING').length
  const pendingMatches = matches.filter(m => m.status === 'PENDING').length
  const totalPending   = pendingClaims + pendingReports + pendingMatches

  const TABS = [
    { label: 'Klaim Barang',     value: 'claims',  count: pendingClaims },
    { label: 'Laporan Penemuan', value: 'reports', count: pendingReports },
    { label: 'Auto Match',       value: 'matches', count: pendingMatches },
  ]

  // ── Card komponen ────────────────────────────────────────────────

  const ClaimCard = ({ item }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge text={item.status} />
            <span className="text-xs text-gray-400">#{item.id}</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            Klaim untuk Barang #{item.item_id}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{formatTanggal(item.created_at)}</p>
        </div>
        <button
          onClick={() => navigate(`/barang/${item.item_id}`)}
          className="text-xs text-blue-700 border border-blue-200 px-3 py-1.5 rounded-md hover:bg-blue-50 shrink-0"
        >
          Lihat Barang
        </button>
      </div>

      {/* Ciri yang diisi mahasiswa */}
      <div className="bg-gray-50 border border-gray-100 rounded-md px-4 py-3 mb-3">
        <p className="text-xs text-gray-400 mb-1">Ciri khusus dari pengklaim:</p>
        <p className="text-sm text-gray-700 leading-relaxed">{item.deskripsi_ciri}</p>
      </div>

      {/* Foto bukti */}
      {item.bukti_foto?.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-400 mb-2">Foto bukti kepemilikan:</p>
          <div className="flex gap-2 flex-wrap">
            {item.bukti_foto.map((url, i) => (
              <a key={i} href={`${import.meta.env.VITE_API_URL}${url}`} target="_blank" rel="noreferrer">
                <img src={`${import.meta.env.VITE_API_URL}${url}`} alt=""
                  className="w-20 h-20 object-cover rounded-md border border-gray-200 hover:opacity-80" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Catatan admin kalau sudah diproses */}
      {item.catatan_admin && (
        <div className="px-4 py-2 bg-gray-100 rounded-md mb-3">
          <p className="text-xs text-gray-500">Catatan: {item.catatan_admin}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {item.status === 'PENDING' && (
          <>
            <button onClick={() => openModal('claim', item.id, 'reject')}
              className="flex-1 border border-red-200 text-red-600 text-sm font-medium py-2 rounded-md hover:bg-red-50">
              Tolak
            </button>
            <button onClick={() => openModal('claim', item.id, 'approve')}
              className="flex-1 bg-blue-700 text-white text-sm font-medium py-2 rounded-md hover:bg-blue-800">
              Setujui
            </button>
          </>
        )}
        {item.status === 'APPROVED' && (
          <button onClick={() => handleLihatKode(item.id)}
            className="flex-1 border border-green-200 text-green-700 text-sm font-medium py-2 rounded-md hover:bg-green-50 flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Lihat Kode Pengambilan
          </button>
        )}
      </div>
    </div>
  )

  const ReportCard = ({ item }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge text={item.status} />
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
              Laporan Penemuan
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            Oleh: {item.reporter_nama || `User #${item.reporter_id}`}
          </p>
          <p className="text-xs text-blue-700 font-medium mt-0.5">
            Merespon Barang: {item.lost_item_nama || `#${item.lost_item_id}`}
          </p>
          <p className="text-xs text-gray-400 mt-1">{formatTanggal(item.created_at)}</p>
        </div>
        <button
          onClick={() => navigate(`/barang/${item.lost_item_id}`)}
          className="text-xs text-blue-700 border border-blue-200 px-3 py-1.5 rounded-md hover:bg-blue-50 shrink-0"
        >
          Lihat Barang Hilang
        </button>
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-md px-4 py-3 mb-3">
        <p className="text-xs text-gray-400 mb-1">Deskripsi dari pelapor:</p>
        <p className="text-sm text-gray-700 leading-relaxed">{item.deskripsi}</p>
        {item.lokasi_sekarang && (
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <p className="text-xs text-gray-600 font-medium">{item.lokasi_sekarang}</p>
          </div>
        )}
      </div>

      {item.foto_bukti?.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-400 mb-2">Foto bukti penemuan:</p>
          <div className="flex gap-2 flex-wrap">
            {item.foto_bukti.map((url, i) => (
              <a key={i} href={`${import.meta.env.VITE_API_URL}${url}`} target="_blank" rel="noreferrer">
                <img src={`${import.meta.env.VITE_API_URL}${url}`} alt=""
                  className="w-20 h-20 object-cover rounded-md border border-gray-200 hover:opacity-80" />
              </a>
            ))}
          </div>
        </div>
      )}

      {item.catatan_admin && (
        <div className="px-4 py-2 bg-gray-100 rounded-md mb-3">
          <p className="text-xs text-gray-500">Catatan: {item.catatan_admin}</p>
        </div>
      )}

      <div className="flex gap-2">
        {item.status === 'PENDING' && (
          <>
            <button onClick={() => openModal('report', item.id, 'reject')}
              className="flex-1 border border-red-200 text-red-600 text-sm font-medium py-2 rounded-md hover:bg-red-50">
              Tolak
            </button>
            <button onClick={() => openModal('report', item.id, 'approve')}
              className="flex-1 bg-blue-700 text-white text-sm font-medium py-2 rounded-md hover:bg-blue-800">
              Setujui
            </button>
          </>
        )}
      </div>
    </div>
  )

  const MatchCard = ({ item }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge text={item.status} />
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
              Auto Match
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            Barang FOUND #{item.found_item_id} ↔ Barang LOST #{item.lost_item_id}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{formatTanggal(item.created_at)}</p>
        </div>
      </div>

      {/* Alasan match dari sistem */}
      <div className="bg-purple-50 border border-purple-100 rounded-md px-4 py-3 mb-3">
        <p className="text-xs text-purple-500 font-medium mb-1">Alasan sistem mendeteksi kecocokan:</p>
        <p className="text-sm text-purple-800">{item.alasan_match}</p>
      </div>

      {/* Link lihat kedua barang */}
      <div className="flex gap-2 mb-3">
        <button onClick={() => navigate(`/barang/${item.found_item_id}`)}
          className="flex-1 text-xs text-green-700 border border-green-200 py-1.5 rounded-md hover:bg-green-50">
          Lihat Barang Temuan →
        </button>
        <button onClick={() => navigate(`/barang/${item.lost_item_id}`)}
          className="flex-1 text-xs text-red-600 border border-red-200 py-1.5 rounded-md hover:bg-red-50">
          Lihat Barang Hilang →
        </button>
      </div>

      {item.catatan_admin && (
        <div className="px-4 py-2 bg-gray-100 rounded-md mb-3">
          <p className="text-xs text-gray-500">Catatan: {item.catatan_admin}</p>
        </div>
      )}

      <div className="flex gap-2">
        {item.status === 'PENDING' && (
          <>
            <button onClick={() => openModal('match', item.id, 'reject')}
              className="flex-1 border border-red-200 text-red-600 text-sm font-medium py-2 rounded-md hover:bg-red-50">
              Bukan Cocok
            </button>
            <button onClick={() => openModal('match', item.id, 'approve')}
              className="flex-1 bg-blue-700 text-white text-sm font-medium py-2 rounded-md hover:bg-blue-800">
              Konfirmasi Cocok
            </button>
          </>
        )}
      </div>
    </div>
  )

  const displayItems    = { claims, reports, matches }[tab]
  const CardComponent   = { claims: ClaimCard, reports: ReportCard, matches: MatchCard }[tab]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-sm text-gray-500 mt-1">
            Verifikasi dan kelola semua ajuan dari mahasiswa
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Pending', value: totalPending,   color: 'text-gray-900',   bg: 'bg-white' },
            { label: 'Klaim Pending', value: pendingClaims,  color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Match Pending', value: pendingMatches, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border border-gray-200 rounded-lg p-4 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`text-sm font-medium px-4 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                tab === t.value
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  tab === t.value ? 'bg-blue-600' : 'bg-yellow-400 text-yellow-900'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="h-5 w-16 bg-gray-100 rounded-full" />
                  <div className="h-5 w-40 bg-gray-100 rounded" />
                </div>
                <div className="h-20 bg-gray-100 rounded-md mb-3" />
                <div className="flex gap-2">
                  <div className="flex-1 h-9 bg-gray-100 rounded-md" />
                  <div className="flex-1 h-9 bg-gray-100 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : displayItems.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg py-16 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm font-medium">Semua sudah diproses!</p>
            <p className="text-gray-400 text-xs mt-1">Tidak ada ajuan yang menunggu verifikasi</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayItems.map(item => (
              <CardComponent key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL APPROVE / REJECT ── */}
      {showModal && modalData && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              {modalData.action === 'approve' ? 'Setujui Ajuan' : 'Tolak Ajuan'}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {modalData.action === 'approve'
                ? 'Konfirmasi bahwa ajuan ini valid. Notifikasi akan dikirim ke mahasiswa.'
                : 'Tolak ajuan ini. Berikan alasan penolakan untuk mahasiswa.'}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan {modalData.action === 'reject' ? '(wajib)' : '(opsional)'}
              </label>
              <textarea
                rows={3}
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                placeholder={
                  modalData.action === 'approve'
                    ? 'Cth: Bukti kepemilikan valid, silakan ambil di pos satpam FEM'
                    : 'Cth: Ciri yang diberikan tidak sesuai dengan barang...'
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-700 resize-none"
              />
            </div>

            {actionError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md mb-3">{actionError}</p>
            )}

            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-md hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleAction} disabled={actionLoading}
                className={`flex-1 text-white text-sm font-medium py-2 rounded-md disabled:opacity-60 ${
                  modalData.action === 'approve'
                    ? 'bg-blue-700 hover:bg-blue-800'
                    : 'bg-red-600 hover:bg-red-700'
                }`}>
                {actionLoading
                  ? 'Memproses...'
                  : modalData.action === 'approve' ? 'Ya, Setujui' : 'Ya, Tolak'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL KODE PENGAMBILAN ── */}
      {showKode && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 text-center">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Kode Pengambilan</h2>

            {kodeLoading ? (
              <div className="py-8">
                <div className="w-10 h-10 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : kodeData ? (
              <>
                <p className="text-sm text-gray-500 mb-4">{kodeData.nama_barang}</p>
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg px-6 py-5 mb-4">
                  <p className="text-3xl font-bold text-blue-700 tracking-widest">
                    {kodeData.kode_pengambilan}
                  </p>
                </div>
                <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                  <p className="text-xs text-yellow-700">
                    Minta mahasiswa menunjukkan kode ini saat pengambilan barang.
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 py-4">Gagal memuat kode</p>
            )}

            <button onClick={() => setShowKode(false)}
              className="w-full bg-blue-700 text-white text-sm font-medium py-2.5 rounded-md hover:bg-blue-800">
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
