import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

const platforms = [
  { id: 'nes', name: 'NES', count: 0 },
  { id: 'snes', name: 'Super NES', count: 0 },
  { id: 'n64', name: 'Nintendo 64', count: 0 },
  { id: 'gb', name: 'Game Boy', count: 0 },
  { id: 'gbc', name: 'Game Boy Color', count: 0 },
  { id: 'gba', name: 'Game Boy Advance', count: 0 },
  { id: 'genesis', name: 'Genesis', count: 0 },
  { id: 'ps1', name: 'PlayStation', count: 0 },
  { id: 'ps2', name: 'PlayStation 2', count: 0 },
  { id: 'psp', name: 'PSP', count: 0 },
  { id: 'nds', name: 'Nintendo DS', count: 0 },
  { id: 'wii', name: 'Wii', count: 0 },
]

const services = [
  'Library', 'Steam library sync', 'Workshop', 'Emulators', 'Mods',
  'Cloud gaming', 'Optimization', 'Achievements', 'Saves', 'Hoard sync',
  'Metadata', 'Profiles', 'Playtime', 'Friends', 'Big Picture',
  'Themes', 'Downloads', 'Discord', 'Party rooms',
]

export default function App() {
  const [page, setPage] = useState('home')
  const [games, setGames] = useState<{ id: string; title: string; plat: string }[]>([])
  const recent = useMemo(() => games.slice(0, 12), [games])

  function addDemo() {
    setGames((g) => [{ id: String(Date.now()), title: 'Your ROM', plat: 'NES' }, ...g])
  }

  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr] bg-[#0e1116] text-white">
      <aside className="bg-[#161b22] border-r border-white/5 p-3">
        <div className="flex items-center gap-2 px-2 py-3 font-bold">
          <span className="w-8 h-8 rounded-full bg-pu grid place-items-center text-sm">P</span>
          PartyUp
        </div>
        {['home', 'platforms', 'scan', 'party', 'services'].map((id) => (
          <button key={id} onClick={() => setPage(id)} className={`w-full text-left rounded px-3 py-2 mb-1 capitalize ${page === id ? 'bg-white/10' : 'hover:bg-white/5'}`}>{id}</button>
        ))}
        <div className="mt-4 text-xs text-zinc-500 px-2">Platforms</div>
        {platforms.map((p) => (
          <button key={p.id} onClick={() => setPage(p.id)} className="w-full text-left rounded px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/5">{p.name}</button>
        ))}
      </aside>
      <main className="p-6">
        <div className="flex gap-6 text-sm text-zinc-400 mb-5">
          <span>{platforms.length} platforms</span>
          <span>{games.length} games</span>
          <span>0 saves</span>
          <span>0 states</span>
        </div>
        {page === 'home' && (
          <>
            <h2 className="text-sm tracking-widest text-zinc-400 mb-3">RECENTLY ADDED</h2>
            <div className="flex gap-3 overflow-auto pb-4">
              {recent.length ? recent.map((g) => (
                <motion.div key={g.id} className="w-28 h-40 rounded bg-zinc-800 grid place-items-end p-2 text-sm" whileHover={{ y: -4 }}>{g.title}</motion.div>
              )) : <div className="text-zinc-500">Scan a folder or add a ROM you own.</div>}
            </div>
            <h2 className="text-sm tracking-widest text-zinc-400 mt-6 mb-3">PLATFORMS</h2>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {platforms.map((p) => (
                <button key={p.id} onClick={() => setPage(p.id)} className="bg-[#161b22] rounded-lg p-3 text-left hover:bg-white/5">
                  <div className="text-sm">{p.name}</div>
                  <div className="text-xs text-zinc-500 mt-6">{games.filter((g) => g.plat === p.name).length}</div>
                </button>
              ))}
            </div>
          </>
        )}
        {page === 'scan' && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Scan</h1>
            <p className="text-zinc-400 mb-4">Point PartyUp at a folder of ROMs you own. Nothing is bundled.</p>
            <button onClick={addDemo} className="bg-pu rounded px-4 py-2 font-semibold">Add a game</button>
          </div>
        )}
        {page === 'party' && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Party</h1>
            <p className="text-zinc-400">Create a room, share the code, play the same game.</p>
          </div>
        )}
        {page === 'services' && (
          <div>
            <h1 className="text-2xl font-bold mb-3">Services</h1>
            <ul className="grid grid-cols-2 gap-2">{services.map((s) => <li key={s} className="bg-[#161b22] rounded p-3">{s}</li>)}</ul>
          </div>
        )}
        {!['home', 'scan', 'party', 'services'].includes(page) && (
          <div>
            <h1 className="text-2xl font-bold mb-2">{platforms.find((p) => p.id === page)?.name || page}</h1>
            <p className="text-zinc-400">Games you add for this platform show here.</p>
          </div>
        )}
      </main>
    </div>
  )
}
