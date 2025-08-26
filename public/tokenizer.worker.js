// Tokenizer Worker for client-side tokenization
importScripts('https://cdn.jsdelivr.net/npm/@dqbd/tiktoken@1.0.15/tiktoken_bg.js')

let tokenizers = {}

async function initTiktoken(encoding) {
  if (!tokenizers[encoding]) {
    const module = await import('https://cdn.jsdelivr.net/npm/@dqbd/tiktoken@1.0.15/tiktoken_bg.wasm')
    await module.default()
    const { get_encoding } = await import('https://cdn.jsdelivr.net/npm/@dqbd/tiktoken@1.0.15/tiktoken.js')
    tokenizers[encoding] = get_encoding(encoding)
  }
  return tokenizers[encoding]
}

async function tokenizeWithTiktoken(text, encoding) {
  const encoder = await initTiktoken(encoding)
  const tokenIds = encoder.encode(text)
  const tokens = []
  
  let currentPos = 0
  for (let i = 0; i < tokenIds.length; i++) {
    const tokenId = tokenIds[i]
    const piece = encoder.decode([tokenId])
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
  
  return tokens
}

self.onmessage = async function(event) {
  const { id, method, params } = event.data
  
  try {
    const startTime = performance.now()
    let tokens = []
    
    if (method === 'tokenize') {
      const { text, tokenizer } = params
      
      if (tokenizer === 'cl100k_base' || tokenizer === 'r50k_base') {
        tokens = await tokenizeWithTiktoken(text, tokenizer)
      } else if (tokenizer === 'llama3') {
        // For now, we'll use a simplified tokenization for llama3
        // In production, you'd integrate a proper Llama tokenizer
        tokens = text.split(/(\s+|[^\w\s]+)/g).filter(Boolean).map((piece, i) => ({
          index: i,
          id: i,
          piece: piece,
          start: text.indexOf(piece),
          end: text.indexOf(piece) + piece.length,
          bytes: new TextEncoder().encode(piece).length
        }))
      }
    }
    
    const latency = performance.now() - startTime
    
    self.postMessage({
      id,
      result: {
        tokens,
        totalTokens: tokens.length,
        latency: Math.round(latency)
      }
    })
  } catch (error) {
    self.postMessage({
      id,
      error: error.message
    })
  }
}