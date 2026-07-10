import { useEffect } from 'react'
import { useHashRoute } from './hooks/useHashRoute'
import { useSolarClock } from './hooks/useSolarClock'
import { Journey } from './screens/Journey'
import { Discover } from './screens/Discover'
import { Phrases } from './screens/Phrases'
import { Kit } from './screens/Kit'
import { SyncImport } from './screens/SyncImport'
import { FanIcon, PackIcon, SpeechIcon, ToriiIcon } from './art/icons'
import { InkFilters } from './art/InkFilters'

const tabs = [
  { id: 'journey', label: 'Journey', icon: (on: boolean) => <ToriiIcon filled={on} /> },
  { id: 'discover', label: 'Discover', icon: (on: boolean) => <FanIcon filled={on} /> },
  { id: 'speak', label: 'Speak', icon: (on: boolean) => <SpeechIcon filled={on} /> },
  { id: 'kit', label: 'Kit', icon: (on: boolean) => <PackIcon filled={on} /> },
] as const

export default function App() {
  const [route, nav] = useHashRoute()
  const tab = route[0] || 'journey'
  useSolarClock()

  // stop any phrase mid-speech and reset scroll when the tab changes
  useEffect(() => {
    window.speechSynthesis?.cancel()
    window.scrollTo(0, 0)
  }, [tab])

  if (tab === 'sync') {
    return <SyncImport payload={route[1] ?? ''} nav={nav} />
  }

  return (
    <>
      <InkFilters />
      {tab === 'journey' && <Journey route={route} nav={nav} />}
      {tab === 'discover' && <Discover />}
      {tab === 'speak' && <Phrases />}
      {tab === 'kit' && <Kit />}

      <nav className="tabbar" aria-label="Main">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'on' : ''}
            aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => nav(t.id)}
          >
            {t.icon(tab === t.id)}
            {t.label}
          </button>
        ))}
      </nav>
    </>
  )
}
