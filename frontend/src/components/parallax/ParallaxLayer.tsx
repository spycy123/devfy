import { useRef, useEffect, useState, type ReactNode, type CSSProperties, type ElementType } from 'react'
import { useParallaxContext } from './ParallaxContext'

interface ParallaxLayerProps {
  children: ReactNode
  depth?: number // px offset per mouse unit (-1 to 1)
  scrollSpeed?: number // scroll offset speed
  rotate?: number // subtle tilt rotation in degrees
  className?: string
  style?: CSSProperties
  as?: ElementType
}

export function ParallaxLayer({
  children,
  depth = 0,
  scrollSpeed = 0,
  rotate = 0,
  className = '',
  style,
  as: Component = 'div',
}: ParallaxLayerProps) {
  const { mouseX, mouseY, isHovered, reducedMotion } = useParallaxContext()
  const [rawScrollOffset, setRawScrollOffset] = useState(0)
  const elementRef = useRef<HTMLDivElement | null>(null)
  const isScrollDisabled = reducedMotion || scrollSpeed === 0

  useEffect(() => {
    if (isScrollDisabled) return

    let ticking = false
    const updateScrollOffset = () => {
      if (!elementRef.current) return
      const rect = elementRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight || 800
      const elementCenter = rect.top + rect.height / 2
      const viewportCenter = windowHeight / 2
      const diff = elementCenter - viewportCenter
      setRawScrollOffset(diff * scrollSpeed)
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollOffset)
        ticking = true
      }
    }

    updateScrollOffset()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [scrollSpeed, isScrollDisabled])

  if (reducedMotion) {
    return (
      <Component className={`parallax-layer ${className}`} style={style}>
        {children}
      </Component>
    )
  }

  const scrollOffset = isScrollDisabled ? 0 : rawScrollOffset
  const tx = mouseX * depth
  const ty = mouseY * depth + scrollOffset
  const rot = mouseX * rotate

  const layerStyle: CSSProperties = {
    transform: `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg)`,
    transition: isHovered
      ? 'transform 120ms ease-out'
      : 'transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    willChange: 'transform',
    ...style,
  }

  return (
    <Component
      ref={elementRef}
      className={`parallax-layer ${className}`}
      style={layerStyle}
    >
      {children}
    </Component>
  )
}
