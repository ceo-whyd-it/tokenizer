import { Token, TokenizerResult, TokenizerType, CustomTokenizerData } from '../types'

export interface TokenizerAdapter {
  tokenize(text: string): Promise<TokenizerResult>
}

export async function createTokenizer(type: TokenizerType, customData?: CustomTokenizerData): Promise<TokenizerAdapter> {
  console.log(`🏭 Creating tokenizer of type: ${type}`)
  
  try {
    switch (type) {
      case 'cl100k_base':
      case 'r50k_base':
        console.log(`📝 Loading TiktokenAdapter for ${type}`)
        const { TiktokenAdapter } = await import('./tiktoken')
        console.log(`✅ TiktokenAdapter loaded, creating instance for ${type}`)
        return new TiktokenAdapter(type)
      case 'llama3':
        console.log(`🦙 Loading Llama3Adapter`)
        const { Llama3Adapter } = await import('./llama3')
        console.log(`✅ Llama3Adapter loaded, creating instance`)
        return new Llama3Adapter()
      case 'custom':
        if (!customData) {
          throw new Error('Custom tokenizer requires model data')
        }
        console.log(`🎯 Loading CustomSentencePieceAdapter for ${customData.name}`)
        const { CustomSentencePieceAdapter } = await import('./custom-sentencepiece')
        console.log(`✅ CustomSentencePieceAdapter loaded, creating instance`)
        return new CustomSentencePieceAdapter(customData)
      default:
        const error = new Error(`Unknown tokenizer type: ${type}`)
        console.error(`❌ Unknown tokenizer type: ${type}`)
        throw error
    }
  } catch (error) {
    console.error(`💥 Failed to create tokenizer ${type}:`, error)
    throw error
  }
}