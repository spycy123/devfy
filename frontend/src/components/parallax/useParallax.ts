import { useEffect, useRef, useState, useCallback, type CSSProperties } from 'react'

export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      mediaQuery.addListener(handler)
      return () => mediaQuery.removeListener(handler)
    }
  }, [])

  return prefersReducedMotion
}

export function useScrollY(): number {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY || window.pageYOffset || 0)
          ticking = false
        })
        ticking = true
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrollY
}

export interface ScrollParallaxOptions {
  speed?: number // e.g. 0.2 (moves slower than scroll) or -0.15 (moves faster)
  clamp?: boolean
  min?: number
  max?: number
  disabled?: boolean
}

export function useScrollParallax<T extends HTMLElement = HTMLDivElement>(
  options: ScrollParallaxOptions = {},
) {
  const { speed = 0.15, clamp = true, min = -80, max = 80, disabled = false } = options
  const ref = useRef<T | null>(null)
  const [rawOffset, setRawOffset] = useState(0)
  const prefersReduced = usePrefersReducedMotion()
  const isParallaxDisabled = disabled || prefersReduced

  useEffect(() => {
    if (isParallaxDisabled) return

    let ticking = false

    const updateOffset = () => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const windowHeight = window.innerHeight || 800
      const elementCenter = rect.top + rect.height / 2
      const viewportCenter = windowHeight / 2
      const diff = elementCenter - viewportCenter

      let calculated = diff * speed

      if (clamp) {
        calculated = Math.max(min, Math.min(max, calculated))
      }

      setRawOffset(calculated)
      ticking = false
    }

    const onScrollOrResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateOffset)
        ticking = true
      }
    }

    updateOffset()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [speed, clamp, min, max, isParallaxDisabled])

  const offset = isParallaxDisabled ? 0 : rawOffset
  const style: CSSProperties = isParallaxDisabled
    ? {}
    : {
        transform: `translate3d(0, ${offset.toFixed(2)}px, 0)`,
        willChange: 'transform',
      }

  return { ref, offset, style }
}

export interface MouseTiltOptions {
  maxTilt?: number // degrees, e.g. 8
  perspective?: number // px, e.g. 1000
  scale?: number // e.g. 1.02
  glare?: boolean
  disabled?: boolean
}

export function useMouseTilt<T extends HTMLElement = HTMLDivElement>(
  options: MouseTiltOptions = {},
) {
  const {
    maxTilt = 8,
    perspective = 1000,
    scale = 1.015,
    glare = true,
    disabled = false,
  } = options

  const ref = useRef<T | null>(null)
  const prefersReduced = usePrefersReducedMotion()
  const [tiltStyle, setTiltStyle] = useState<CSSProperties>({})
  const [glareStyle, setGlareStyle] = useState<CSSProperties>({ opacity: 0 })

  const isMotionDisabled = disabled || prefersReduced

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<T>) => {
      if (isMotionDisabled || !ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width // 0 to 1
      const y = (event.clientY - rect.top) / rect.height // 0 to 1

      const tiltX = (0.5 - y) * (maxTilt * 2)
      const tiltY = (x - 0.5) * (maxTilt * 2)

      setTiltStyle({
        transform: `perspective(${perspective}px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`,
        transition: 'transform 100ms ease-out',
        willChange: 'transform',
      })

      if (glare) {
        const glareX = (x * 100).toFixed(1)
        const glareY = (y * 100).toFixed(1)
        setGlareStyle({
          opacity: 0.18,
          background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 65%)`,
          transition: 'opacity 200ms ease',
        })
      }
    },
    [isMotionDisabled, maxTilt, perspective, scale, glare],
  )

  const handleMouseLeave = useCallback(() => {
    if (isMotionDisabled) return

    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 500ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    })

    if (glare) {
      setGlareStyle({
        opacity: 0,
        transition: 'opacity 400ms ease-out',
      })
    }
  }, [isMotionDisabled, perspective, glare])

  return {
    ref,
    tiltStyle,
    glareStyle,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  }
}

