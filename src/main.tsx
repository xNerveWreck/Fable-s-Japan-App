// migrate v1 boolean check-offs to tri-state moments before anything renders
try {
  const old = localStorage.getItem('tabi:checked')
  if (old) {
    if (!localStorage.getItem('tabi:moments')) {
      const moments: Record<string, string> = {}
      for (const [key, val] of Object.entries(JSON.parse(old) as Record<string, boolean>)) {
        if (val) moments[key] = 'done'
      }
      localStorage.setItem('tabi:moments', JSON.stringify(moments))
    }
    localStorage.removeItem('tabi:checked')
  }
} catch {
  /* corrupted old state — start clean rather than crash */
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'
import './styles/screens.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// offline support — the whole trip in your pocket, no signal required
if ('serviceWorker' in navigator && !location.hostname.includes('localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* offline mode is a bonus, never a blocker */
    })
  })
}
