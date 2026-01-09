// Mock Service Worker - intercepts fetch requests and returns mock responses

const ITEMS = {
  1: { id: 1, name: 'Item One', value: 100 },
  2: { id: 2, name: 'Item Two', value: 200 },
  3: { id: 3, name: 'Item Three', value: 300 },
}

let requestCounter = 0

// Default delay in ms
const DEFAULT_DELAY = 1500

self.addEventListener('install', (event) => {
  console.log('[SW] Installing mock service worker...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[SW] Mock service worker activated')
  event.waitUntil(clients.claim())
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  
  // Only intercept our API requests
  if (!url.pathname.startsWith('/api/')) {
    return
  }
  
  // Match /api/items/:id
  const itemMatch = url.pathname.match(/^\/api\/items\/(\d+)$/)
  if (itemMatch) {
    event.respondWith(handleGetItem(itemMatch[1], url.searchParams))
    return
  }
})

async function handleGetItem(idStr, params) {
  const id = parseInt(idStr)
  const delayMs = params.has('delay') ? parseInt(params.get('delay')) : DEFAULT_DELAY
  const shouldFail = params.get('fail') === 'true'
  const failRate = params.has('failRate') ? parseFloat(params.get('failRate')) : 0
  
  console.log(`[SW] Fetching item ${id} (delay: ${delayMs}ms, fail: ${shouldFail}, failRate: ${failRate})`)
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, delayMs))
  
  // Check if we should fail
  if (shouldFail || (failRate > 0 && Math.random() < failRate)) {
    console.log(`[SW] ❌ Returning error for item ${id}`)
    return new Response(
      JSON.stringify({
        error: 'Server error',
        message: `Simulated failure for item ${id}`,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
  
  const item = ITEMS[id]
  if (!item) {
    return new Response(
      JSON.stringify({ error: 'Item not found' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
  
  requestCounter++
  
  return new Response(
    JSON.stringify({
      ...item,
      fetchCount: requestCounter,
      fetchedAt: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
