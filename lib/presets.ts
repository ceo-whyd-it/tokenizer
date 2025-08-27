import { TokenizerType } from './types'

export interface Preset {
  name: string
  input_text: string
  Tokenizer_1: TokenizerType
  Tokenizer_2: TokenizerType
  Tokenizer_3: TokenizerType
}

// Default presets that come with the app
export const DEFAULT_PRESETS: Preset[] = [
  {
    name: "OpenAI Comparison",
    input_text: "The quick brown fox jumps over the lazy dog. This is a test sentence for tokenization comparison.",
    Tokenizer_1: "cl100k_base",
    Tokenizer_2: "r50k_base", 
    Tokenizer_3: "o200k_base"
  },
  {
    name: "Custom vs GPT",
    input_text: "Dobrý deň! Ako sa máte? Toto je test slovenskej tokenizácie.",
    Tokenizer_1: "custom:Hviezdo 512",
    Tokenizer_2: "cl100k_base",
    Tokenizer_3: "custom:Hviezdo LLaMA CulturaX"
  },
  {
    name: "HuggingFace Models",
    input_text: "# Code Example\n\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
    Tokenizer_1: "google/gemma-7b",
    Tokenizer_2: "microsoft/phi-2",
    Tokenizer_3: "deepseek-ai/DeepSeek-R1"
  },
  {
    name: "Multi-Language Test",
    input_text: "Hello world! 你好世界! Здравствуй мир! مرحبا بالعالم! こんにちは世界！",
    Tokenizer_1: "Qwen/Qwen2.5-72B",
    Tokenizer_2: "cl100k_base",
    Tokenizer_3: "google/gemma-7b"
  },
  {
    name: "Coding Comparison", 
    input_text: `import React, { useState, useEffect } from 'react'

const TokenizerApp = () => {
  const [text, setText] = useState('')
  const [tokens, setTokens] = useState([])
  
  useEffect(() => {
    // Tokenize when text changes
    tokenizeText(text)
  }, [text])
  
  return <div>{tokens.length} tokens</div>
}`,
    Tokenizer_1: "deepseek-ai/DeepSeek-R1",
    Tokenizer_2: "p50k_base",
    Tokenizer_3: "cl100k_base"
  }
]

const PRESETS_STORAGE_KEY = 'tokenizer-presets'

export function getStoredPresets(): Preset[] {
  try {
    const stored = localStorage.getItem(PRESETS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Validate the structure
      if (Array.isArray(parsed) && parsed.every(isValidPreset)) {
        return parsed
      }
    }
  } catch (error) {
    console.warn('Failed to load presets from localStorage:', error)
  }
  return DEFAULT_PRESETS
}

export function savePresets(presets: Preset[]): void {
  try {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets))
  } catch (error) {
    console.error('Failed to save presets to localStorage:', error)
  }
}

export function isValidPreset(preset: any): preset is Preset {
  return (
    preset &&
    typeof preset.name === 'string' &&
    typeof preset.input_text === 'string' &&
    typeof preset.Tokenizer_1 === 'string' &&
    typeof preset.Tokenizer_2 === 'string' &&
    typeof preset.Tokenizer_3 === 'string'
  )
}

export function exportPresets(presets: Preset[]): string {
  return JSON.stringify(presets, null, 2)
}

export function importPresets(jsonString: string): Preset[] {
  try {
    const parsed = JSON.parse(jsonString)
    if (Array.isArray(parsed) && parsed.every(isValidPreset)) {
      return parsed
    } else {
      throw new Error('Invalid preset format')
    }
  } catch (error) {
    throw new Error(`Failed to import presets: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function mergePresets(existing: Preset[], imported: Preset[]): Preset[] {
  const merged = [...existing]
  
  for (const importedPreset of imported) {
    // Check if preset with same name already exists
    const existingIndex = merged.findIndex(p => p.name === importedPreset.name)
    if (existingIndex >= 0) {
      // Replace existing preset
      merged[existingIndex] = importedPreset
    } else {
      // Add new preset
      merged.push(importedPreset)
    }
  }
  
  return merged
}

export function validatePresetName(name: string, existingPresets: Preset[]): string | null {
  if (!name.trim()) {
    return 'Preset name is required'
  }
  
  if (name.trim().length > 50) {
    return 'Preset name must be 50 characters or less'
  }
  
  if (existingPresets.some(p => p.name === name.trim())) {
    return 'Preset name already exists'
  }
  
  return null
}