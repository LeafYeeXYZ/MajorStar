export function parseOffset(offset: `${number}px` | `${number}rem` | undefined): number
export function parseOffset(offset: `${number}%`, base: number): number
export function parseOffset(
  offset: `${number}px` | `${number}rem` | `${number}%` | undefined,
  base?: number,
): number {
  if (!offset) return 0
  if (offset.endsWith('px')) {
    return parseFloat(offset)
  }
  if (offset.endsWith('rem')) {
    const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
    return parseFloat(offset) * remSize
  }
  if (offset.endsWith('%')) {
    if (base === undefined) {
      throw new Error('Base value is required for percentage offsets')
    }
    return (parseFloat(offset) / 100) * base
  }
  throw new Error(`Invalid offset format: ${offset}`)
}
