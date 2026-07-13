import { Fragment, useEffect, useState } from 'react'
import { maybeStartInk } from './lib/liveSync'
import { maybeStartFeed } from './lib/liveFeed'
import { useFeedDot } from './components/FamilyFeed'
import { useHashRoute } from './hooks/useHashRoute'
import { useSolarClock } from './hooks/useSolarClock'
import { Journey } from './screens/Journey'
import { Discover } from './screens/Discover'
import { Treasures } from './screens/Treasures'
import { Phrases } from './screens/Phrases'
import { Kit } from './screens/Kit'
import { SyncImport } from './screens/SyncImport'
import { FanIcon, PackIcon, SpeechIcon, ToriiIcon, TreasureIcon } from './art/icons'
import { InkFilters } from './art/InkFilters'
import { Sumi } from './art/Sumi'

const tabs = [
  { id: 'journey', label: 'Journey', icon: (on: boolean) => <ToriiIcon filled={on} /> },
  { id: 'discover', label: 'Discover', icon: (on: boolean) => <FanIcon filled={on} /> },
  { id: 'treasures', label: 'Treasures', icon: (on: boolean) => <TreasureIcon filled={on} /> },
  { id: 'speak', label: 'Speak', icon: (on: boolean) => <SpeechIcon filled={on} /> },
  { id: 'kit', label: 'Kit', icon: (on: boolean) => <PackIcon filled={on} /> },
] as const

export default function App() {
  const [route, nav] = useHashRoute()
  const tab = route[0] || 'journey'
  useSolarClock()
  const feedDot = useFeedDot()

  // live family ink: boot once; when a remote merge lands, remount the screen
  // so every component re-reads localStorage (rare event, additive data)
  const [inkGen, setInkGen] = useState(0)
  useEffect(() => {
    void maybeStartInk()
    void maybeStartFeed() // the kairanban rides the same ink
    const bloom = () => setInkGen((g) => g + 1)
    window.addEventListener('tabi:ink', bloom)
    return () => window.removeEventListener('tabi:ink', bloom)
  }, [])

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
      <Fragment key={inkGen}>
        {tab === 'journey' && <Journey route={route} nav={nav} />}
        {tab === 'discover' && <Discover />}
        {tab === 'treasures' && <Treasures nav={nav} />}
        {tab === 'speak' && <Phrases />}
        {tab === 'kit' && <Kit />}
      </Fragment>

      <Sumi />

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
            {t.id === 'treasures' && feedDot && <span className="tab-dot" aria-label="new family pages" />}
          </button>
        ))}
      </nav>
    </>
  )
}
