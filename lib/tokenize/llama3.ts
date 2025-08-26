import { Token, TokenizerResult } from '../types'
import { TokenizerAdapter } from './index'

export class Llama3Adapter implements TokenizerAdapter {
  async tokenize(text: string): Promise<TokenizerResult> {
    const startTime = performance.now()
    
    // Simple Llama3-style tokenization fallback
    // This is a simplified approximation for demonstration purposes
    const tokens: Token[] = []
    
    // Llama tokenizers typically handle special tokens differently
    // For demo purposes, we'll do a more sophisticated split than basic word tokenization
    
    // Handle common patterns in Llama3 tokenization
    const specialTokenPattern = /<\|[^|]+\|>/g
    const parts: string[] = []
    let lastIndex = 0
    let match
    
    // Extract special tokens first
    while ((match = specialTokenPattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        // Add text before special token
        const beforeSpecial = text.slice(lastIndex, match.index)
        if (beforeSpecial) {
          parts.push(...this.tokenizeRegularText(beforeSpecial))
        }
      }
      // Add special token
      parts.push(match[0])
      lastIndex = match.index + match[0].length
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      const remaining = text.slice(lastIndex)
      if (remaining) {
        parts.push(...this.tokenizeRegularText(remaining))
      }
    }
    
    // If no special tokens found, just tokenize the whole text
    if (parts.length === 0) {
      parts.push(...this.tokenizeRegularText(text))
    }
    
    // Convert to token objects
    let currentPos = 0
    parts.forEach((piece, i) => {
      // Find the actual position of this piece in the original text
      const pieceStart = text.indexOf(piece, currentPos)
      const pieceEnd = pieceStart + piece.length
      
      tokens.push({
        index: i,
        id: this.getPseudoTokenId(piece),
        piece: piece,
        start: pieceStart >= 0 ? pieceStart : currentPos,
        end: pieceStart >= 0 ? pieceEnd : currentPos + piece.length,
        bytes: new TextEncoder().encode(piece).length
      })
      
      currentPos = pieceStart >= 0 ? pieceEnd : currentPos + piece.length
    })
    
    const latency = performance.now() - startTime
    
    return {
      tokens,
      totalTokens: tokens.length,
      latency: Math.round(latency)
    }
  }
  
  private tokenizeRegularText(text: string): string[] {
    // Split on word boundaries, punctuation, and whitespace, but preserve them
    return text.split(/(\s+|[^\w\s])/g).filter(part => part.length > 0)
  }
  
  private getPseudoTokenId(piece: string): number {
    // Generate pseudo token IDs that somewhat resemble Llama3 token ID ranges
    if (piece.match(/<\|[^|]+\|>/)) {
      // Special tokens typically have high IDs in Llama3
      return 128000 + piece.charCodeAt(2) // Use character code for consistency
    } else if (piece.match(/\s+/)) {
      // Whitespace tokens
      return 220 + piece.charCodeAt(0)
    } else if (piece.match(/[^\w\s]/)) {
      // Punctuation
      return 1000 + piece.charCodeAt(0)
    } else {
      // Regular text - create a hash-like ID
      let hash = 0
      for (let i = 0; i < piece.length; i++) {
        hash = ((hash << 5) - hash + piece.charCodeAt(i)) & 0xffffffff
      }
      return Math.abs(hash) % 50000 + 10000 // Keep in reasonable range
    }
  }
}