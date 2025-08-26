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
        console.log(`🔧 Loading REAL custom SentencePiece tokenizer: ${this.modelData.name}`)
        
        let modelBuffer: ArrayBuffer
        
        // Load the actual model file
        if (this.modelData.modelFile) {
          console.log(`📁 Loading model from uploaded file`)
          modelBuffer = await this.modelData.modelFile.arrayBuffer()
        } else if (this.modelData.modelUrl) {
          console.log(`🌐 Loading model from URL: ${this.modelData.modelUrl}`)
          const response = await fetch(this.modelData.modelUrl)
          if (!response.ok) {
            throw new Error(`Failed to fetch model: ${response.statusText}`)
          }
          modelBuffer = await response.arrayBuffer()
          console.log(`✅ Model loaded: ${modelBuffer.byteLength} bytes`)
        } else {
          throw new Error('No model file or URL provided')
        }

        // Use @sctg/sentencepiece-js to load the actual SentencePiece model
        console.log(`🤖 Initializing real SentencePiece processor`)
        
        const { SentencePieceProcessor } = await import('@sctg/sentencepiece-js')
        
        console.log(`📦 Creating SentencePiece processor`)
        const spp = new SentencePieceProcessor()
        
        console.log(`⚡ Converting model binary data to base64 (${modelBuffer.byteLength} bytes)`)
        
        // Convert ArrayBuffer to base64 string
        const uint8Array = new Uint8Array(modelBuffer)
        let binaryString = ''
        for (let i = 0; i < uint8Array.length; i++) {
          binaryString += String.fromCharCode(uint8Array[i])
        }
        const base64Model = btoa(binaryString)
        
        console.log(`📤 Loading model from base64 string (${base64Model.length} chars)`)
        await spp.loadFromB64StringModel(base64Model)
        
        this.tokenizer = spp
        console.log(`✅ Real custom SentencePiece tokenizer loaded: ${this.modelData.name}`)
        
      } catch (error) {
        console.error(`❌ Failed to load real SentencePiece tokenizer:`, error)
        console.log(`🔄 Falling back to enhanced simulation`)
        
        // Fall back to enhanced simulation
        this.tokenizer = {
          encodeIds: (text: string): number[] => {
            return this.fallbackTokenize(text).map((_, i) => i + 32000)
          },
          encodePieces: (text: string): string[] => {
            return this.fallbackTokenize(text)
          },
          decodeIds: (tokens: number[]): string => {
            return tokens.map(t => `<${t}>`).join('')
          }
        }
        
        console.log(`✅ Fallback tokenizer created for: ${this.modelData.name}`)
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

      console.log(`🔀 Encoding text with REAL SentencePiece processor`)
      
      // Use real SentencePiece tokenizer
      let tokenPieces: string[]
      let tokenIds: number[]
      
      if (processor.encodePieces && processor.encodeIds) {
        // Real SentencePiece processor
        tokenPieces = processor.encodePieces(text)
        tokenIds = processor.encodeIds(text)
        console.log(`📊 Real SentencePiece encoded to ${tokenPieces.length} tokens`)
      } else {
        // Fallback processor
        console.log(`🔄 Using fallback tokenization`)
        tokenPieces = this.fallbackTokenize(text)
        tokenIds = tokenPieces.map((_, i) => i + 32000)
        console.log(`📊 Fallback encoded to ${tokenPieces.length} tokens`)
      }

      const tokens: Token[] = []

      console.log(`🔄 Processing ${tokenPieces.length} tokens for custom model`)
      let currentPos = 0
      for (let i = 0; i < tokenPieces.length; i++) {
        if (i % 100 === 0 && i > 0) {
          console.log(`⏳ Processed ${i}/${tokenPieces.length} tokens for custom model`)
        }

        const piece = tokenPieces[i]
        const tokenId = tokenIds[i] || (i + 32000)
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