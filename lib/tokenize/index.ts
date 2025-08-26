import { Token, TokenizerResult, TokenizerType } from '../types'

export interface TokenizerAdapter {
  tokenize(text: string): Promise<TokenizerResult>
}

export async function createTokenizer(type: TokenizerType): Promise<TokenizerAdapter> {
  switch (type) {
    case 'cl100k_base':
    case 'r50k_base':
      const { TiktokenAdapter } = await import('./tiktoken')
      return new TiktokenAdapter(type)
    case 'llama3':
      const { Llama3Adapter } = await import('./llama3')
      return new Llama3Adapter()
    default:
      throw new Error(`Unknown tokenizer type: ${type}`)
  }
}