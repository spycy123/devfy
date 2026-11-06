import {
  useRef,
  useState,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from 'react'
import { usePrefersReducedMotion } from './useParallax'
import { ParallaxContext, type ParallaxContextValue } from './ParallaxContext'

interface ParallaxContainerProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  disabled?: boolean
  perspective?: number
}

export function ParallaxContainer({
  children,
  className = '',
  style,
  disabled = false,
  perspective = 1200,
}: ParallaxContainerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const [coords, setCoords] = useState({ mouseX: 0, mouseY: 0, isHovered: false })

  const isMotionDisabled = disabled || reducedMotion

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isMotionDisabled || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      // Normalized between -1 and 1
      const normalizedX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const normalizedY = ((event.clientY - rect.top) / rect.height) * 2 - 1

      setCoords({
        mouseX: Math.max(-1, Math.min(1, normalizedX)),
        mouseY: Math.max(-1, Math.min(1, normalizedY)),
        isHovered: true,
      })
    },
    [isMotionDisabled],
  )

  const handleMouseLeave = useCallback(() => {
    if (isMotionDisabled) return
    setCoords({ mouseX: 0, mouseY: 0, isHovered: false })
  }, [isMotionDisabled])

  const contextValue: ParallaxContextValue = {
    mouseX: coords.mouseX,
    mouseY: coords.mouseY,
    isHovered: coords.isHovered,
    reducedMotion: isMotionDisabled,
  }

  const containerStyle: CSSProperties = {
    position: 'relative',
    perspective: `${perspective}px`,
    transformStyle: 'preserve-3d',
    ...style,
  }

  return (
    <ParallaxContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={`parallax-container ${className}`}
        style={containerStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
    </ParallaxContext.Provider>
  )
}

