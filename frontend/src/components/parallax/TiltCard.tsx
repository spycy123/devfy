import { useRef, useState, useCallback, useEffect, type ReactNode, type CSSProperties, type ElementType } from 'react'
import { usePrefersReducedMotion } from './useParallax'

interface TiltCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  maxTilt?: number // max tilt degrees (e.g. 6)
  perspective?: number
  scale?: number
  glare?: boolean
  scrollSpeed?: number // optional scroll parallax offset
  disabled?: boolean
  as?: ElementType
  id?: string
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>
  onClick?: () => void
}

export function TiltCard({
  children,
  className = '',
  style,
  maxTilt = 6,
  perspective = 1000,
  scale = 1.012,
  glare = true,
  scrollSpeed = 0,
  disabled = false,
  as: Component = 'div',
  id,
  onSubmit,
  onClick,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const isMotionDisabled = disabled || reducedMotion

  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, isHovered: false })
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 })
  const [rawScrollOffset, setRawScrollOffset] = useState(0)
  const isScrollDisabled = isMotionDisabled || scrollSpeed === 0

  useEffect(() => {
    if (isScrollDisabled) return

    let ticking = false
    const updateScrollOffset = () => {
      if (!cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
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

  const scrollOffset = isScrollDisabled ? 0 : rawScrollOffset

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isMotionDisabled || !cardRef.current) return

      const rect = cardRef.current.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width // 0 to 1
      const y = (event.clientY - rect.top) / rect.height // 0 to 1

      // Invert Y for standard natural 3D tilt
      const rotateX = (0.5 - y) * (maxTilt * 2)
      const rotateY = (x - 0.5) * (maxTilt * 2)

      setTilt({ rotateX, rotateY, isHovered: true })

      if (glare) {
        setGlarePos({
          x: x * 100,
          y: y * 100,
          opacity: 0.15,
        })
      }
    },
    [isMotionDisabled, maxTilt, glare],
  )

  const handleMouseLeave = useCallback(() => {
    if (isMotionDisabled) return
    setTilt({ rotateX: 0, rotateY: 0, isHovered: false })
    if (glare) {
      setGlarePos((prev) => ({ ...prev, opacity: 0 }))
    }
  }, [isMotionDisabled, glare])

  if (isMotionDisabled) {
    return (
      <Component
        ref={cardRef}
        id={id}
        className={`tilt-card ${className}`}
        style={style}
        onSubmit={onSubmit}
        onClick={onClick}
      >
        {children}
      </Component>
    )
  }

  const transformStyle = tilt.isHovered
    ? `perspective(${perspective}px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale}) translate3d(0, ${scrollOffset.toFixed(2)}px, 0)`
    : `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translate3d(0, ${scrollOffset.toFixed(2)}px, 0)`

  const combinedStyle: CSSProperties = {
    position: 'relative',
    transform: transformStyle,
    transition: tilt.isHovered
      ? 'transform 100ms ease-out'
      : 'transform 500ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    transformStyle: 'preserve-3d',
    willChange: 'transform',
    ...style,
  }

  return (
    <Component
      ref={cardRef}
      id={id}
      className={`tilt-card ${className}`}
      style={combinedStyle}
      onSubmit={onSubmit}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
      {glare && (
        <span
          className="tilt-card-glare"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 10,
            opacity: glarePos.opacity,
            background: `radial-gradient(circle at ${glarePos.x.toFixed(1)}% ${glarePos.y.toFixed(1)}%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 65%)`,
            transition: 'opacity 250ms ease',
          }}
        />
      )}
    </Component>
  )
}
