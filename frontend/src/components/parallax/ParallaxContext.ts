import { createContext, useContext } from 'react'

export interface ParallaxContextValue {
  mouseX: number // -1 to 1
  mouseY: number // -1 to 1
  isHovered: boolean
  reducedMotion: boolean
}

export const ParallaxContext = createContext<ParallaxContextValue>({
  mouseX: 0,
  mouseY: 0,
  isHovered: false,
  reducedMotion: false,
})

export function useParallaxContext() {
  return useContext(ParallaxContext)
}

