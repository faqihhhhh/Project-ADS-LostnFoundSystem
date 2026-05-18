import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/shared/Navbar'
import api from '../../services/api'

const KATEGORI = ['elektronik', 'dompet', 'kunci', 'kartu', 'pakaian', 'tas', 'botol', 'lainnya']

export default function LaporBarang() {
  const navigate = useNavigate()

  const [tipe, setTipe]       = useState('FOUND')
  const [step, setStep]       = useState(1)   // 1: form, 2: upload foto, 3: sukses
  const [itemId, setItemId]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const [form, setForm] = useState({
    kategori:           '',
    nama_publik:        '',
    deskripsi_detail:   '',
    lokasi_ditemukan:   '',
    lokasi_sekarang:    '',
    lokasi_kemungkinan: [''],
    tanggal:            '',
  })

  // Foto barang
  const [fotoFiles, setFotoFiles]         = useState([])
  const [fotoPreviews, setFotoPreviews]   = useState([])
  const [uploadLoading, setUploadLoading] = useState(false)

  // Bukti kepemilikan (khusus LOST)
  const [buktiFiles, setBuktiFiles]         = useState([])
  const [buktiPreviews, setBuktiPreviews]   = useState([])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleLokasi = (index, value) => {
    const updated = [...form.lokasi_kemungkinan]
    updated[index] = value
    setForm({ ...form, lokasi_kemungkinan: updated })
  }

  const addLokasi = () => {
    if (form.lokasi_kemungkinan.length < 5) {
      setForm({ ...form, lokasi_kemungkinan: [...form.lokasi_kemungkinan, ''] })
    }
  }

  const removeLokasi = (index) => {
    const updated = form.lokasi_kemungkinan.filter((_, i) => i !== index)
    setForm({ ...form, lokasi_kemungkinan: updated.length ? updated : [''] })
  }

  const handleFotoChange = (e) => {
    const files = Array.from(e.target.files)
    setFotoFiles(files)
    setFotoPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const handleBuktiChange = (e) => {
    const files = Array.from(e.target.files)
    setBuktiFiles(files)
    setBuktiPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const validateForm = () => {
    if (!form.kategori)    return 'Kategori wajib dipilih'
    if (!form.nama_publik) return 'Nama barang wajib diisi'
    if (!form.tanggal)     return 'Tanggal wajib diisi'
    if (tipe === 'FOUND') {
      if (!form.lokasi_ditemukan) return 'Lokasi ditemukan wajib diisi'
      if (!form.lokasi_sekarang)  return 'Lokasi barang sekarang wajib diisi'
    }
    if (tipe === 'LOST') {
      const valid = form.lokasi_kemungkinan.filter(l => l.trim())
      if (!valid.length) return 'Minimal satu lokasi kemungkinan wajib diisi'
    }
    return null
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault()
    const err = validateForm()
    if (err) { setError(err); return }

    setLoading(true)
    setError('')
    try {
      const body = {
        tipe,
        kategori:         form.kategori,
        nama_publik:      form.nama_publik,
        deskripsi_detail: form.deskripsi_detail || null,
        tanggal:          new Date(form.tanggal).toISOString(),
      }
      if (tipe === 'FOUND') {
        body.lokasi_ditemukan = form.lokasi_ditemukan
        body.lokasi_sekarang  = form.lokasi_sekarang
      } else {
        body.lokasi_kemungkinan = form.lokasi_kemungkinan.filter(l => l.trim())
      }

      const res = await api.post('/items', body)
      setItemId(res.data.id)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal mengirim laporan')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadFoto = async () => {
    if (!fotoFiles.length && !buktiFiles.length) {
      setStep(3)
      return
    }
    setUploadLoading(true)
    try {
      // Upload foto barang
      for (const file of fotoFiles) {
        const fd = new FormData()
        fd.append('file', file)
        await api.post(`/items/${itemId}/foto`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      // Upload bukti kepemilikan (khusus LOST)
      for (const file of buktiFiles) {
        const fd = new FormData()
        fd.append('file', file)
        await api.post(`/items/${itemId}/bukti-kepemilikan`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      setStep(3)
    } catch {
      setError('Gagal upload foto, tapi laporan sudah tersimpan')
      setStep(3)
    } finally {
      setUploadLoading(false)
    }
  }

  const ProgressBar = () => (
    <div className="flex items-center gap-2 mb-8">
      {['Isi Laporan', 'Upload Foto', 'Selesai'].map((label, i) => {
        const num = i + 1
        const active = step === num
        const done   = step > num
        return (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              done   ? 'bg-green-500 text-white' :
              active ? 'bg-blue-700 text-white'  :
                       'bg-gray-100 text-gray-400'
            }`}>
              {done ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : num}
            </div>
            <span className={`text-xs font-medium ${active ? 'text-blue-700' : done ? 'text-green-600' : 'text-gray-400'}`}>
              {label}
            </span>
            {i < 2 && <div className={`flex-1 h-0.5 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Lapor Barang</h1>
          <p className="text-sm text-gray-500 mt-1">
            Isi form di bawah untuk melaporkan barang hilang atau barang temuan
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <ProgressBar />

          {/* ── STEP 1: Form ── */}
          {step === 1 && (
            <form onSubmit={handleSubmitForm} className="space-y-5">

              {/* Toggle Tipe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Laporan
                </label>
                <div className="flex gap-2">
                  {[
                    { label: 'Barang Temuan', value: 'FOUND', desc: 'Saya menemukan barang orang lain' },
                    { label: 'Barang Hilang', value: 'LOST',  desc: 'Barang saya hilang' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setTipe(opt.value); setError('') }}
                      className={`flex-1 border rounded-md px-4 py-3 text-left transition-colors ${
                        tipe === opt.value
                          ? 'border-blue-700 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className={`text-sm font-medium ${tipe === opt.value ? 'text-blue-700' : 'text-gray-700'}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  name="kategori"
                  value={form.kategori}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                >
                  <option value="">Pilih kategori...</option>
                  {KATEGORI.map(k => (
                    <option key={k} value={k} className="capitalize">{k}</option>
                  ))}
                </select>
              </div>

              {/* Nama Publik */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Barang (Publik) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama_publik"
                  value={form.nama_publik}
                  onChange={handleChange}
                  placeholder="Cth: Dompet, Botol, Kunci — jangan terlalu spesifik"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Nama ini yang akan ditampilkan ke publik. Gunakan nama generik.
                </p>
              </div>

              {/* Deskripsi Detail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi Detail (Privat)
                </label>
                <textarea
                  name="deskripsi_detail"
                  value={form.deskripsi_detail}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Detail spesifik barang — hanya admin yang bisa lihat. Cth: Dompet kulit hitam, ada inisial 'BS' di pojok..."
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-700 resize-none"
                />
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal {tipe === 'FOUND' ? 'Ditemukan' : 'Hilang'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="tanggal"
                  value={form.tanggal}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>

              {/* Field khusus FOUND */}
              {tipe === 'FOUND' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lokasi Ditemukan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lokasi_ditemukan"
                      value={form.lokasi_ditemukan}
                      onChange={handleChange}
                      placeholder="Cth: Kantin Gedung FEM Lt. 1"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barang Sekarang Ada di Mana? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lokasi_sekarang"
                      value={form.lokasi_sekarang}
                      onChange={handleChange}
                      placeholder="Cth: Pos Satpam Gedung FEM"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-700"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Informasi ini akan diberikan ke pemilik barang setelah klaim disetujui.
                    </p>
                  </div>
                </>
              )}

              {/* Field khusus LOST */}
              {tipe === 'LOST' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kemungkinan Lokasi Hilang <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {form.lokasi_kemungkinan.map((lok, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={lok}
                          onChange={e => handleLokasi(i, e.target.value)}
                          placeholder={`Lokasi ${i + 1} — Cth: Gedung FEM, Perpustakaan LSI`}
                          className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-700"
                        />
                        {form.lokasi_kemungkinan.length > 1 && (
                          <button type="button" onClick={() => removeLokasi(i)}
                            className="text-gray-400 hover:text-red-500 px-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {form.lokasi_kemungkinan.length < 5 && (
                    <button type="button" onClick={addLokasi}
                      className="mt-2 text-sm text-blue-700 hover:underline flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Tambah lokasi
                    </button>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => navigate('/')}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-md hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-700 text-white text-sm font-medium py-2.5 rounded-md hover:bg-blue-800 disabled:opacity-60">
                  {loading ? 'Menyimpan...' : 'Simpan & Lanjut →'}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 2: Upload Foto ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700 font-medium">Laporan berhasil disimpan!</p>
                <p className="text-xs text-blue-600 mt-0.5">
                  Sekarang upload foto untuk mempermudah identifikasi. Bisa dilewati.
                </p>
              </div>

              {/* Upload Foto Barang */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto Barang
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-md cursor-pointer hover:border-blue-700 hover:bg-blue-50 transition-colors">
                  <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-400">Klik untuk pilih foto</p>
                  <p className="text-xs text-gray-300 mt-1">JPG, PNG, WEBP — maks 5MB per file</p>
                  <input type="file" accept="image/*" multiple onChange={handleFotoChange} className="hidden" />
                </label>

                {fotoPreviews.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {fotoPreviews.map((src, i) => (
                      <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-md border border-gray-200" />
                    ))}
                  </div>
                )}
              </div>

              {/* Upload Bukti Kepemilikan — khusus LOST */}
              {tipe === 'LOST' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bukti Kepemilikan
                    <span className="text-xs text-gray-400 font-normal ml-2">
                      Struk, foto lama, dus, atau dokumen apapun
                    </span>
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-md cursor-pointer hover:border-blue-700 hover:bg-blue-50 transition-colors">
                    <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-gray-400">Klik untuk pilih bukti kepemilikan</p>
                    <p className="text-xs text-gray-300 mt-1">JPG, PNG, WEBP — maks 5MB per file</p>
                    <input type="file" accept="image/*" multiple onChange={handleBuktiChange} className="hidden" />
                  </label>

                  {buktiPreviews.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {buktiPreviews.map((src, i) => (
                        <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-md border border-gray-200" />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setStep(3)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-md hover:bg-gray-50">
                  Lewati
                </button>
                <button onClick={handleUploadFoto} disabled={uploadLoading}
                  className="flex-1 bg-blue-700 text-white text-sm font-medium py-2.5 rounded-md hover:bg-blue-800 disabled:opacity-60">
                  {uploadLoading ? 'Mengupload...' : 'Upload & Selesai'}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Sukses ── */}
          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Laporan Berhasil Dikirim!</h2>
              <p className="text-gray-500 text-sm mb-6">
                {tipe === 'FOUND'
                  ? 'Terima kasih sudah melaporkan barang temuan. Sistem akan mencari potensi kecocokan secara otomatis.'
                  : 'Laporan barang hilangmu sudah masuk ke sistem. Kami akan memberitahumu jika ada yang menemukan barangmu.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={() => navigate(`/barang/${itemId}`)}
                  className="bg-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-md hover:bg-blue-800"
                >
                  Lihat Laporan
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="border border-gray-200 text-gray-600 text-sm font-medium px-6 py-2.5 rounded-md hover:bg-gray-50"
                >
                  Kembali ke Katalog
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
