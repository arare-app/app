import { ipcMain, safeStorage } from 'electron'
import Store from 'electron-store'

interface Settings {
  autoLogin: boolean
  username: string
  password?: string
}

export function registerHandlers() {
  const store = new Store<Settings>()

  ipcMain.handle('loadSettings', (_event, _arg) => {
    return {
      autologin: store.get('autoLogin', false),
      username: store.get('username'),
    }
  })

  ipcMain.handle('saveSettings', (_event, arg) => {
    store.set('autoLogin', arg.autologin)
    store.set('username', arg.username)
    store.set('password', safeStorage.encryptString(arg.password).toString('base64'))
    return true
  })

  ipcMain.handle('loadCredentials', async (_event, arg) => {
    const password = safeStorage.decryptString(Buffer.from(store.get('password', ''), 'base64'))
    return {
      username: arg.username,
      password,
    }
  })
}
