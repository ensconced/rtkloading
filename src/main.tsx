import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App'

// Reset default styles
const styleEl = document.createElement('style')
styleEl.textContent = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background-color: #0d1117; }
  button:hover { opacity: 0.85; }
  button:active { transform: scale(0.98); }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
`
document.head.appendChild(styleEl)

// Register the mock service worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/mockServiceWorker.js')
      console.log('[App] Service worker registered:', registration.scope)
      
      // Wait for the service worker to be ready before rendering
      await navigator.serviceWorker.ready
      console.log('[App] Service worker ready')
    } catch (error) {
      console.error('[App] Service worker registration failed:', error)
    }
  } else {
    console.warn('[App] Service workers not supported')
  }
}

// Start the app after service worker is registered
registerServiceWorker().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  )
})
