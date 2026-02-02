import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-white mb-2">Pagina non trovata</h1>
        <p className="text-slate-400 mb-6">La pagina che stai cercando non esiste.</p>
        <Link 
          href="/"
          className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Torna alla home
        </Link>
      </div>
    </div>
  )
}
