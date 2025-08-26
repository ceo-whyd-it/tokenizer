export interface Token {
  index: number
  id: number
  piece: string
  start: number
  end: number
  bytes: number
}

export interface TokenizerResult {
  tokens: Token[]
  totalTokens: number
  latency: number
}

export type TokenizerType = 'cl100k_base' | 'r50k_base' | 'llama3' | 'custom'

export interface CustomTokenizerData {
  modelFile?: File
  modelUrl?: string
  name: string
}

export interface PanelState {
  tokenizer: TokenizerType
  tokens: Token[]
  totalTokens: number
  latency: number
  loading: boolean
  customTokenizerData?: CustomTokenizerData
}