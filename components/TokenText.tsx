'use client'

import React from 'react'
import { Token } from '@/lib/types'
import { tokenIndexToHsl } from '@/lib/color'

interface TokenTextProps {
  tokens: Token[]
  showWhitespace: boolean
  hoveredToken: number | null
  onTokenHover: (index: number | null) => void
}

export function TokenText({ tokens, showWhitespace, hoveredToken, onTokenHover }: TokenTextProps) {
  const renderToken = (token: Token) => {
    let displayPiece = token.piece

    if (showWhitespace) {
      displayPiece = displayPiece
        .replace(/ /g, '·')
        .replace(/\n/g, '↵\n')
        .replace(/\t/g, '→')
    }

    return (
      <span
        key={token.index}
        className={`inline-block px-0.5 rounded cursor-pointer transition-all ${
          hoveredToken === token.index ? 'ring-2 ring-primary z-10 relative' : ''
        }`}
        style={{
          backgroundColor: tokenIndexToHsl(token.index),
          color: 'white',
          opacity: hoveredToken !== null && hoveredToken !== token.index ? 0.5 : 1
        }}
        onMouseEnter={() => onTokenHover(token.index)}
        onMouseLeave={() => onTokenHover(null)}
        title={`#${token.index} | ID: ${token.id} | "${token.piece}" | Bytes: ${token.bytes} | [${token.start}:${token.end}]`}
      >
        {displayPiece}
      </span>
    )
  }

  return (
    <div className={`font-mono text-sm ${showWhitespace ? 'whitespace-pre-wrap' : ''}`}>
      {tokens.map(renderToken)}
    </div>
  )
}