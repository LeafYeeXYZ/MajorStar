import { useEffect, useState, useRef } from 'react'

import { GLOBAL_FPS } from '../consts/fps'

type Screen = {
  width: number
  height: number
}

type UseScreenParams = {
  offsetHeight?: number
  offsetWidth?: number
}

export function useScreen({ offsetHeight, offsetWidth }: UseScreenParams = {}): Screen {
  const [screen, setScreen] = useState<Screen>({
    width: window.innerWidth - (offsetWidth ?? 0),
    height: window.innerHeight - (offsetHeight ?? 0),
  })
  const lastUpdateRef = useRef<number>(0)
  useEffect(() => {
    const handleResize = () => {
      const now = Date.now()
      if (now - lastUpdateRef.current < 1000 / GLOBAL_FPS) {
        return
      }
      lastUpdateRef.current = now
      setScreen({
        width: window.innerWidth - (offsetWidth ?? 0),
        height: window.innerHeight - (offsetHeight ?? 0),
      })
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  return screen
}
