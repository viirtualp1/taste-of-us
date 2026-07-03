import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

let worker: ReturnType<typeof setupWorker> | null = null

export async function startMockServiceWorker() {
  if (worker) {
    return worker
  }

  worker = setupWorker(...handlers)

  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
    quiet: false,
  })

  console.info('[msw] Mock API enabled for local development')
  return worker
}
