import { Token } from './types'

export function formatIds(tokens: Token[], separator: string = ' '): string {
  return tokens.map(t => t.id).join(separator)
}

export function formatPieces(tokens: Token[]): string {
  return JSON.stringify(tokens.map(t => t.piece))
}

export function formatJSON(tokens: Token[]): string {
  return JSON.stringify(tokens, null, 2)
}

export function formatCSV(tokens: Token[]): string {
  const header = 'index,piece,id,start,end,bytes'
  const rows = tokens.map(t => 
    `${t.index},"${t.piece.replace(/"/g, '""')}",${t.id},${t.start},${t.end},${t.bytes}`
  )
  return [header, ...rows].join('\n')
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}