export function tokenIndexToHsl(index: number): string {
  const h = (index * 47) % 360
  return `hsl(${h}, 60%, 60%)`
}