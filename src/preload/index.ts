import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('party', {
  library: () => ipcRenderer.invoke('library:list'),
  emulators: () => ipcRenderer.invoke('emu:list'),
  meta: () => ipcRenderer.invoke('meta:sources'),
  achievements: () => ipcRenderer.invoke('ach:platforms'),
})
