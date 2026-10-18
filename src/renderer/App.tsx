import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

declare global { interface Window { party?: { library: () => Promise<any[]>; emulators: () => Promise<string[]>; meta: () => Promise<string[]>; achievements: () => Promise<string[]> } } }

export default function App() {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState('home')
  const [emus, setEmus] = useState<string[]>([])
  const [meta, setMeta] = useState<string[]>([])
  const [ach, setAch] = useState<string[]>([])

  useEffect(() => {
    window.party?.emulators().then(setEmus)
    window.party?.meta().then(setMeta)
    window.party?.achievements().then(setAch)
  }, [])

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="bg-pu p-4">
        <div className="font-bold text-xl mb-6">{t('app')}</div>
        {['home', 'library', 'emulators', 'party'].map((id) => (
          <button key={id} onClick={() => setPage(id)} className={`block w-full text-left rounded px-3 py-2 mb-1 ${page === id ? 'bg-black/30' : ''}`}>{t(id)}</button>
        ))}
        <select className="mt-6 bg-black/30 rounded px-2 py-1" value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)}>
          {['en','es','fr','de','jp','zh','ru','pt','it'].map((l) => <option key={l}>{l}</option>)}
        </select>
      </aside>
      <main className="p-8">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold mb-2">{t(page)}</motion.h1>
        <p className="text-zinc-400 mb-6">{t('tag')}</p>
        {page === 'emulators' && <ul className="grid grid-cols-2 gap-2">{emus.map((e) => <li key={e} className="bg-zinc-900 rounded p-3">{e}</li>)}</ul>}
        {page === 'library' && <div className="text-zinc-300">Add games you own. Covers come from {meta.join(', ') || 'metadata sources'}.</div>}
        {page === 'party' && <div>Achievements: {ach.join(', ') || 'loading'}</div>}
        {page === 'home' && <div className="text-2xl">Continue</div>}
      </main>
    </div>
  )
}
