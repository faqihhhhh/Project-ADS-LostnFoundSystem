import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/shared/Navbar'

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const reviews = [
    { quote: '"Barang saya ketemu dalam 2 hari! Sistemnya sangat membantu."', name: 'Andi Pratama', desc: 'Mahasiswa Fasilkom' },
    { quote: '"Saya dapat poin karena melapor barang temuan. Keren banget!"', name: 'Siti Rahma', desc: 'Mahasiswa FAPERTA' },
    { quote: '"Prosesnya mudah dan transparan, admin responsif."', name: 'Budi Santoso', desc: 'Mahasiswa FEM' },
    { quote: '"Auto-match langsung nyambungin barang saya dengan pelapor!"', name: 'Dewi Lestari', desc: 'Mahasiswa FMIPA' },
    { quote: '"Lebih praktis dari grup WA, laporan langsung terverifikasi."', name: 'Rizky Aulia', desc: 'Mahasiswa FATETA' },
  ]

  const features = [
    {
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Verifikasi Admin',
      desc: 'Setiap klaim diverifikasi secara ketat oleh admin untuk mencegah pemalsuan kepemilikan.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Auto-Match Cerdas',
      desc: 'Sistem mendeteksi kecocokan antara barang hilang dan barang temuan secara otomatis.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      title: 'Poin Civitas Peduli',
      desc: 'Dapatkan poin kejujuran saat melaporkan barang temuan. Lihat peringkatmu di leaderboard!',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      title: 'Notifikasi Real-time',
      desc: 'Langsung tahu saat klaimmu disetujui atau ada barang yang cocok denganmu.',
    },
  ]

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* ── HERO ── */}
      <section
        className="relative min-h-[580px] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/IPB_University_%28aerial_view%29.jpg/1280px-IPB_University_%28aerial_view%29.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
        }}
      >
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 py-20">
          <p className="text-blue-300 text-sm font-semibold tracking-widest uppercase mb-3">
            LostnFound System
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
            Lost Something?<br />
            <span className="text-blue-400">Find it Here!</span>
          </h1>
          <p className="text-gray-200 text-base sm:text-lg max-w-xl leading-relaxed mb-8">
            Platform terpusat, cerdas, dan aman untuk warga IPB University.
            Laporkan barang hilang atau temuan, klaim secara terverifikasi,
            dan raih poin <span className="text-blue-300 font-semibold">Civitas Peduli</span> atas kejujuranmu!
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={user ? '/katalog' : '/login'}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
            >
              Let's Start →
            </Link>
            <Link
              to="/leaderboard"
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-lg border border-white/30 backdrop-blur-sm transition-all duration-200"
            >
              Lihat Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY LOSTNFOUND ── */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 py-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5">
          Why LostnFound?
        </h2>
        <div className="space-y-4 text-gray-600 text-base leading-relaxed max-w-3xl mb-12">
          <p>
            Kehilangan barang di kampus dulu berarti panik dan scroll tanpa henti di
            puluhan grup WhatsApp atau Line. Barang temuan pun sering dibiarkan begitu saja
            karena si pemilik tak pernah melihat pengumuman.
          </p>
          <p className="font-medium text-gray-800">
            Kami membangun sistem LostnFound untuk mengubah itu. Dengan memusatkan
            semua laporan dalam satu hub aman, menerapkan teknologi auto-matching cerdas, dan
            memastikan verifikasi digital yang ketat — kami menjembatani gap antara barang
            hilang dan penemuannya. Kami tidak hanya membantu menemukan barangmu; kami
            melindunginya dari klaim palsu sambil membangun budaya kejujuran di kampus.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div key={i}
              className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8">
            Reviews from our Users
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((r, i) => (
              <div key={i}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-gray-700 text-sm italic leading-relaxed mb-4">{r.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-blue-700 py-14">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Kehilangan sesuatu? Mulai sekarang!
          </h2>
          <p className="text-blue-200 text-sm mb-7">
            Ribuan warga IPB sudah menggunakan platform ini. Bergabunglah dan bantu satu sama lain.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/katalog"
              className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-md"
            >
              Lihat Katalog
            </Link>
            {!user && (
              <Link
                to="/login"
                className="bg-blue-600 border border-blue-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-white font-bold text-lg">LostnFound</span>
              </div>
              <p className="text-xs leading-relaxed">
                Sistem terpusat untuk membantu warga IPB menemukan kembali barang-barang berharga mereka.
              </p>
              <div className="flex gap-3 mt-4">
                {['X', 'IG', 'YT', 'in'].map(s => (
                  <div key={s} className="w-7 h-7 bg-gray-700 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-300 font-medium">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fitur */}
            <div>
              <h4 className="text-white text-sm font-semibold mb-3">Fitur</h4>
              <ul className="space-y-2 text-xs">
                {['Database Barang', 'Lapor Barang', 'Klaim Barang', 'Auto Match', 'Leaderboard'].map(l => (
                  <li key={l}><span className="hover:text-white cursor-pointer transition-colors">{l}</span></li>
                ))}
              </ul>
            </div>

            {/* Panduan */}
            <div>
              <h4 className="text-white text-sm font-semibold mb-3">Panduan</h4>
              <ul className="space-y-2 text-xs">
                {['Cara Klaim', 'Cara Lapor', 'Sistem Poin', 'Kebijakan Privasi', 'FAQ'].map(l => (
                  <li key={l}><span className="hover:text-white cursor-pointer transition-colors">{l}</span></li>
                ))}
              </ul>
            </div>

            {/* Kontak */}
            <div>
              <h4 className="text-white text-sm font-semibold mb-3">Kontak</h4>
              <ul className="space-y-2 text-xs">
                {['Hubungi Admin', 'Kantor Kemahasiswaan', 'Satuan Pengamanan', 'Laporan Bug'].map(l => (
                  <li key={l}><span className="hover:text-white cursor-pointer transition-colors">{l}</span></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs">© 2025 LostnFound System. Hak cipta dilindungi.</p>
            <p className="text-xs">Dibuat dengan ❤️ untuk warga IPB University</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
