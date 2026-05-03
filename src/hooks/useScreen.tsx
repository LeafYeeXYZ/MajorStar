import { useEffect, useState } from 'react'

type Screen = {
  width: number
  height: number
}

type UseScreenParams = {
  offsetHeight?: `${number}px` | `${number}rem` | `${number}%`
  offsetWidth?: `${number}px` | `${number}rem` | `${number}%`
}

function parseOffset(
  offset: `${number}px` | `${number}rem` | `${number}%` | undefined,
  base: number,
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
    return (parseFloat(offset) / 100) * base
  }
  throw new Error(`Invalid offset format: ${offset}`)
}

export function useScreen({ offsetHeight, offsetWidth }: UseScreenParams = {}): Screen {
  const [screen, setScreen] = useState<Screen>({
    width: window.innerWidth - parseOffset(offsetWidth, window.innerWidth),
    height: window.innerHeight - parseOffset(offsetHeight, window.innerHeight),
  })
  useEffect(() => {
    const handleResize = () => {
      setScreen({
        width: window.innerWidth - parseOffset(offsetWidth, window.innerWidth),
        height: window.innerHeight - parseOffset(offsetHeight, window.innerHeight),
      })
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  return screen
}
