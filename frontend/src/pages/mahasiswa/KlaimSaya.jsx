import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/shared/Navbar'
import Badge from '../../components/shared/Badge'
import Footer from '../../components/shared/Footer'
import api from '../../services/api'

export default function KlaimSaya() {
  const navigate = useNavigate()

  const [claims, setClaims]     = useState([])
  const [reports, setReports]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('klaim')  // klaim | report

  // Modal upload bukti
  const [showUpload, setShowUpload]       = useState(false)
  const [uploadTarget, setUploadTarget]   = useState(null)  // { id, type: 'claim'|'report' }
  const [uploadFile, setUploadFile]       = useState(null)
  const [uploadPreview, setUploadPreview] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError]     = useState('')

  // Modal kode pengambilan
  const [showKode, setShowKode] = useState(false)
  const [kodeData, setKodeData] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [claimRes, reportRes] = await Promise.all([
        api.get('/claims/me'),
        api.get('/found-reports/me'),
      ])
      setClaims(claimRes.data)
      setReports(reportRes.data)
    } catch {
      setClaims([])
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const formatTanggal = (dateStr) => new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadFile(file)
    setUploadPreview(URL.createObjectURL(file))
    setUploadError('')
  }

  const handleUploadBukti = async () => {
    if (!uploadFile) { setUploadError('Pilih file terlebih dahulu'); return }
    setUploadLoading(true)
    setUploadError('')
    try {
      const fd = new FormData()
      fd.append('file', uploadFile)
      if (uploadTarget.type === 'claim') {
        await api.post(`/claims/${uploadTarget.id}/bukti`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await api.post(`/found-reports/${uploadTarget.id}/foto`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      setShowUpload(false)
      setUploadFile(null)
      setUploadPreview(null)
      fetchAll()
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Gagal upload')
    } finally {
      setUploadLoading(false)
    }
  }

  const openUpload = (id, type) => {
    setUploadTarget({ id, type })
    setUploadFile(null)
    setUploadPreview(null)
    setUploadError('')
    setShowUpload(true)
  }

  const openKode = (data) => {
    setKodeData(data)
    setShowKode(true)
  }

  // Status card style
  const statusCard = (status) => {
    if (status === 'APPROVED') return 'border-green-200 bg-green-50'
    if (status === 'REJECTED') return 'border-red-200 bg-red-50'
    if (status === 'PENDING')  return 'border-yellow-200 bg-yellow-50'
    return 'border-gray-200 bg-white'
  }

  const ClaimCard = ({ item, type }) => {
    const isApproved = item.status === 'APPROVED'
    const isRejected = item.status === 'REJECTED'
    const isPending  = item.status === 'PENDING'
    const hasBukti   = type === 'claim'
      ? item.bukti_foto?.length > 0
      : item.foto_bukti?.length > 0
    const kode = type === 'claim' ? item.kode_pengambilan : item.kode_pengambilan

    return (
      <div className={`border rounded-lg p-5 transition-colors ${statusCard(item.status)}`}>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge text={item.status} />
              {type === 'report' && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  Laporan Penemuan
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {type === 'claim'
                ? `Klaim Barang #${item.item_id}`
                : `Laporan untuk Barang Hilang #${item.lost_item_id}`
              }
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{formatTanggal(item.created_at)}</p>
          </div>

          {/* Tombol lihat barang */}
          <button
            onClick={() => navigate(`/barang/${type === 'claim' ? item.item_id : item.lost_item_id}`)}
            className="text-xs text-blue-700 border border-blue-200 px-3 py-1.5 rounded-md hover:bg-blue-50 shrink-0"
          >
            Lihat Barang
          </button>
        </div>

        {/* Deskripsi */}
        <div className="bg-white border border-gray-100 rounded-md px-4 py-3 mb-3">
          <p className="text-xs text-gray-400 mb-1">
            {type === 'claim' ? 'Ciri yang kamu isi:' : 'Deskripsi penemuanmu:'}
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {type === 'claim' ? item.deskripsi_ciri : item.deskripsi}
          </p>
          {type === 'report' && item.lokasi_sekarang && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400">Lokasi barang:</p>
              <p className="text-sm text-gray-700">{item.lokasi_sekarang}</p>
            </div>
          )}
        </div>

        {/* Foto Bukti */}
        {hasBukti && (
          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-2">Foto bukti yang diupload:</p>
            <div className="flex gap-2 flex-wrap">
              {(type === 'claim' ? item.bukti_foto : item.foto_bukti).map((url, i) => (
                <img
                  key={i}
                  src={url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`}
                  alt=""
                  className="w-16 h-16 object-cover rounded-md border border-gray-200"
                />
              ))}
            </div>
          </div>
        )}

        {/* Catatan Admin */}
        {item.catatan_admin && (
          <div className={`px-4 py-3 rounded-md mb-3 ${
            isApproved ? 'bg-green-100 border border-green-200' :
            isRejected ? 'bg-red-100 border border-red-200' :
            'bg-gray-100 border border-gray-200'
          }`}>
            <p className="text-xs font-medium text-gray-500 mb-0.5">Catatan Admin:</p>
            <p className={`text-sm ${
              isApproved ? 'text-green-700' :
              isRejected ? 'text-red-700' :
              'text-gray-700'
            }`}>
              {item.catatan_admin}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Upload bukti — hanya kalau masih pending */}
          {isPending && (
            <button
              onClick={() => openUpload(item.id, type)}
              className="flex-1 border border-gray-200 text-gray-600 text-xs font-medium py-2 rounded-md hover:bg-gray-100 flex items-center justify-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Bukti Tambahan
            </button>
          )}

          {/* Kode Pengambilan — kalau approved */}
          {isApproved && kode && (
            <button
              onClick={() => openKode({
                kode,
                nama: type === 'claim' ? `Klaim #${item.item_id}` : `Laporan #${item.lost_item_id}`
              })}
              className="flex-1 bg-green-600 text-white text-xs font-medium py-2 rounded-md hover:bg-green-700 flex items-center justify-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Lihat Kode Pengambilan
            </button>
          )}
        </div>

        {/* Pending Info */}
        {isPending && (
          <p className="text-xs text-yellow-600 text-center mt-2">
            Menunggu verifikasi admin — kamu akan mendapat notifikasi hasilnya
          </p>
        )}
      </div>
    )
  }

  const displayItems = tab === 'klaim' ? claims : reports
  const emptyText = tab === 'klaim'
    ? { title: 'Belum ada klaim', sub: 'Klaim barang dari halaman katalog jika kamu menemukan barang milikmu' }
    : { title: 'Belum ada laporan penemuan', sub: 'Laporkan jika kamu punya barang yang cocok dengan laporan hilang orang lain' }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Aktivitas Saya</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau status klaim dan laporan penemuan yang kamu ajukan
          </p>
        </div>

        {/* Tab */}
        <div className="flex gap-2 mb-4">
          {[
            { label: 'Klaim Barang', value: 'klaim', count: claims.length },
            { label: 'Laporan Penemuan', value: 'report', count: reports.length },
          ].map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`text-sm font-medium px-4 py-1.5 rounded-md transition-colors ${
                tab === t.value
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.value ? 'bg-blue-600' : 'bg-gray-200 text-gray-500'
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
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-5 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="h-5 w-16 bg-gray-100 rounded-full" />
                  <div className="h-5 w-32 bg-gray-100 rounded" />
                </div>
                <div className="h-16 bg-gray-100 rounded-md mb-3" />
                <div className="h-8 bg-gray-100 rounded-md" />
              </div>
            ))}
          </div>
        ) : displayItems.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg py-16 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm font-medium">{emptyText.title}</p>
            <p className="text-gray-400 text-xs mt-1 max-w-xs mx-auto">{emptyText.sub}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 text-sm text-blue-700 border border-blue-200 px-4 py-2 rounded-md hover:bg-blue-50"
            >
              Lihat Katalog
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {displayItems.map(item => (
              <ClaimCard
                key={item.id}
                item={item}
                type={tab === 'klaim' ? 'claim' : 'report'}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* ── MODAL UPLOAD BUKTI ── */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Upload Bukti Tambahan</h2>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-md cursor-pointer hover:border-blue-700 hover:bg-blue-50 transition-colors mb-3">
              {uploadPreview ? (
                <img src={uploadPreview} alt="" className="w-full h-full object-cover rounded-md" />
              ) : (
                <>
                  <svg className="w-8 h-8 text-gray-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-400">Klik untuk pilih foto</p>
                  <p className="text-xs text-gray-300 mt-0.5">JPG, PNG, WEBP — maks 5MB</p>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>

            {uploadError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md mb-3">{uploadError}</p>
            )}

            <div className="flex gap-2">
              <button onClick={() => setShowUpload(false)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-md hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleUploadBukti} disabled={uploadLoading}
                className="flex-1 bg-blue-700 text-white text-sm font-medium py-2 rounded-md hover:bg-blue-800 disabled:opacity-60">
                {uploadLoading ? 'Mengupload...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL KODE PENGAMBILAN ── */}
      {showKode && kodeData && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-1">Kode Pengambilan</h2>
            <p className="text-sm text-gray-500 mb-5">{kodeData.nama}</p>

            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg px-6 py-4 mb-5">
              <p className="text-3xl font-bold text-blue-700 tracking-widest">
                {kodeData.kode}
              </p>
            </div>

            <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-md mb-5">
              <p className="text-xs text-yellow-700">
                Tunjukkan kode ini ke petugas saat mengambil barang.
                Jangan bagikan kode ini ke orang lain.
              </p>
            </div>

            <button
              onClick={() => setShowKode(false)}
              className="w-full bg-blue-700 text-white text-sm font-medium py-2.5 rounded-md hover:bg-blue-800"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
