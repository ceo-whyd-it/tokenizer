'use client'

import React from 'react'
import { Token } from '@/lib/types'
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
import { Copy, FileJson, FileText, Hash } from 'lucide-react'
import { formatCSV, formatIds, formatJSON, formatPieces, copyToClipboard } from '@/lib/format'

interface TokenTableProps {
  tokens: Token[]
  hoveredToken: number | null
  onTokenHover: (index: number | null) => void
}

export function TokenTable({ tokens, hoveredToken, onTokenHover }: TokenTableProps) {
  const handleCopy = async (format: 'ids' | 'pieces' | 'json' | 'csv') => {
    let text = ''
    switch (format) {
      case 'ids':
        text = formatIds(tokens)
        break
      case 'pieces':
        text = formatPieces(tokens)
        break
      case 'json':
        text = formatJSON(tokens)
        break
      case 'csv':
        text = formatCSV(tokens)
        break
    }
    await copyToClipboard(text)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => handleCopy('ids')}>
          <Hash className="w-4 h-4 mr-2" />
          Copy IDs
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleCopy('pieces')}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Pieces
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleCopy('json')}>
          <FileJson className="w-4 h-4 mr-2" />
          Copy JSON
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleCopy('csv')}>
          <FileText className="w-4 h-4 mr-2" />
          Copy CSV
        </Button>
      </div>
      
      <ScrollArea className="h-[400px] border rounded-md">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Piece</TableHead>
              <TableHead className="w-24">ID</TableHead>
              <TableHead className="w-20">Start</TableHead>
              <TableHead className="w-20">End</TableHead>
              <TableHead className="w-20">Bytes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => (
              <TableRow
                key={token.index}
                className={hoveredToken === token.index ? 'bg-muted' : ''}
                onMouseEnter={() => onTokenHover(token.index)}
                onMouseLeave={() => onTokenHover(null)}
              >
                <TableCell className="font-mono text-xs">{token.index}</TableCell>
                <TableCell className="font-mono text-xs max-w-[200px] truncate" title={token.piece}>
                  {token.piece}
                </TableCell>
                <TableCell className="font-mono text-xs">{token.id}</TableCell>
                <TableCell className="font-mono text-xs">{token.start}</TableCell>
                <TableCell className="font-mono text-xs">{token.end}</TableCell>
                <TableCell className="font-mono text-xs">{token.bytes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}