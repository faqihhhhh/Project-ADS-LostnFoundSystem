export default function AdminFooter() {
  return (
    <footer className="bg-transparent text-gray-400 py-8 border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-700 rounded-full animate-pulse" />
            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
              LostnFound Control Panel <span className="text-gray-300 ml-1">v1.0.0</span>
            </p>
          </div>
          
          <div className="flex gap-6">
            <p className="text-[11px] hover:text-blue-700 cursor-pointer transition-colors">Documentation</p>
            <p className="text-[11px] hover:text-blue-700 cursor-pointer transition-colors">System Health</p>
            <p className="text-[11px] hover:text-blue-700 cursor-pointer transition-colors">Audit Logs</p>
          </div>

          <p className="text-[11px] text-gray-400">
            © 2025 LostnFound Administrative Suite. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
