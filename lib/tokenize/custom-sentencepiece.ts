import { Token, TokenizerResult, CustomTokenizerData } from '../types'
import { TokenizerAdapter } from './index'

export class CustomSentencePieceAdapter implements TokenizerAdapter {
  private tokenizer: any = null
  private modelData: CustomTokenizerData

  constructor(modelData: CustomTokenizerData) {
    this.modelData = modelData
  }

  private async getTokenizer() {
    if (!this.tokenizer) {
      try {
        console.log(`🔧 Loading custom SentencePiece tokenizer: ${this.modelData.name}`)
        
        // For now, we'll create a mock tokenizer that simulates SentencePiece behavior
        // This is a simplified implementation until we can integrate a proper browser-compatible solution
        console.warn(`⚠️ Using fallback tokenizer for ${this.modelData.name} - SentencePiece library not available in browser`)
        
        this.tokenizer = {
          encode: (text: string): number[] => {
            // Simulate SentencePiece-like tokenization
            return this.fallbackTokenize(text).map((_, i) => i + 32000) // SentencePiece-like token IDs
          },
          decode: (tokens: number[]): string => {
            // Simple decode - not used in our current implementation
            return tokens.map(t => `<${t}>`).join('')
          }
        }
        
        console.log(`✅ Fallback custom tokenizer created for: ${this.modelData.name}`)
        
      } catch (error) {
        console.error(`❌ Failed to create custom SentencePiece tokenizer:`, error)
        throw error
      }
    } else {
      console.log(`♻️ Using cached custom SentencePiece tokenizer: ${this.modelData.name}`)
    }
    return this.tokenizer
  }

  private fallbackTokenize(text: string): string[] {
    // Enhanced tokenization for Slovak/Czech-focused model
    // This simulates what your custom Hviezdo models might do
    
    const tokens: string[] = []
    
    // Handle special characters common in Slovak/Czech
    const slovakChars = /[áčďéíľĺňóôŕšťúýžÁČĎÉÍĽĹŇÓÔŔŠŤÚÝŽ]/g
    
    // Split on various boundaries
    const parts = text.split(/(\s+|[^\w\sáčďéíľĺňóôŕšťúýžÁČĎÉÍĽĹŇÓÔŔŠŤÚÝŽ]+)/g)
      .filter(part => part.length > 0)
    
    for (const part of parts) {
      if (part.match(/\s+/)) {
        // Whitespace
        tokens.push(part)
      } else if (part.match(/[^\w\s]/)) {
        // Punctuation - split into individual characters
        tokens.push(...part.split(''))
      } else {
        // Text content - handle differently based on length
        if (part.length <= 3) {
          tokens.push(part)
        } else {
          // Break longer words into subword units (simulating BPE/SentencePiece)
          const subwords = this.breakIntoSubwords(part)
          tokens.push(...subwords)
        }
      }
    }
    
    return tokens
  }

  private breakIntoSubwords(word: string): string[] {
    // Simulate subword tokenization for Slovak content
    const subwords: string[] = []
    
    // Common Slovak prefixes and suffixes
    const prefixes = ['pre', 'nad', 'pod', 'pro', 'pri', 'za']
    const suffixes = ['ová', 'ová', 'ný', 'ná', 'né', 'ích', 'ami', 'och']
    
    let remaining = word.toLowerCase()
    
    // Check for prefixes
    for (const prefix of prefixes) {
      if (remaining.startsWith(prefix) && remaining.length > prefix.length + 2) {
        subwords.push(prefix)
        remaining = remaining.slice(prefix.length)
        break
      }
    }
    
    // Check for suffixes
    for (const suffix of suffixes) {
      if (remaining.endsWith(suffix) && remaining.length > suffix.length + 2) {
        const base = remaining.slice(0, -suffix.length)
        if (base.length >= 2) {
          subwords.push(base)
          subwords.push(suffix)
          return subwords.length > 0 ? subwords : [word]
        }
      }
    }
    
    // If no prefix/suffix matches, break into chunks
    if (subwords.length === 0) {
      remaining = word
    }
    
    // Break remaining into 2-4 character chunks
    while (remaining.length > 4) {
      const chunkSize = Math.min(4, Math.max(2, Math.floor(remaining.length / 2)))
      subwords.push(remaining.slice(0, chunkSize))
      remaining = remaining.slice(chunkSize)
    }
    
    if (remaining.length > 0) {
      subwords.push(remaining)
    }
    
    return subwords.length > 0 ? subwords : [word]
  }

  async tokenize(text: string): Promise<TokenizerResult> {
    const startTime = performance.now()
    console.log(`🎯 Starting custom SentencePiece tokenization: ${this.modelData.name}, text length: ${text.length}`)

    try {
      console.log(`📥 Getting custom SentencePiece processor`)
      const processor = await this.getTokenizer()

      console.log(`🔀 Encoding text with custom fallback tokenizer`)
      const tokenPieces = this.fallbackTokenize(text)
      console.log(`📊 Encoded to ${tokenPieces.length} tokens with custom model`)

      const tokens: Token[] = []

      console.log(`🔄 Processing ${tokenPieces.length} tokens for custom model`)
      let currentPos = 0
      for (let i = 0; i < tokenPieces.length; i++) {
        if (i % 100 === 0 && i > 0) {
          console.log(`⏳ Processed ${i}/${tokenPieces.length} tokens for custom model`)
        }

        const piece = tokenPieces[i]
        const tokenId = i + 32000 // SentencePiece-like token ID range
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
      console.log(`✅ Custom SentencePiece tokenization completed: ${tokens.length} tokens in ${Math.round(latency)}ms`)

      return {
        tokens,
        totalTokens: tokens.length,
        latency: Math.round(latency)
      }
    } catch (error) {
      console.error(`❌ Custom SentencePiece tokenization failed:`, error)
      
      // Ultimate fallback to simple tokenization
      console.log(`🔄 Using ultimate fallback tokenization for custom model`)
      const tokens: Token[] = []
      const parts = text.split(/(\s+|[^\w\s])/g).filter(part => part.length > 0)
      
      let currentPos = 0
      parts.forEach((piece, i) => {
        tokens.push({
          index: i,
          id: i + 200000, // Custom token ID range
          piece: piece,
          start: currentPos,
          end: currentPos + piece.length,
          bytes: new TextEncoder().encode(piece).length
        })
        currentPos += piece.length
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