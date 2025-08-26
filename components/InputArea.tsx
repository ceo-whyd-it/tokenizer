'use client'

import React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Share2, Type } from 'lucide-react'

interface InputAreaProps {
  value: string
  onChange: (value: string) => void
  showWhitespace: boolean
  onShowWhitespaceChange: (value: boolean) => void
  syncPanels: boolean
  onSyncPanelsChange: (value: boolean) => void
  onShare: () => void
}

const DEFAULT_TEXT = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are a helpful assistant.<|eot_id|><|start_header_id|>user<|end_header_id|>

What is the capital of France?<|eot_id|><|start_header_id|>assistant<|end_header_id|>

The capital of France is Paris.<|eot_id|>`

export function InputArea({
  value,
  onChange,
  showWhitespace,
  onShowWhitespaceChange,
  syncPanels,
  onSyncPanelsChange,
  onShare
}: InputAreaProps) {
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  React.useEffect(() => {
    if (!value) {
      onChange(DEFAULT_TEXT)
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Input Text</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-muted-foreground" />
            <label htmlFor="whitespace" className="text-sm">Show whitespace</label>
            <Switch
              id="whitespace"
              checked={showWhitespace}
              onChange={(e) => onShowWhitespaceChange(e.target.checked)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sync" className="text-sm">Sync panels</label>
            <Switch
              id="sync"
              checked={syncPanels}
              onChange={(e) => onSyncPanelsChange(e.target.checked)}
            />
          </div>
          <Button onClick={onShare} size="sm" variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
      <Textarea
        value={value}
        onChange={handleTextChange}
        className="min-h-[200px] font-mono text-sm"
        placeholder="Enter text to tokenize..."
      />
    </div>
  )
}