import { useEffect, useState } from 'react'
import { Journey } from './screens/Journey'
import { Discover } from './screens/Discover'
import { Phrases } from './screens/Phrases'
import { Kit } from './screens/Kit'
import { FanIcon, PackIcon, SpeechIcon, ToriiIcon } from './art/icons'

type Tab = 'journey' | 'discover' | 'phrases' | 'kit'

const tabs: { id: Tab; label: string; icon: (on: boolean) => JSX.Element }[] = [
  { id: 'journey', label: 'Journey', icon: (on) => <ToriiIcon filled={on} /> },
  { id: 'discover', label: 'Discover', icon: (on) => <FanIcon filled={on} /> },
  { id: 'phrases', label: 'Speak', icon: (on) => <SpeechIcon filled={on} /> },
  { id: 'kit', label: 'Kit', icon: (on) => <PackIcon filled={on} /> },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('journey')

  // stop any phrase mid-speech when leaving the tab
  useEffect(() => {
    return () => window.speechSynthesis?.cancel()
  }, [tab])

  return (
    <>
      {tab === 'journey' && <Journey />}
      {tab === 'discover' && <Discover />}
      {tab === 'phrases' && <Phrases />}
      {tab === 'kit' && <Kit />}

      <nav className="tabbar" aria-label="Main">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'on' : ''}
            aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => {
              setTab(t.id)
              window.scrollTo({ top: 0 })
            }}
          >
            {t.icon(tab === t.id)}
            {t.label}
          </button>
        ))}
      </nav>
    </>
  )
}
