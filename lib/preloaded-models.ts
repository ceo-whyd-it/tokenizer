import { CustomTokenizerData } from './types'

// Pre-loaded models available in the public/models directory
export const PRELOADED_MODELS: CustomTokenizerData[] = [
  {
    name: 'Hviezdo 512',
    modelUrl: '/models/sentp_hv_only_512.model'
  },
  {
    name: 'Hviezdo LLaMA CulturaX',
    modelUrl: '/models/sentp_llama_culturax_hv10_32000.model'
  }
]

export function getPreloadedModel(name: string): CustomTokenizerData | undefined {
  return PRELOADED_MODELS.find(model => model.name === name)
}

export function getAllPreloadedModels(): CustomTokenizerData[] {
  return PRELOADED_MODELS
}