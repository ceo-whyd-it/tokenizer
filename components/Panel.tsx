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
  { value: 'cl100k_base', label: 'GPT-3/4 (cl100k_base)' },
  { value: 'r50k_base', label: 'GPT-2 (r50k_base)' },
  { value: 'llama3', label: 'Llama-3' },
  { value: 'custom', label: 'Custom Hviezdo' },
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