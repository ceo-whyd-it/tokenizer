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
        
        let modelBuffer: ArrayBuffer
        
        // Load model from File or URL
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
        } else {
          throw new Error('No model file or URL provided')
        }
        
        // Load sentencepiece-js
        const { SentencePieceProcessor } = await import('sentencepiece-js')
        
        console.log(`✅ SentencePiece library loaded, initializing processor`)
        this.tokenizer = new SentencePieceProcessor()
        
        // Load the model
        await this.tokenizer.loadFromBuffer(new Uint8Array(modelBuffer))
        console.log(`✅ Custom SentencePiece model loaded: ${this.modelData.name}`)
        
      } catch (error) {
        console.error(`❌ Failed to load custom SentencePiece tokenizer:`, error)
        throw error
      }
    } else {
      console.log(`♻️ Using cached custom SentencePiece tokenizer: ${this.modelData.name}`)
    }
    return this.tokenizer
  }

  async tokenize(text: string): Promise<TokenizerResult> {
    const startTime = performance.now()
    console.log(`🎯 Starting custom SentencePiece tokenization: ${this.modelData.name}, text length: ${text.length}`)

    try {
      console.log(`📥 Getting custom SentencePiece processor`)
      const processor = await this.getTokenizer()

      console.log(`🔀 Encoding text with custom SentencePiece`)
      const tokenIds = processor.encode(text)
      console.log(`📊 Encoded to ${tokenIds.length} token IDs with custom model`)

      const tokens: Token[] = []

      console.log(`🔄 Processing ${tokenIds.length} tokens for custom model`)
      let currentPos = 0
      for (let i = 0; i < tokenIds.length; i++) {
        if (i % 100 === 0 && i > 0) {
          console.log(`⏳ Processed ${i}/${tokenIds.length} tokens for custom model`)
        }

        const tokenId = tokenIds[i]
        const piece = processor.decode([tokenId])
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
      
      // Fallback to simple tokenization
      console.log(`🔄 Using fallback tokenization for custom model`)
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