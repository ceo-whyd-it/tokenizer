import { CustomTokenizerData } from './types'

// Pre-loaded models available in the public/models directory
export const PRELOADED_MODELS: CustomTokenizerData[] = [
  {
    name: 'custom_hviezdo',
    modelUrl: '/models/custom_hviezdo.model'
  }
]

export function getPreloadedModel(name: string): CustomTokenizerData | undefined {
  return PRELOADED_MODELS.find(model => model.name === name)
}

export function getAllPreloadedModels(): CustomTokenizerData[] {
  return PRELOADED_MODELS
}