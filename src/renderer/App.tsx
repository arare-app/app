import './App.scss'

import BondageClubWrapper from './components/BCWrapper'
import Settings from './components/Settings'
import { useState } from 'react'
import { Cog } from '@blueprintjs/icons'

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const openSettings = () => {
    setSettingsOpen(true)
  }

  return (
    <div className="app">
      <BondageClubWrapper />
      <Cog onClick={openSettings} />
      {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}

export default App
