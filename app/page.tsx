'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { InputArea } from '@/components/InputArea'
import { Panel } from '@/components/Panel'
import { PanelState, TokenizerType } from '@/lib/types'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { Github } from 'lucide-react'
import Link from 'next/link'

const DEFAULT_TEXT = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are a helpful assistant.<|eot_id|><|start_header_id|>user<|end_header_id|>

What is the capital of France?<|eot_id|><|start_header_id|>assistant<|end_header_id|>

The capital of France is Paris.<|eot_id|>`

export default function Home() {
  const [inputText, setInputText] = useState('')
  const [showWhitespace, setShowWhitespace] = useState(false)
  const [syncPanels, setSyncPanels] = useState(false)
  
  const [panel1State, setPanel1State] = useState<PanelState>({
    tokenizer: 'cl100k_base',
    tokens: [],
    totalTokens: 0,
    latency: 0,
    loading: false
  })
  
  const [panel2State, setPanel2State] = useState<PanelState>({
    tokenizer: 'r50k_base',
    tokens: [],
    totalTokens: 0,
    latency: 0,
    loading: false
  })
  
  const [panel3State, setPanel3State] = useState<PanelState>({
    tokenizer: 'llama3',
    tokens: [],
    totalTokens: 0,
    latency: 0,
    loading: false
  })

  const debouncedText = useDebounce(inputText, 250)

  // Load from localStorage on mount
  useEffect(() => {
    const savedText = localStorage.getItem('tokenizer-input')
    const savedTokenizer1 = localStorage.getItem('tokenizer-panel1')
    const savedTokenizer2 = localStorage.getItem('tokenizer-panel2')
    const savedTokenizer3 = localStorage.getItem('tokenizer-panel3')
    
    // Check URL params first
    const params = new URLSearchParams(window.location.search)
    const urlText = params.get('t')
    const urlP1 = params.get('p1')
    const urlP2 = params.get('p2')
    const urlP3 = params.get('p3')
    const urlWs = params.get('ws')
    
    setInputText(urlText || savedText || DEFAULT_TEXT)
    setShowWhitespace(urlWs === '1')
    
    if (urlP1) setPanel1State(prev => ({ ...prev, tokenizer: urlP1 as TokenizerType }))
    else if (savedTokenizer1) setPanel1State(prev => ({ ...prev, tokenizer: savedTokenizer1 as TokenizerType }))
    
    if (urlP2) setPanel2State(prev => ({ ...prev, tokenizer: urlP2 as TokenizerType }))
    else if (savedTokenizer2) setPanel2State(prev => ({ ...prev, tokenizer: savedTokenizer2 as TokenizerType }))
    
    if (urlP3) setPanel3State(prev => ({ ...prev, tokenizer: urlP3 as TokenizerType }))
    else if (savedTokenizer3) setPanel3State(prev => ({ ...prev, tokenizer: savedTokenizer3 as TokenizerType }))
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (inputText) {
      localStorage.setItem('tokenizer-input', inputText)
    }
  }, [inputText])

  useEffect(() => {
    localStorage.setItem('tokenizer-panel1', panel1State.tokenizer)
  }, [panel1State.tokenizer])

  useEffect(() => {
    localStorage.setItem('tokenizer-panel2', panel2State.tokenizer)
  }, [panel2State.tokenizer])

  useEffect(() => {
    localStorage.setItem('tokenizer-panel3', panel3State.tokenizer)
  }, [panel3State.tokenizer])

  // Tokenize function
  const tokenizePanel = useCallback(async (
    panelSetter: React.Dispatch<React.SetStateAction<PanelState>>,
    tokenizerType: TokenizerType,
    text: string
  ) => {
    if (!text) return
    
    panelSetter(prev => ({ ...prev, loading: true }))
    
    try {
      const startTime = performance.now()
      
      // Use main thread tokenization to avoid Web Worker issues
      const { createTokenizer } = await import('@/lib/tokenize')
      const tokenizer = await createTokenizer(tokenizerType)
      const result = await tokenizer.tokenize(text)
      
      panelSetter(prev => ({
        ...prev,
        tokens: result.tokens,
        totalTokens: result.totalTokens,
        latency: result.latency,
        loading: false
      }))
    } catch (error) {
      console.error('Tokenization error:', error)
      panelSetter(prev => ({ ...prev, loading: false }))
    }
  }, [])

  // Tokenize on text change
  useEffect(() => {
    if (debouncedText) {
      tokenizePanel(setPanel1State, panel1State.tokenizer, debouncedText)
      tokenizePanel(setPanel2State, panel2State.tokenizer, debouncedText)
      tokenizePanel(setPanel3State, panel3State.tokenizer, debouncedText)
    }
  }, [debouncedText, panel1State.tokenizer, panel2State.tokenizer, panel3State.tokenizer])

  const handleTokenizerChange = (panelIndex: 1 | 2 | 3, newTokenizer: TokenizerType) => {
    if (syncPanels) {
      setPanel1State(prev => ({ ...prev, tokenizer: newTokenizer }))
      setPanel2State(prev => ({ ...prev, tokenizer: newTokenizer }))
      setPanel3State(prev => ({ ...prev, tokenizer: newTokenizer }))
    } else {
      if (panelIndex === 1) setPanel1State(prev => ({ ...prev, tokenizer: newTokenizer }))
      if (panelIndex === 2) setPanel2State(prev => ({ ...prev, tokenizer: newTokenizer }))
      if (panelIndex === 3) setPanel3State(prev => ({ ...prev, tokenizer: newTokenizer }))
    }
  }

  const handleShare = () => {
    const params = new URLSearchParams({
      t: inputText,
      p1: panel1State.tokenizer,
      p2: panel2State.tokenizer,
      p3: panel3State.tokenizer,
      ws: showWhitespace ? '1' : '0'
    })
    const url = `${window.location.origin}?${params.toString()}`
    navigator.clipboard.writeText(url)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Tokenizer Comparator</h1>
            <p className="text-sm text-muted-foreground">
              Compare how different tokenizers split text
            </p>
          </div>
          <Link
            href="https://github.com/ceo-whyd-it/tokenizer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <InputArea
          value={inputText}
          onChange={setInputText}
          showWhitespace={showWhitespace}
          onShowWhitespaceChange={setShowWhitespace}
          syncPanels={syncPanels}
          onSyncPanelsChange={setSyncPanels}
          onShare={handleShare}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Panel
            state={panel1State}
            showWhitespace={showWhitespace}
            onTokenizerChange={(t) => handleTokenizerChange(1, t)}
          />
          <Panel
            state={panel2State}
            showWhitespace={showWhitespace}
            onTokenizerChange={(t) => handleTokenizerChange(2, t)}
          />
          <Panel
            state={panel3State}
            showWhitespace={showWhitespace}
            onTokenizerChange={(t) => handleTokenizerChange(3, t)}
          />
        </div>
      </main>
    </div>
  )
}