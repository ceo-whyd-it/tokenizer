'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, FileText } from 'lucide-react'
import { CustomTokenizerData } from '@/lib/types'

interface CustomTokenizerUploadProps {
  onTokenizerLoad: (data: CustomTokenizerData) => void
  currentTokenizer?: CustomTokenizerData
  onClear?: () => void
}

export function CustomTokenizerUpload({ 
  onTokenizerLoad, 
  currentTokenizer, 
  onClear 
}: CustomTokenizerUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.model') && !file.name.endsWith('.spm')) {
      alert('Please select a SentencePiece model file (.model or .spm)')
      return
    }

    setUploading(true)
    try {
      const tokenizerData: CustomTokenizerData = {
        modelFile: file,
        name: file.name.replace(/\.(model|spm)$/, '')
      }
      
      onTokenizerLoad(tokenizerData)
    } catch (error) {
      console.error('Failed to load tokenizer:', error)
      alert('Failed to load tokenizer file')
    } finally {
      setUploading(false)
    }
  }

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  if (currentTokenizer) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
        <FileText className="w-4 h-4 text-green-600" />
        <span className="text-sm text-green-700 flex-1">
          {currentTokenizer.name}
        </span>
        {onClear && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClear}
            className="h-6 w-6 p-0 text-green-600 hover:text-red-600"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragOver 
          ? 'border-primary bg-primary/5' 
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-medium mb-2">Upload Custom Tokenizer</h3>
      <p className="text-sm text-gray-600 mb-4">
        Drop your SentencePiece model file (.model or .spm) here, or click to browse
      </p>
      
      <input
        type="file"
        accept=".model,.spm"
        onChange={handleFileInput}
        className="hidden"
        id="tokenizer-upload"
        disabled={uploading}
      />
      
      <Button
        asChild
        variant="outline"
        disabled={uploading}
        className="cursor-pointer"
      >
        <label htmlFor="tokenizer-upload">
          {uploading ? 'Loading...' : 'Choose File'}
        </label>
      </Button>
      
      <p className="text-xs text-gray-500 mt-2">
        Supported formats: .model, .spm
      </p>
    </div>
  )
}