import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('settings', {
  async load() {
    return ipcRenderer.invoke('loadSettings')
  },
  async save(arg: { autologin: boolean; username: string; password: string }) {
    return ipcRenderer.invoke('saveSettings', arg)
  },
  async loadCredentials(username: string) {
    return ipcRenderer.invoke('loadCredentials', { username })
  },
})

contextBridge.exposeInMainWorld('isDev', !!process.env.VITE_DEV_SERVER_URL)
