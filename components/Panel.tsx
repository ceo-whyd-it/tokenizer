'use client'

import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TokenText } from './TokenText'
import { TokenTable } from './TokenTable'
import { PanelState, TokenizerType } from '@/lib/types'
import { Loader2 } from 'lucide-react'

interface PanelProps {
  state: PanelState
  showWhitespace: boolean
  onTokenizerChange: (tokenizer: TokenizerType) => void
}

const TOKENIZER_OPTIONS = [
  // OpenAI Models
  { value: 'cl100k_base', label: 'GPT-3.5/4 (cl100k_base)' },
  { value: 'r50k_base', label: 'GPT-2/3 (r50k_base)' },
  { value: 'p50k_base', label: 'Codex/Davinci (p50k_base)' },
  { value: 'p50k_edit', label: 'Edit Models (p50k_edit)' },
  { value: 'o200k_base', label: 'GPT-4o (o200k_base)' },
  { value: 'o200k_harmony', label: 'GPT-4o Harmony (o200k_harmony)' },
  
  // Meta Models
  { value: 'llama3', label: 'Llama-3' },
  { value: 'meta-llama/Meta-Llama-3-8B', label: 'Meta Llama 3 8B' },
  
  // Google Models
  { value: 'google/gemma-7b', label: 'Google Gemma 7B' },
  
  // Microsoft Models
  { value: 'microsoft/phi-2', label: 'Microsoft Phi-2' },
  
  // DeepSeek Models
  { value: 'deepseek-ai/DeepSeek-R1', label: 'DeepSeek R1' },
  
  // Qwen Models
  { value: 'Qwen/Qwen2.5-72B', label: 'Qwen 2.5 72B' },
  
  // Falcon Models
  { value: 'tiiuae/falcon-7b', label: 'Falcon 7B' },
  
  // OpenAI Open Models
  { value: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B' },
  
  // Custom Models
  { value: 'custom:Hviezdo 512', label: 'Hviezdo 512 (Custom)' },
  { value: 'custom:Hviezdo LLaMA CulturaX', label: 'Hviezdo LLaMA CulturaX (Custom)' },
  { value: 'custom:Hviezdo LLaMA All HV 32k', label: 'Hviezdo LLaMA All HV 32k (Custom)' },
]

export function Panel({ state, showWhitespace, onTokenizerChange }: PanelProps) {
  const [hoveredToken, setHoveredToken] = React.useState<number | null>(null)

  return (
    <Card className="h-full">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <Select
            value={state.tokenizer}
            onChange={(e) => onTokenizerChange(e.target.value as TokenizerType)}
            className="w-full"
          >
            {TOKENIZER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Badge variant="secondary" className="ml-4">
            {state.loading ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              state.totalTokens
            )} tokens
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {state.loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="text" className="flex-1">Colored Text</TabsTrigger>
              <TabsTrigger value="list" className="flex-1">Token List</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="mt-4">
              <ScrollArea className="h-[400px] p-4 border rounded-md">
                <TokenText
                  tokens={state.tokens}
                  showWhitespace={showWhitespace}
                  hoveredToken={hoveredToken}
                  onTokenHover={setHoveredToken}
                />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="list" className="mt-4">
              <TokenTable
                tokens={state.tokens}
                hoveredToken={hoveredToken}
                onTokenHover={setHoveredToken}
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground">
        {state.latency > 0 && `Processed in ${state.latency}ms`}
      </CardFooter>
    </Card>
  )
}

const ScrollArea = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`overflow-auto ${className}`}>{children}</div>
)