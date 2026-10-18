import { contextBridge, ipcRenderer } from 'electron'

const call = (ch: string) => ipcRenderer.invoke(ch)

contextBridge.exposeInMainWorld('party', {
  library: () => call('library:list'),
  emulators: () => call('emu:list'),
  meta: () => call('meta:sources'),
  achievements: () => call('ach:platforms'),
  steam: () => call('steam:status'),
  mods: () => call('mods:sources'),
  multiplayer: () => call('mp:clients'),
  cloud: () => call('cloud:list'),
  optimize: () => call('opt:tools'),
  hoard: () => call('hoard:stats'),
})
