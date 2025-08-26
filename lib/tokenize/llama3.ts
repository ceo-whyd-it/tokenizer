import { Token, TokenizerResult } from '../types'
import { TokenizerAdapter } from './index'

export class Llama3Adapter implements TokenizerAdapter {
  private tokenizer: any = null

  private async getTokenizer() {
    if (!this.tokenizer) {
      const { AutoTokenizer } = await import('@xenova/transformers')
      this.tokenizer = await AutoTokenizer.from_pretrained('Xenova/llama-3-tokenizer')
    }
    return this.tokenizer
  }

  async tokenize(text: string): Promise<TokenizerResult> {
    const startTime = performance.now()
    
    try {
      const tokenizer = await this.getTokenizer()
      const encoded = await tokenizer(text, { return_tensor: false })
      
      const tokens: Token[] = []
      const tokenIds = encoded.input_ids
      
      let currentPos = 0
      for (let i = 0; i < tokenIds.length; i++) {
        const tokenId = tokenIds[i]
        const piece = tokenizer.decode([tokenId], { skip_special_tokens: false })
        const bytes = new TextEncoder().encode(piece).length
        
        tokens.push({
          index: i,
          id: tokenId,
          piece: piece,
          start: currentPos,
          end: currentPos + piece.length,
          bytes: bytes
        })
        
        currentPos += piece.length
      }
      
      const latency = performance.now() - startTime
      
      return {
        tokens,
        totalTokens: tokens.length,
        latency: Math.round(latency)
      }
    } catch (error) {
      console.error('Llama3 tokenization error:', error)
      return {
        tokens: [],
        totalTokens: 0,
        latency: 0
      }
    }
  }
}