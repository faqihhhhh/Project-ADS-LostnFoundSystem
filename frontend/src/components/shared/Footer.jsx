import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-transparent text-gray-500 py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-blue-700 font-bold text-lg tracking-tight">LostnFound</span>
            </div>
            <p className="text-xs leading-relaxed">
              Sistem terpusat untuk membantu warga IPB menemukan kembali barang-barang berharga mereka dengan teknologi cerdas.
            </p>
            <div className="flex gap-3 mt-4">
              {['X', 'IG', 'YT', 'in'].map(s => (
                <div key={s} className="w-7 h-7 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fitur */}
          <div>
            <h4 className="text-gray-900 text-sm font-semibold mb-4">Fitur</h4>
            <ul className="space-y-2 text-xs">
              {['Database Barang', 'Lapor Barang', 'Klaim Barang', 'Auto Match', 'Leaderboard'].map(l => (
                <li key={l}><span className="hover:text-blue-700 cursor-pointer transition-colors">{l}</span></li>
              ))}
            </ul>
          </div>

          {/* Panduan */}
          <div>
            <h4 className="text-gray-900 text-sm font-semibold mb-4">Panduan</h4>
            <ul className="space-y-2 text-xs">
              {['Cara Klaim', 'Cara Lapor', 'Sistem Poin', 'Kebijakan Privasi', 'FAQ'].map(l => (
                <li key={l}><span className="hover:text-blue-700 cursor-pointer transition-colors">{l}</span></li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="text-gray-900 text-sm font-semibold mb-4">Kontak</h4>
            <ul className="space-y-2 text-xs">
              {['Hubungi Admin', 'Kantor Kemahasiswaan', 'Satuan Pengamanan', 'Laporan Bug'].map(l => (
                <li key={l}><span className="hover:text-blue-700 cursor-pointer transition-colors">{l}</span></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-gray-400">© 2025 LostnFound System. Hak cipta dilindungi.</p>
          <p className="text-[11px] text-gray-400">Dibuat dengan ❤️ untuk warga IPB University</p>
        </div>
      </div>
    </footer>
  )
}
