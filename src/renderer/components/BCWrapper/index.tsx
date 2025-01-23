import './index.scss'

import { JSX, useEffect } from 'react'

import { BCURL } from '../../bc-env'
import { nanoid } from 'nanoid'

function BondageClubWrapper(): JSX.Element {
  const webviewId = 'webview' + nanoid()

  useEffect(() => {
    const webview = document.getElementById(webviewId) as Electron.WebviewTag
    const onDomReady = () => {
      if (window.isDev) {
        webview.openDevTools()
      }
    }

    const onDidFinishLoad = async () => {
      // Auto login, if enabled
      // Note: this is a bit hacky, but it works
      const { autologin, username } = await window.settings.load()
      if (autologin && username) {
        const { password } = await window.settings.loadCredentials(username)
        if (password) {
          webview.executeJavaScript(`
            (async () => {
              const nameEl = document.getElementById('InputName')
              const passwordEl = document.getElementById('InputPassword')
              if (nameEl && passwordEl) {
                nameEl.value = '${username}'
                passwordEl.value = '${password}'
              }

              while (!ServerIsConnected) {
                await new Promise((resolve) => setTimeout(resolve, 100))
              }
              LoginDoLogin()
            })()
          `)
        }
      }

      // Inject Plugins
      webview.executeJavaScript(`
        (async () => {
          setTimeout(() => {
            if (window.BCX_Loaded === undefined) {
              const n = document.createElement("script");
              n.setAttribute("language", "JavaScript");
              n.setAttribute("crossorigin", "anonymous");
              n.setAttribute("src", "https://jomshir98.github.io/bondage-club-extended/bcx.js?_=" + Date.now());
              n.onload = () => n.remove();
              document.head.appendChild(n);
            }
          }, 2000);
        })()
      `)
    }

    webview.addEventListener('dom-ready', onDomReady)
    webview.addEventListener('did-finish-load', onDidFinishLoad)

    return () => {
      webview.removeEventListener('dom-ready', onDomReady)
      webview.removeEventListener('did-finish-load', onDidFinishLoad)
    }
  })

  return <webview id={webviewId} className="bc-webview" src={BCURL} />
}

export default BondageClubWrapper
