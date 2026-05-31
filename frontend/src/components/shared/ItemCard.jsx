import { useNavigate } from 'react-router-dom'
import Badge from './Badge'

export default function ItemCard({ item }) {
  const navigate = useNavigate()
  const foto = item.foto?.[0]?.url

  const formatTanggal = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const lokasiTampil = item.tipe === 'FOUND'
    ? item.lokasi_ditemukan
    : item.lokasi_kemungkinan?.[0]

  return (
    <div
      onClick={() => navigate(`/barang/${item.id}`)}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-sm hover:border-gray-300 transition-all"
    >
      {/* Image */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
        {foto ? (
          <img
            src={foto.startsWith('http') ? foto : `${import.meta.env.VITE_API_URL}${foto}`}
            alt={item.nama_publik}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-bold text-gray-900 truncate">{item.nama_publik}</p>
          <Badge text={item.tipe} />
        </div>
        <p className="text-xs text-gray-500 capitalize mb-2">{item.kategori}</p>
        {lokasiTampil && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{lokasiTampil}</span>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-1">{formatTanggal(item.tanggal)}</p>
      </div>
    </div>
  )
}
