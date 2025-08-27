'use client'

import React, { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Download, 
  Upload, 
  FileJson,
  Trash2,
  Plus,
  Save
} from 'lucide-react'
import { 
  Preset, 
  getStoredPresets, 
  savePresets, 
  exportPresets, 
  importPresets, 
  mergePresets,
  validatePresetName,
  isValidPreset
} from '@/lib/presets'
import { TokenizerType } from '@/lib/types'

interface PresetsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPresetSelect: (preset: Preset) => void
  currentState?: {
    inputText: string
    tokenizer1: TokenizerType
    tokenizer2: TokenizerType
    tokenizer3: TokenizerType
  }
}

export function PresetsDialog({ 
  open, 
  onOpenChange, 
  onPresetSelect,
  currentState 
}: PresetsDialogProps) {
  const [presets, setPresets] = useState<Preset[]>([])
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)

  // Load presets on mount
  useEffect(() => {
    if (open) {
      const loadPresets = async () => {
        try {
          const loadedPresets = await getStoredPresets()
          setPresets(loadedPresets)
        } catch (error) {
          console.error('Failed to load presets:', error)
          setPresets([])
        }
      }
      
      loadPresets()
    }
  }, [open])

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedPreset(null)
      setIsCreating(false)
      setNewPresetName('')
      setNameError(null)
    }
  }, [open])

  const handlePresetClick = (preset: Preset) => {
    setSelectedPreset(preset.name)
  }

  const handlePresetDoubleClick = (preset: Preset) => {
    onPresetSelect(preset)
    onOpenChange(false)
  }

  const handleSelectPreset = () => {
    const preset = presets.find(p => p.name === selectedPreset)
    if (preset) {
      onPresetSelect(preset)
      onOpenChange(false)
    }
  }

  const handleDeletePreset = () => {
    if (selectedPreset) {
      const updatedPresets = presets.filter(p => p.name !== selectedPreset)
      setPresets(updatedPresets)
      savePresets(updatedPresets)
      setSelectedPreset(null)
    }
  }

  const handleCreatePreset = () => {
    if (!currentState) return
    
    const trimmedName = newPresetName.trim()
    const error = validatePresetName(trimmedName, presets)
    
    if (error) {
      setNameError(error)
      return
    }

    const newPreset: Preset = {
      name: trimmedName,
      input_text: currentState.inputText,
      Tokenizer_1: currentState.tokenizer1,
      Tokenizer_2: currentState.tokenizer2,
      Tokenizer_3: currentState.tokenizer3
    }

    const updatedPresets = [...presets, newPreset]
    setPresets(updatedPresets)
    savePresets(updatedPresets)
    
    setIsCreating(false)
    setNewPresetName('')
    setNameError(null)
    setSelectedPreset(newPreset.name)
  }

  const handleExport = () => {
    try {
      const jsonString = exportPresets(presets)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = 'tokenizer-presets.json'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const importedPresets = importPresets(text)
        
        // Ask user if they want to add or replace
        const shouldReplace = confirm(
          `Import ${importedPresets.length} preset(s)?\n\n` +
          'OK = Merge with existing presets (replace duplicates)\n' +
          'Cancel = Keep existing presets'
        )
        
        if (shouldReplace) {
          const updatedPresets = mergePresets(presets, importedPresets)
          setPresets(updatedPresets)
          savePresets(updatedPresets)
        }
      } catch (error) {
        alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    input.click()
  }

  const handleNameChange = (value: string) => {
    setNewPresetName(value)
    if (nameError) {
      setNameError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Presets</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col space-y-4 min-h-0">
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCreating(true)}
              disabled={!currentState || isCreating}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create from Current
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSelectPreset}
              disabled={!selectedPreset}
            >
              <Save className="w-4 h-4 mr-2" />
              Apply Selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDeletePreset}
              disabled={!selectedPreset}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" onClick={handleImport}>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button size="sm" variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Create new preset form */}
          {isCreating && (
            <div className="border rounded-lg p-4 space-y-3">
              <div>
                <Label htmlFor="preset-name">Preset Name</Label>
                <Input
                  id="preset-name"
                  value={newPresetName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter preset name..."
                  className={nameError ? 'border-red-500' : ''}
                />
                {nameError && (
                  <p className="text-sm text-red-500 mt-1">{nameError}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreatePreset}>
                  Save Preset
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false)
                    setNewPresetName('')
                    setNameError(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Presets table */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-[400px] border rounded-md">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead className="w-[120px]">Tokenizer 1</TableHead>
                    <TableHead className="w-[120px]">Tokenizer 2</TableHead>
                    <TableHead className="w-[120px]">Tokenizer 3</TableHead>
                    <TableHead>Preview Text</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {presets.map((preset) => (
                    <TableRow
                      key={preset.name}
                      className={`cursor-pointer ${
                        selectedPreset === preset.name ? 'bg-muted' : ''
                      }`}
                      onClick={() => handlePresetClick(preset)}
                      onDoubleClick={() => handlePresetDoubleClick(preset)}
                    >
                      <TableCell className="font-medium">{preset.name}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {preset.Tokenizer_1.length > 15 
                          ? preset.Tokenizer_1.substring(0, 15) + '...' 
                          : preset.Tokenizer_1
                        }
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {preset.Tokenizer_2.length > 15 
                          ? preset.Tokenizer_2.substring(0, 15) + '...' 
                          : preset.Tokenizer_2
                        }
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {preset.Tokenizer_3.length > 15 
                          ? preset.Tokenizer_3.substring(0, 15) + '...' 
                          : preset.Tokenizer_3
                        }
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-xs text-muted-foreground">
                        {preset.input_text}
                      </TableCell>
                    </TableRow>
                  ))}
                  {presets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No presets available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {/* Usage hint */}
          <p className="text-xs text-muted-foreground">
            Tip: Double-click a preset to apply it immediately, or click once to select and use the Apply button.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}