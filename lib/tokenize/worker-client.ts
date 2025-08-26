import { TokenizerResult, TokenizerType } from '../types'

export class WorkerTokenizer {
  private worker: Worker | null = null
  private requestId = 0
  private pendingRequests = new Map<number, { resolve: Function, reject: Function }>()

  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker('/tokenizer.worker.js')
      this.worker.onmessage = (event) => {
        const { id, result, error } = event.data
        const pending = this.pendingRequests.get(id)
        if (pending) {
          if (error) {
            pending.reject(new Error(error))
          } else {
            pending.resolve(result)
          }
          this.pendingRequests.delete(id)
        }
      }
    }
    return this.worker
  }

  async tokenize(text: string, tokenizer: TokenizerType): Promise<TokenizerResult> {
    const worker = this.getWorker()
    const id = this.requestId++

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject })
      worker.postMessage({
        id,
        method: 'tokenize',
        params: { text, tokenizer }
      })

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id)
          reject(new Error('Tokenization timeout'))
        }
      }, 30000)
    })
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.pendingRequests.clear()
  }
}