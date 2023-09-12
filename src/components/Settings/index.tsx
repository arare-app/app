import './index.scss'

import React, { JSX } from 'react'

import { Button, Classes, FormGroup, Label, Switch } from '@blueprintjs/core'
import { Cross, InfoSign } from '@blueprintjs/icons'

declare global {
  interface Window {
    settings: {
      load: () => Promise<{
        autologin: boolean
        username: string
      }>
      save: (settings: { autologin: boolean; username: string; password: string }) => Promise<void>
      loadCredentials: (username: string) => Promise<{ username: string; password: string }>
    }
    isDev: boolean
  }
}

export interface Props {
  onClose?: () => void
}

function Settings(props: Props): JSX.Element {
  const [show, setShow] = React.useState(true)
  const [autologin, setAutologin] = React.useState(false)
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')

  React.useEffect(() => {
    window.settings.load().then((settings) => {
      setAutologin(settings.autologin)
      setUsername(settings.username)

      if (settings.autologin && settings.username) {
        window.settings.loadCredentials(settings.username).then(({ password }) => {
          setPassword(password)
        })
      }
    })
  }, [])

  const save = () => {
    window.settings.save({ autologin, username, password })
    setShow(false)
    props.onClose?.()
  }
  const cancel = () => {
    setShow(false)
    props.onClose?.()
  }
  return (
    <div className="mask">
      <div id="settings" className={show ? 'show' : 'hide'}>
        <h3 className="mb-3">Settings</h3>
        <Cross className="absolute top-3 right-4" onClick={cancel} />
        <FormGroup className="settings">
          <Switch type="switch" id="switch-autologin" label="Enable Auto-Login" checked={autologin} inline onChange={() => setAutologin(!autologin)} />
          <InfoSign title="Auto-Login will automatically login to the last used account." />
          {autologin && (
            <>
              <Label>
                Username
                <input className={Classes.INPUT} type="text" value={username} onChange={(ev) => setUsername(ev.target.value)} />
              </Label>
              <Label>
                Password
                <InfoSign title="The application uses Windows Credential Manager (Windows) or Keychain (Mac) to safely save your password with encryption provided by your operating system. Theoractically, it is safe to save your password since there are only authorized programmes can access it. However, if you are not comfortable with this, you can disable Auto-Login and enter your password manually each time." />
                <input className={Classes.INPUT} type="password" value={password} onChange={(ev) => setPassword(ev.target.value)} />
              </Label>
            </>
          )}

          <div className="mt-3">
            <Button intent="primary" onClick={save}>
              Save
            </Button>
            <Button className="ml-2" onClick={cancel}>
              Cancel
            </Button>
          </div>
        </FormGroup>
      </div>
    </div>
  )
}

export default Settings
