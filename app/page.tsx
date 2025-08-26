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
  const tokenizingRef = React.useRef(false)

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

  // Tokenize function with timeout and detailed logging
  const tokenizePanel = useCallback(async (
    panelSetter: React.Dispatch<React.SetStateAction<PanelState>>,
    tokenizerType: TokenizerType,
    text: string
  ) => {
    const textPreview = text.substring(0, 50) + (text.length > 50 ? '...' : '')
    console.log(`🚀 Starting tokenization for ${tokenizerType} with text: "${textPreview}"`)
    
    if (!text) {
      console.log(`❌ No text provided for ${tokenizerType}`)
      return
    }
    
    panelSetter(prev => ({ ...prev, loading: true }))
    
    try {
      console.log(`📦 Loading tokenizer module for ${tokenizerType}`)
      
      // Add timeout to prevent hanging
      const tokenizationPromise = (async () => {
        console.log(`🔧 Creating tokenizer instance for ${tokenizerType}`)
        const { createTokenizer } = await import('@/lib/tokenize')
        
        console.log(`✅ Module loaded, creating tokenizer for ${tokenizerType}`)
        const tokenizer = await createTokenizer(tokenizerType)
        
        console.log(`🔀 Starting tokenization for ${tokenizerType}`)
        const result = await tokenizer.tokenize(text)
        
        console.log(`✅ Tokenization completed for ${tokenizerType}:`, {
          totalTokens: result.totalTokens,
          latency: result.latency
        })
        return result
      })()
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          console.error(`⏰ TIMEOUT: Tokenization for ${tokenizerType} exceeded 10 seconds`)
          reject(new Error(`Tokenization timeout for ${tokenizerType}`))
        }, 10000)
      })
      
      console.log(`⏳ Racing tokenization vs timeout for ${tokenizerType}`)
      const result = await Promise.race([tokenizationPromise, timeoutPromise])
      
      console.log(`🎉 Tokenization successful for ${tokenizerType}`)
      panelSetter(prev => ({
        ...prev,
        tokens: result.tokens,
        totalTokens: result.totalTokens,
        latency: result.latency,
        loading: false
      }))
    } catch (error) {
      console.error(`💥 Tokenization error for ${tokenizerType}:`, error)
      console.error(`Stack trace:`, error instanceof Error ? error.stack : 'No stack trace available')
      panelSetter(prev => ({ 
        ...prev, 
        loading: false,
        tokens: [],
        totalTokens: 0,
        latency: 0
      }))
    }
  }, [])

  // Tokenize on text change
  useEffect(() => {
    console.log(`🔄 useEffect triggered:`, {
      debouncedText: debouncedText?.substring(0, 30) + '...',
      tokenizing: tokenizingRef.current,
      panel1: panel1State.tokenizer,
      panel2: panel2State.tokenizer,
      panel3: panel3State.tokenizer
    })
    
    if (debouncedText && !tokenizingRef.current) {
      console.log(`🚦 Starting tokenization for all panels`)
      tokenizingRef.current = true
      
      Promise.all([
        tokenizePanel(setPanel1State, panel1State.tokenizer, debouncedText),
        tokenizePanel(setPanel2State, panel2State.tokenizer, debouncedText),
        tokenizePanel(setPanel3State, panel3State.tokenizer, debouncedText)
      ]).then(() => {
        console.log(`✅ All panels tokenization completed`)
      }).catch((error) => {
        console.error(`❌ Panel tokenization failed:`, error)
      }).finally(() => {
        console.log(`🏁 Releasing tokenization lock`)
        tokenizingRef.current = false
      })
    } else if (!debouncedText) {
      console.log(`⚪ No text to tokenize`)
    } else if (tokenizingRef.current) {
      console.log(`⏸️ Tokenization already in progress, skipping`)
    }
  }, [debouncedText, panel1State.tokenizer, panel2State.tokenizer, panel3State.tokenizer, tokenizePanel])

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