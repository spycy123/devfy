import {
  useState,
  useCallback,
  type ReactNode,
  type CSSProperties,
  type MouseEvent,
  type FormEvent,
} from 'react'
import { motion, useReducedMotion } from 'motion/react'

export interface MotionCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  as?: 'div' | 'article' | 'section' | 'li'
  id?: string
  delay?: number
  duration?: number
  hover?: boolean
  hoverLift?: number
  hoverScale?: number
  glare?: boolean
  glareMaxOpacity?: number
  onClick?: () => void
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void | Promise<void>
  initialY?: number
  initialScale?: number
  viewportAmount?: number
}

export function MotionCard({
  children,
  className = '',
  style,
  as = 'div',
  id,
  delay = 0,
  duration = 0.55,
  hover = true,
  hoverLift = 6,
  hoverScale = 1.015,
  glare = true,
  glareMaxOpacity = 0.16,
  onClick,
  onSubmit,
  initialY = 32,
  initialScale = 0.96,
  viewportAmount = 0.12,
}: MotionCardProps) {
  const shouldReduceMotion = useReducedMotion()
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 })

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (!glare || shouldReduceMotion) return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setGlarePos({ x, y, opacity: glareMaxOpacity })
    },
    [glare, shouldReduceMotion, glareMaxOpacity],
  )

  const handleMouseLeave = useCallback(() => {
    if (!glare || shouldReduceMotion) return
    setGlarePos((prev) => ({ ...prev, opacity: 0 }))
  }, [glare, shouldReduceMotion])

  const MotionComponent = motion[as]

  return (
    <MotionComponent
      id={id}
      className={`motion-card ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        willChange: 'transform, opacity',
        ...style,
      }}
      initial={
        shouldReduceMotion
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: initialY, scale: initialScale }
      }
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: viewportAmount }}
      transition={
        shouldReduceMotion
          ? { duration: 0.01 }
          : {
              duration,
              delay,
              ease: [0.22, 1, 0.36, 1],
            }
      }
      whileHover={
        hover && !shouldReduceMotion
          ? {
              y: -hoverLift,
              scale: hoverScale,
              transition: {
                type: 'spring',
                stiffness: 380,
                damping: 24,
              },
            }
          : undefined
      }
      whileTap={
        hover && !shouldReduceMotion
          ? {
              scale: 0.985,
              transition: { duration: 0.1 },
            }
          : undefined
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      onSubmit={onSubmit as React.FormEventHandler<HTMLElement> | undefined}
    >
      {children}
      {glare && (
        <span
          className="motion-card-glare"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 10,
            opacity: glarePos.opacity,
            background: `radial-gradient(circle at ${glarePos.x.toFixed(1)}% ${glarePos.y.toFixed(1)}%, rgba(255, 107, 107, 0.22) 0%, rgba(255, 255, 255, 0.12) 35%, transparent 70%)`,
            transition: 'opacity 250ms ease',
          }}
        />
      )}
    </MotionComponent>
  )
}
