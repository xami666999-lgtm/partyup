import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

declare global {
  interface Window {
    party?: {
      library: () => Promise<any[]>
      emulators: () => Promise<string[]>
      meta: () => Promise<string[]>
      achievements: () => Promise<string[]>
      steam: () => Promise<any>
      mods: () => Promise<string[]>
      multiplayer: () => Promise<string[]>
      cloud: () => Promise<string[]>
      optimize: () => Promise<string[]>
      hoard: () => Promise<any>
    }
  }
}

const pages = ['home', 'library', 'emulators', 'party', 'steam', 'mods', 'cloud', 'optimize']

export default function App() {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState('home')
  const [data, setData] = useState<Record<string, any>>({})

  useEffect(() => {
    const p = window.party
    if (!p) return
    Promise.all([
      p.emulators(), p.meta(), p.achievements(), p.steam(),
      p.mods(), p.multiplayer(), p.cloud(), p.optimize(), p.hoard(),
    ]).then(([emus, meta, ach, steam, mods, mp, cloud, opt, hoard]) => {
      setData({ emus, meta, ach, steam, mods, mp, cloud, opt, hoard })
    })
  }, [])

  const list = (key: string) => (data[key] || []).map((item: string) => (
    <li key={item} className="bg-zinc-900 rounded p-3">{item}</li>
  ))

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="bg-pu p-4 overflow-auto">
        <div className="font-bold text-xl mb-6">{t('app')}</div>
        {pages.map((id) => (
          <button key={id} onClick={() => setPage(id)} className={`block w-full text-left rounded px-3 py-2 mb-1 ${page === id ? 'bg-black/30' : ''}`}>{id}</button>
        ))}
        <select className="mt-6 bg-black/30 rounded px-2 py-1" value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)}>
          {['en','es','fr','de','jp','zh','ru','pt','it'].map((l) => <option key={l}>{l}</option>)}
        </select>
      </aside>
      <main className="p-8">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold mb-2">{page}</motion.h1>
        <p className="text-zinc-400 mb-6">{t('tag')}</p>
        {page === 'emulators' && <ul className="grid grid-cols-2 gap-2">{list('emus')}</ul>}
        {page === 'library' && <div>Metadata: {(data.meta || []).join(', ')}</div>}
        {page === 'party' && <div>Play together: {(data.mp || []).join(', ')}. Achievements: {(data.ach || []).join(', ')}</div>}
        {page === 'steam' && <div>Steam link: {data.steam ? 'ready' : 'loading'}. Workshop and controller configs are in.</div>}
        {page === 'mods' && <ul className="grid grid-cols-2 gap-2">{list('mods')}</ul>}
        {page === 'cloud' && <ul className="grid grid-cols-2 gap-2">{list('cloud')}</ul>}
        {page === 'optimize' && <ul className="grid grid-cols-2 gap-2">{list('opt')}</ul>}
        {page === 'home' && <div className="text-2xl">Continue</div>}
      </main>
    </div>
  )
}
