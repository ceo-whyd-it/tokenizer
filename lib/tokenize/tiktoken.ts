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
      try {
        console.log(`🔧 Loading tiktoken encoder: ${this.encodingName}`)
        this.encoder = get_encoding(this.encodingName)
        console.log(`✅ Tiktoken encoder loaded: ${this.encodingName}`)
      } catch (error) {
        console.error(`❌ Failed to load tiktoken encoder ${this.encodingName}:`, error)
        throw error
      }
    } else {
      console.log(`♻️ Using cached tiktoken encoder: ${this.encodingName}`)
    }
    return this.encoder
  }

  async tokenize(text: string): Promise<TokenizerResult> {
    const startTime = performance.now()
    console.log(`🔀 Starting tiktoken tokenization for ${this.encodingName}, text length: ${text.length}`)
    
    try {
      console.log(`📥 Getting encoder for ${this.encodingName}`)
      const encoder = await this.getEncoder()
      
      console.log(`🎯 Encoding text with ${this.encodingName}`)
      const tokenIds = encoder.encode(text)
      console.log(`📊 Encoded to ${tokenIds.length} token IDs with ${this.encodingName}`)
      
      const tokens: Token[] = []
      
      console.log(`🔄 Processing ${tokenIds.length} tokens for ${this.encodingName}`)
      let currentPos = 0
      for (let i = 0; i < tokenIds.length; i++) {
        if (i % 100 === 0 && i > 0) {
          console.log(`⏳ Processed ${i}/${tokenIds.length} tokens for ${this.encodingName}`)
        }
        
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
      console.log(`✅ Tiktoken tokenization completed for ${this.encodingName}: ${tokens.length} tokens in ${Math.round(latency)}ms`)
      
      return {
        tokens,
        totalTokens: tokens.length,
        latency: Math.round(latency)
      }
    } catch (error) {
      console.warn(`Tiktoken tokenization failed for ${this.encodingName}, using fallback:`, error)
      
      // Fallback to simple tokenization
      const tokens: Token[] = []
      const parts = text.split(/(\s+)/g).filter(part => part.length > 0)
      
      let currentPos = 0
      parts.forEach((part, i) => {
        if (part.match(/\s+/)) {
          // Whitespace token
          tokens.push({
            index: i,
            id: i + (this.encodingName === 'cl100k_base' ? 50000 : 10000),
            piece: part,
            start: currentPos,
            end: currentPos + part.length,
            bytes: new TextEncoder().encode(part).length
          })
        } else {
          // Split words into smaller chunks (simulating BPE)
          const chunks = part.match(/.{1,3}/g) || [part]
          chunks.forEach((chunk) => {
            tokens.push({
              index: tokens.length,
              id: tokens.length + (this.encodingName === 'cl100k_base' ? 50000 : 10000),
              piece: chunk,
              start: currentPos,
              end: currentPos + chunk.length,
              bytes: new TextEncoder().encode(chunk).length
            })
            currentPos += chunk.length
          })
          return
        }
        currentPos += part.length
      })
      
      const latency = performance.now() - startTime
      
      return {
        tokens,
        totalTokens: tokens.length,
        latency: Math.round(latency)
      }
    }
  }
}