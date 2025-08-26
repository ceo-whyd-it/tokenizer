import { get_encoding, Tiktoken } from '@dqbd/tiktoken'
import { Token, TokenizerResult } from '../types'
import { TokenizerAdapter } from './index'

export class TiktokenAdapter implements TokenizerAdapter {
  private encoder: Tiktoken | null = null
  private encodingName: 'cl100k_base' | 'r50k_base'

  constructor(encodingName: 'cl100k_base' | 'r50k_base') {
    this.encodingName = encodingName
  }

  private async getEncoder(): Promise<Tiktoken> {
    if (!this.encoder) {
      this.encoder = get_encoding(this.encodingName)
    }
    return this.encoder
  }

  async tokenize(text: string): Promise<TokenizerResult> {
    const startTime = performance.now()
    const encoder = await this.getEncoder()
    
    const tokenIds = encoder.encode(text)
    const tokens: Token[] = []
    
    let currentPos = 0
    for (let i = 0; i < tokenIds.length; i++) {
      const tokenId = tokenIds[i]
      const tokenArray = new Uint32Array([tokenId])
      const decodedBytes = encoder.decode(tokenArray)
      const piece = new TextDecoder().decode(decodedBytes)
      const bytes = decodedBytes.length
      
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
  }
}