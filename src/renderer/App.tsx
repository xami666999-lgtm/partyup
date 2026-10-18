import { useState } from 'react'
import { motion } from 'framer-motion'

const emulators = [
  { id: 'retroarch', name: 'RetroArch', systems: 'NES, SNES, Genesis, GBA, and more', url: 'https://www.retroarch.com/?page=platforms' },
  { id: 'dolphin', name: 'Dolphin', systems: 'GameCube, Wii', url: 'https://dolphin-emu.org/download/' },
  { id: 'rpcs3', name: 'RPCS3', systems: 'PlayStation 3', url: 'https://rpcs3.net/download' },
  { id: 'pcsx2', name: 'PCSX2', systems: 'PlayStation 2', url: 'https://pcsx2.net/downloads' },
  { id: 'duckstation', name: 'DuckStation', systems: 'PlayStation 1', url: 'https://github.com/stenzek/duckstation/releases' },
  { id: 'ppsspp', name: 'PPSSPP', systems: 'PSP', url: 'https://www.ppsspp.org/download/' },
  { id: 'melonds', name: 'melonDS', systems: 'Nintendo DS', url: 'https://melonds.kuribo64.net/downloads.php' },
  { id: 'cemu', name: 'Cemu', systems: 'Wii U', url: 'https://cemu.info/' },
  { id: 'vita3k', name: 'Vita3K', systems: 'PS Vita', url: 'https://vita3k.org/#download' },
  { id: 'xemu', name: 'xemu', systems: 'Xbox', url: 'https://xemu.app/#download' },
  { id: 'azahar', name: 'Azahar', systems: '3DS', url: 'https://github.com/azahar-emu/azahar/releases' },
  { id: 'ryujinx', name: 'Ryujinx', systems: 'Switch', url: 'https://ryujinx.app/' },
]

const platforms = [
  { id: 'nes', name: 'NES' }, { id: 'snes', name: 'Super NES' }, { id: 'n64', name: 'Nintendo 64' },
  { id: 'gb', name: 'Game Boy' }, { id: 'gbc', name: 'Game Boy Color' }, { id: 'gba', name: 'Game Boy Advance' },
  { id: 'genesis', name: 'Genesis' }, { id: 'ps1', name: 'PlayStation' }, { id: 'ps2', name: 'PlayStation 2' },
  { id: 'ps3', name: 'PlayStation 3' }, { id: 'psp', name: 'PSP' }, { id: 'nds', name: 'Nintendo DS' },
  { id: 'wii', name: 'Wii' }, { id: 'wiiu', name: 'Wii U' }, { id: 'xbox', name: 'Xbox' },
]

export default function App() {
  const [page, setPage] = useState('home')
  const [installed, setInstalled] = useState<string[]>([])
  const [games, setGames] = useState<{ id: string; title: string; plat: string }[]>([])

  function install(id: string, url: string) {
    setInstalled((cur) => cur.includes(id) ? cur : [...cur, id])
    window.open(url, '_blank')
  }

  function addGame() {
    setGames((g) => [{ id: String(Date.now()), title: 'Your ROM', plat: 'NES' }, ...g])
  }

  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr] bg-[#0e1116] text-white">
      <aside className="bg-[#161b22] border-r border-white/5 p-3">
        <div className="flex items-center gap-2 px-2 py-3 font-bold">
          <span className="w-8 h-8 rounded-full bg-pu grid place-items-center text-sm">P</span>
          PartyUp
        </div>
        {['home', 'emulators', 'scan', 'party'].map((id) => (
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
          <span>{installed.length} emulators</span>
        </div>
        {page === 'home' && (
          <>
            <h2 className="text-sm tracking-widest text-zinc-400 mb-3">RECENTLY ADDED</h2>
            <div className="flex gap-3 overflow-auto pb-4">
              {games.length ? games.slice(0, 12).map((g) => (
                <motion.div key={g.id} className="w-28 h-40 rounded bg-zinc-800 grid place-items-end p-2 text-sm" whileHover={{ y: -4 }}>{g.title}</motion.div>
              )) : <div className="text-zinc-500">Scan a folder of ROMs you own.</div>}
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
        {page === 'emulators' && (
          <div>
            <h1 className="text-2xl font-bold mb-1">Emulators</h1>
            <p className="text-zinc-400 mb-4">Install from the official page, like EmuDeck. PartyUp does not ship the cores.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {emulators.map((e) => (
                <div key={e.id} className="bg-[#161b22] rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{e.name}</div>
                    <div className="text-sm text-zinc-400">{e.systems}</div>
                  </div>
                  <button onClick={() => install(e.id, e.url)} className={`rounded px-3 py-1.5 text-sm font-semibold ${installed.includes(e.id) ? 'bg-white/10' : 'bg-pu'}`}>
                    {installed.includes(e.id) ? 'Installed' : 'Install'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {page === 'scan' && (
          <div>
            <h1 className="text-2xl font-bold mb-2">Scan</h1>
            <p className="text-zinc-400 mb-4">Add ROMs you already own. Nothing is downloaded.</p>
            <button onClick={addGame} className="bg-pu rounded px-4 py-2 font-semibold">Add a game</button>
          </div>
        )}
        {page === 'party' && <div><h1 className="text-2xl font-bold mb-2">Party</h1><p className="text-zinc-400">Create a room and play together.</p></div>}
        {!['home', 'emulators', 'scan', 'party'].includes(page) && (
          <div>
            <h1 className="text-2xl font-bold mb-2">{platforms.find((p) => p.id === page)?.name || page}</h1>
            <p className="text-zinc-400">Games you add for this platform show here. Install the matching emulator first.</p>
          </div>
        )}
      </main>
    </div>
  )
}
