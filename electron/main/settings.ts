import { credentials } from '@arare/core'
import { ipcMain } from 'electron'
import Store from 'electron-store'

export function registerHandlers() {
  const store = new Store()

  ipcMain.handle('loadSettings', (_event, _arg) => {
    return {
      autologin: store.get('autoLogin', false),
      username: store.get('username'),
    }
  })

  ipcMain.handle('saveSettings', (_event, arg) => {
    store.set('autoLogin', arg.autologin)
    store.set('username', arg.username)
    credentials.save('bondage-club-electron', arg.username, arg.password)
    return true
  })

  ipcMain.handle('loadCredentials', async (_event, arg) => {
    const password = await credentials.load('bondage-club-electron', arg.username)
    return {
      username: arg.username,
      password,
    }
  })
}
