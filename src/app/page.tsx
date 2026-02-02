'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            🔄 RetroShift
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Retrospettive anonime e asincrone per il tuo team.
            <br />
            <span className="text-slate-400">Niente silenzi imbarazzanti. Solo feedback onesto.</span>
          </p>
          
          <Link
            href="/create"
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
          >
            Crea una Retro →
          </Link>
          
          <p className="text-slate-500 mt-4 text-sm">
            Gratis • Nessuna registrazione richiesta
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-white text-center mb-12">Come funziona</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">1️⃣</div>
            <h3 className="text-lg font-semibold text-white mb-2">Crea la retro</h3>
            <p className="text-slate-400">Scegli un formato e ricevi un link da condividere col team.</p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-4">2️⃣</div>
            <h3 className="text-lg font-semibold text-white mb-2">Il team scrive</h3>
            <p className="text-slate-400">Feedback anonimo, quando vogliono, senza pressioni.</p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-4">3️⃣</div>
            <h3 className="text-lg font-semibold text-white mb-2">Vedi i risultati</h3>
            <p className="text-slate-400">Tutti i feedback aggregati in una dashboard chiara.</p>
          </div>
        </div>
      </div>

      {/* Formats */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-white text-center mb-12">Formati disponibili</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-3">Start / Stop / Continue</h3>
            <div className="space-y-2 text-sm">
              <div className="text-green-400">🚀 Cosa dovremmo iniziare a fare?</div>
              <div className="text-red-400">🛑 Cosa dovremmo smettere di fare?</div>
              <div className="text-blue-400">✅ Cosa sta funzionando?</div>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-3">Mad / Sad / Glad</h3>
            <div className="space-y-2 text-sm">
              <div className="text-red-400">😠 Cosa ti ha fatto arrabbiare?</div>
              <div className="text-blue-400">😢 Cosa ti ha reso triste?</div>
              <div className="text-green-400">😊 Cosa ti ha reso felice?</div>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-3">Liked / Learned / Lacked</h3>
            <div className="space-y-2 text-sm">
              <div className="text-pink-400">❤️ Cosa ti è piaciuto?</div>
              <div className="text-yellow-400">💡 Cosa hai imparato?</div>
              <div className="text-gray-400">🤔 Cosa è mancato?</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-500 text-sm">
        <p>Made with 🦞 by <a href="https://shiftclaw.com" className="text-slate-400 hover:text-white">Shiftclaw</a></p>
      </footer>
    </div>
  )
}
