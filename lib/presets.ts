import { TokenizerType } from './types'

export interface Preset {
  name: string
  input_text: string
  Tokenizer_1: TokenizerType
  Tokenizer_2: TokenizerType
  Tokenizer_3: TokenizerType
}

// Cache for loaded default presets
let cachedDefaultPresets: Preset[] | null = null

// Load default presets from JSON file
export async function loadDefaultPresets(): Promise<Preset[]> {
  if (cachedDefaultPresets) {
    return cachedDefaultPresets
  }

  try {
    console.log('📁 Loading default presets from JSON file')
    const response = await fetch('/presets/default-presets.json')
    
    if (!response.ok) {
      throw new Error(`Failed to fetch default presets: ${response.statusText}`)
    }
    
    const presets = await response.json()
    
    // Validate the loaded presets
    if (Array.isArray(presets) && presets.every(isValidPreset)) {
      cachedDefaultPresets = presets
      console.log(`✅ Loaded ${presets.length} default presets from JSON`)
      return presets
    } else {
      throw new Error('Invalid preset format in JSON file')
    }
  } catch (error) {
    console.error('❌ Failed to load default presets from JSON:', error)
    console.log('🔄 Using fallback default presets')
    
    // Fallback to hardcoded presets if JSON loading fails
    const fallbackPresets: Preset[] = [
      {
        name: "Basic Test",
        input_text: "The quick brown fox jumps over the lazy dog.",
        Tokenizer_1: "cl100k_base",
        Tokenizer_2: "r50k_base",
        Tokenizer_3: "o200k_base"
      }
    ]
    
    cachedDefaultPresets = fallbackPresets
    return fallbackPresets
  }
}

const PRESETS_STORAGE_KEY = 'tokenizer-presets'

export async function getStoredPresets(): Promise<Preset[]> {
  try {
    const stored = localStorage.getItem(PRESETS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Validate the structure
      if (Array.isArray(parsed) && parsed.every(isValidPreset)) {
        console.log(`📦 Loaded ${parsed.length} presets from localStorage`)
        return parsed
      }
    }
  } catch (error) {
    console.warn('Failed to load presets from localStorage:', error)
  }
  
  // No stored presets, load defaults from JSON
  console.log('📁 No stored presets found, loading defaults')
  return await loadDefaultPresets()
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