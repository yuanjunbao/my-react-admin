import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Create a worker instance
const worker = setupWorker(...handlers)

export { worker }