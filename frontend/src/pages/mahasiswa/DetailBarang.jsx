import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/shared/Navbar'
import Badge from '../../components/shared/Badge'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const IPB_LOCATIONS = [
  { label: '--- POS SATPAM FAKULTAS ---', value: '', disabled: true },
  { label: 'Pos Satpam Faperta', value: 'Pos Satpam Faperta' },
  { label: 'Pos Satpam SKHB', value: 'Pos Satpam SKHB' },
  { label: 'Pos Satpam FPIK', value: 'Pos Satpam FPIK' },
  { label: 'Pos Satpam Fapet', value: 'Pos Satpam Fapet' },
  { label: 'Pos Satpam Fahutan', value: 'Pos Satpam Fahutan' },
  { label: 'Pos Satpam Fateta', value: 'Pos Satpam Fateta' },
  { label: 'Pos Satpam FMIPA', value: 'Pos Satpam FMIPA' },
  { label: 'Pos Satpam FEM', value: 'Pos Satpam FEM' },
  { label: 'Pos Satpam Fema', value: 'Pos Satpam Fema' },
  { label: '--- GEDUNG & FASILITAS PUSAT ---', value: '', disabled: true },
  { label: 'Meja Informasi CCR Lantai 1', value: 'Meja Informasi CCR Lantai 1' },
  { label: 'Meja Sirkulasi Perpustakaan Pusat', value: 'Meja Sirkulasi Perpustakaan Pusat' },
  { label: 'Lobi Utama Gedung Kuliah Bersama (GKB)', value: 'Lobi Utama Gedung Kuliah Bersama (GKB)' },
  { label: '--- FASILITAS UMUM & IBADAH ---', value: '', disabled: true },
  { label: 'Sekretariat Masjid Al-Hurriyyah', value: 'Sekretariat Masjid Al-Hurriyyah' },
  { label: 'Pos Keamanan Pintu Utama GWW', value: 'Pos Keamanan Pintu Utama GWW' },
  { label: 'Ruang Pengelola Gymnasium', value: 'Ruang Pengelola Gymnasium' },
  { label: 'Resepsionis Klinik IPB Dramaga', value: 'Resepsionis Klinik IPB Dramaga' },
  { label: '--- PUSAT ADMINISTRASI ---', value: '', disabled: true },
  { label: 'Pos Pengamanan Lobi Rektorat AHN', value: 'Pos Pengamanan Lobi Rektorat AHN' },
  { label: 'Sekretariat BEM KM IPB (Student Center)', value: 'Sekretariat BEM KM IPB (Student Center)' },
  { label: '--- ASRAMA & TRANSPORTASI ---', value: '', disabled: true },
  { label: 'Kantor Pengelola Asrama PKU Putra', value: 'Kantor Pengelola Asrama PKU Putra' },
  { label: 'Kantor Pengelola Asrama PKU Putri', value: 'Kantor Pengelola Asrama PKU Putri' },
  { label: 'Pos Penjagaan Asrama Sylvapinus', value: 'Pos Penjagaan Asrama Sylvapinus' },
  { label: 'Shelter Bus Kampus Rektorat', value: 'Shelter Bus Kampus Rektorat' },
]

export default function DetailBarang() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const backPath = user?.role === 'admin' ? '/admin/barang' : '/katalog'
  const backLabel = user?.role === 'admin' ? 'Kelola Barang' : 'Katalog'

  const [item, setItem]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [fotoIndex, setFotoIndex] = useState(0)

  // Modal Klaim
  const [showKlaim, setShowKlaim]         = useState(false)
  const [klaimForm, setKlaimForm]         = useState({ deskripsi_ciri: '' })
  const [klaimFiles, setKlaimFiles]       = useState([])
  const [klaimPreviews, setKlaimPreviews] = useState([])
  const [klaimLoading, setKlaimLoading]   = useState(false)
  const [klaimError, setKlaimError]       = useState('')
  const [klaimSuccess, setKlaimSuccess]   = useState(false)

  const handleKlaimFileChange = (e) => {
    const files = Array.from(e.target.files)
    setKlaimFiles(files)
    setKlaimPreviews(files.map(f => URL.createObjectURL(f)))
  }

  // Modal Found Report (Saya Punya Ini)
  const [showReport, setShowReport]       = useState(false)
  const [reportForm, setReportForm]       = useState({ deskripsi: '', lokasi_sekarang: '' })
  const [reportFile, setReportFile]       = useState(null)
  const [reportPreview, setReportPreview] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError]     = useState('')
  const [reportSuccess, setReportSuccess] = useState(false)

  const handleReportFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setReportFile(file)
      setReportPreview(URL.createObjectURL(file))
    }
  }

  useEffect(() => {
    fetchDetail()
  }, [id])

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/items/${id}`)
      setItem(res.data)
    } catch {
      navigate(backPath)
    } finally {
      setLoading(false)
    }
  }

  const formatTanggal = (dateStr) => new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const handleKlaim = async (e) => {
    e.preventDefault()
    if (!klaimForm.deskripsi_ciri.trim()) {
      setKlaimError('Deskripsi ciri wajib diisi')
      return
    }
    if (!klaimFiles.length) {
      setKlaimError('Wajib mengunggah minimal satu foto bukti kepemilikan')
      return
    }
    setKlaimLoading(true)
    setKlaimError('')
    try {
      const res = await api.post('/claims', { item_id: item.id, deskripsi_ciri: klaimForm.deskripsi_ciri })
      const claimId = res.data.id

      // Upload foto bukti jika ada
      for (const file of klaimFiles) {
        const fd = new FormData()
        fd.append('file', file)
        await api.post(`/claims/${claimId}/bukti`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      setKlaimSuccess(true)
      fetchDetail()
    } catch (err) {
      setKlaimError(err.response?.data?.detail || 'Gagal mengajukan klaim')
    } finally {
      setKlaimLoading(false)
    }
  }

  const handleReport = async (e) => {
    e.preventDefault()
    if (!reportForm.deskripsi.trim() || !reportForm.lokasi_sekarang.trim()) {
      setReportError('Semua field wajib diisi')
      return
    }
    if (!reportFile) {
      setReportError('Foto bukti penemuan wajib diunggah')
      return
    }
    setReportLoading(true)
    setReportError('')
    try {
      const formData = new FormData()
      formData.append('lost_item_id', item.id)
      formData.append('deskripsi', reportForm.deskripsi)
      formData.append('lokasi_sekarang', reportForm.lokasi_sekarang)
      formData.append('foto', reportFile)

      await api.post('/found-reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setReportSuccess(true)
      fetchDetail()
    } catch (err) {
      setReportError(err.response?.data?.detail || 'Gagal mengajukan laporan')
    } finally {
      setReportLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
          <div className="flex gap-6">
            <div className="w-64 h-64 bg-gray-100 rounded-lg shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="h-6 bg-gray-100 rounded w-1/2" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (!item) return null

  const isMahasiswa = user?.role === 'mahasiswa'
  const isOwner     = user?.id === item.user_id
  const canKlaim    = isMahasiswa && item.tipe === 'FOUND' && item.status === 'OPEN' && !isOwner
  const canReport   = isMahasiswa && item.tipe === 'LOST'  && item.status === 'OPEN' && !isOwner

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate(backPath)} className="hover:text-blue-700">{backLabel}</button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{item.nama_publik}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── KIRI: Foto ── */}
          <div className="w-full lg:w-80 shrink-0">
            {/* Main Photo */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mb-2">
              {item.foto?.length > 0 ? (
                <img
                  src={item.foto[fotoIndex].url.startsWith('http') ? item.foto[fotoIndex].url : `${import.meta.env.VITE_API_URL}${item.foto[fotoIndex].url}`}
                  alt={item.nama_publik}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-400 mt-2">Belum ada foto</p>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {item.foto?.length > 1 && (
              <div className="flex gap-2">
                {item.foto.map((f, i) => (
                  <button
                    key={f.id}
                    onClick={() => setFotoIndex(i)}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                      fotoIndex === i ? 'border-blue-700' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={f.url.startsWith('http') ? f.url : `${import.meta.env.VITE_API_URL}${f.url}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── KANAN: Detail ── */}
          <div className="flex-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6">

              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge text={item.tipe} />
                    <Badge text={item.status} />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">{item.nama_publik}</h1>
                  <p className="text-sm text-gray-500 capitalize mt-0.5">{item.kategori}</p>
                </div>
              </div>

              {/* Info Rows */}
              <div className="space-y-3 border-t border-gray-100 pt-4">

                {/* Tanggal */}
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-400">Tanggal</p>
                    <p className="text-sm text-gray-700">{formatTanggal(item.tanggal)}</p>
                  </div>
                </div>

                {/* Lokasi FOUND */}
                {item.tipe === 'FOUND' && item.lokasi_ditemukan && (
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-400">Ditemukan di</p>
                      <p className="text-sm text-gray-700">{item.lokasi_ditemukan}</p>
                    </div>
                  </div>
                )}

                {/* Lokasi Sekarang FOUND — hanya owner (penemu) atau admin */}
                {item.tipe === 'FOUND' && item.lokasi_sekarang && (isOwner || user?.role === 'admin') && (
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-400">Barang berada di</p>
                      <p className="text-sm font-medium text-blue-700">{item.lokasi_sekarang}</p>
                    </div>
                  </div>
                )}

                {/* Lokasi Kemungkinan LOST */}
                {item.tipe === 'LOST' && item.lokasi_kemungkinan?.length > 0 && (
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-400">Kemungkinan hilang di</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.lokasi_kemungkinan.map((lok, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {lok}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Expired At */}
                {item.expired_at && item.status === 'OPEN' && (
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-400">Laporan berakhir pada</p>
                      <p className="text-sm text-yellow-600">{formatTanggal(item.expired_at)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Closed/Expired Info */}
              {['CLOSED', 'EXPIRED'].includes(item.status) && (
                <div className="mt-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm text-gray-500 text-center">
                    {item.status === 'CLOSED'
                      ? 'Barang ini sudah dikembalikan ke pemiliknya.'
                      : 'Laporan ini sudah kadaluarsa.'}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 space-y-2">

                {/* Tombol Klaim — untuk FOUND */}
                {canKlaim && (
                  <button
                    onClick={() => setShowKlaim(true)}
                    className="w-full bg-blue-700 text-white text-sm font-medium py-2.5 rounded-md hover:bg-blue-800 transition-colors"
                  >
                    Ajukan Klaim — Ini Barang Saya
                  </button>
                )}

                {/* Tombol Saya Punya Ini — untuk LOST */}
                {canReport && (
                  <button
                    onClick={() => setShowReport(true)}
                    className="w-full bg-blue-700 text-white text-sm font-medium py-2.5 rounded-md hover:bg-blue-800 transition-colors"
                  >
                    Saya Punya Barang Ini
                  </button>
                )}

                {/* Pending info */}
                {item.status === 'PENDING' && (
                  <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-700 text-center font-medium">
                      Sedang dalam proses verifikasi admin
                    </p>
                  </div>
                )}

                {/* Guest prompt */}
                {!user && item.status === 'OPEN' && (
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full border border-blue-700 text-blue-700 text-sm font-medium py-2.5 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    Login untuk mengajukan klaim
                  </button>
                )}

                <button
                  onClick={() => navigate(backPath)}
                  className="w-full border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-md hover:bg-gray-50 transition-colors"
                >
                  ← Kembali ke {backLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL KLAIM ── */}
      {showKlaim && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Ajukan Klaim</h2>
              <button onClick={() => { 
                setShowKlaim(false); 
                setKlaimSuccess(false); 
                setKlaimError('');
                setKlaimFiles([]);
                setKlaimPreviews([]);
              }}
                className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {klaimSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium">Klaim berhasil diajukan!</p>
                <p className="text-gray-500 text-sm mt-1">
                  Menunggu verifikasi admin. Kamu akan mendapat notifikasi hasilnya.
                </p>
                <button
                  onClick={() => { 
                    setShowKlaim(false); 
                    setKlaimSuccess(false);
                    setKlaimFiles([]);
                    setKlaimPreviews([]);
                  }}
                  className="mt-4 bg-blue-700 text-white text-sm font-medium px-6 py-2 rounded-md hover:bg-blue-800"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleKlaim} className="space-y-4">
                <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs text-blue-700">
                    Isi ciri-ciri unik barang yang <strong>tidak terlihat di foto publik</strong>.
                    Admin akan menggunakan informasi ini untuk memverifikasi kepemilikanmu.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciri Khusus Barang <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={klaimForm.deskripsi_ciri}
                    onChange={e => setKlaimForm({ ...klaimForm, deskripsi_ciri: e.target.value })}
                    placeholder="Contoh: Ada goresan di sudut kanan bawah, isi dompet ada KTM atas nama saya, ada struk belanja tanggal 1 April..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-700 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Foto Bukti Kepemilikan <span className="text-red-500">*</span>
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-md cursor-pointer hover:border-blue-700 hover:bg-blue-50 transition-colors">
                    <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs text-gray-400">Klik untuk pilih foto bukti</p>
                    <input type="file" accept="image/*" multiple onChange={handleKlaimFileChange} className="hidden" />
                  </label>

                  {klaimPreviews.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {klaimPreviews.map((src, i) => (
                        <img key={i} src={src} alt="" className="w-16 h-16 object-cover rounded-md border border-gray-200" />
                      ))}
                    </div>
                  )}
                </div>

                {klaimError && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{klaimError}</p>
                )}
                <div className="flex gap-2">
                  <button type="button" onClick={() => {
                    setShowKlaim(false);
                    setKlaimFiles([]);
                    setKlaimPreviews([]);
                  }}
                    className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-md hover:bg-gray-50">
                    Batal
                  </button>
                  <button type="submit" disabled={klaimLoading}
                    className="flex-1 bg-blue-700 text-white text-sm font-medium py-2 rounded-md hover:bg-blue-800 disabled:opacity-60">
                    {klaimLoading ? 'Mengajukan...' : 'Ajukan Klaim'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL FOUND REPORT ── */}
      {showReport && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Saya Punya Barang Ini</h2>
              <button onClick={() => { 
                setShowReport(false); 
                setReportSuccess(false); 
                setReportError('');
                setReportFile(null);
                setReportPreview(null);
              }}
                className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {reportSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium">Laporan berhasil dikirim!</p>
                <p className="text-gray-500 text-sm mt-1">
                  Admin akan memverifikasi apakah barang yang kamu temukan cocok. Terima kasih!
                </p>
                <button
                  onClick={() => { 
                    setShowReport(false); 
                    setReportSuccess(false);
                    setReportFile(null);
                    setReportPreview(null);
                  }}
                  className="mt-4 bg-blue-700 text-white text-sm font-medium px-6 py-2 rounded-md hover:bg-blue-800"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-4">
                <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs text-blue-700">
                    Kamu merasa punya barang yang cocok dengan laporan hilang ini?
                    Isi form di bawah dan admin akan memverifikasinya.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi Barang yang Kamu Temukan
                  </label>
                  <textarea
                    rows={3}
                    value={reportForm.deskripsi}
                    onChange={e => setReportForm({ ...reportForm, deskripsi: e.target.value })}
                    placeholder="Contoh: Dompet hitam berisi KTM, ditemukan di kantin FEM..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-700 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barang Sekarang Ada di Mana? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reportForm.lokasi_sekarang}
                    onChange={e => setReportForm({ ...reportForm, lokasi_sekarang: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  >
                    <option value="">Pilih lokasi penyimpanan...</option>
                    {IPB_LOCATIONS.map((loc, i) => (
                      <option key={i} value={loc.value} disabled={loc.disabled}>
                        {loc.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Foto Bukti Penemuan <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 border-2 border-dashed border-gray-200 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-700 hover:bg-blue-50 transition-colors">
                      {reportPreview ? (
                        <img src={reportPreview} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs text-gray-400 mt-1">Klik untuk pilih foto</p>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleReportFileChange} className="hidden" />
                    </label>
                    {reportPreview && (
                      <button type="button" onClick={() => { setReportFile(null); setReportPreview(null) }}
                        className="text-xs text-red-600 font-medium hover:underline">
                        Hapus Foto
                      </button>
                    )}
                  </div>
                </div>
                {reportError && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{reportError}</p>
                )}
                <div className="flex gap-2">
                  <button type="button" onClick={() => { 
                    setShowReport(false);
                    setReportFile(null);
                    setReportPreview(null);
                  }}
                    className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-md hover:bg-gray-50">
                    Batal
                  </button>
                  <button type="submit" disabled={reportLoading}
                    className="flex-1 bg-blue-700 text-white text-sm font-medium py-2 rounded-md hover:bg-blue-800 disabled:opacity-60">
                    {reportLoading ? 'Mengirim...' : 'Kirim Laporan'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
