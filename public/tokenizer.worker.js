// Simple tokenizer worker for fallback
// Since Web Workers can't easily import ES modules, we'll implement simple tokenization

function simpleTokenize(text, tokenizer) {
  // Basic word-level tokenization as fallback
  // This is a simplified version - real tokenizers are much more complex
  
  let tokens = []
  
  if (tokenizer === 'llama3') {
    // Simple word + punctuation splitting for Llama3
    const parts = text.split(/(\s+|[^\w\s])/g).filter(part => part.length > 0)
    let currentPos = 0
    
    parts.forEach((piece, i) => {
      tokens.push({
        index: i,
        id: i + 1000, // Fake ID for demo
        piece: piece,
        start: currentPos,
        end: currentPos + piece.length,
        bytes: new TextEncoder().encode(piece).length
      })
      currentPos += piece.length
    })
  } else {
    // For GPT tokenizers, use basic BPE-like splitting
    const parts = text.split(/(\s+)/g).filter(part => part.length > 0)
    let currentPos = 0
    
    parts.forEach((part, i) => {
      if (part.match(/\s+/)) {
        // Whitespace token
        tokens.push({
          index: i,
          id: i + (tokenizer === 'cl100k_base' ? 50000 : 10000),
          piece: part,
          start: currentPos,
          end: currentPos + part.length,
          bytes: new TextEncoder().encode(part).length
        })
      } else {
        // Split words into smaller chunks (simulating BPE)
        const chunks = part.match(/.{1,3}/g) || [part]
        chunks.forEach((chunk, j) => {
          tokens.push({
            index: tokens.length,
            id: tokens.length + (tokenizer === 'cl100k_base' ? 50000 : 10000),
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
      tokens = simpleTokenize(text, tokenizer)
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