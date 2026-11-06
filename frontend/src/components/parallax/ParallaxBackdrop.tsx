import { useEffect, useState, useMemo } from 'react'
import { usePrefersReducedMotion, useScrollY } from './useParallax'

export type ParallaxBackdropVariant =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'portfolio'
  | 'project'

interface ParallaxBackdropProps {
  variant?: ParallaxBackdropVariant
  className?: string
}

interface FloatingGlyph {
  id: string
  text: string
  top: string
  left?: string
  right?: string
  speed: number // scroll multiplier
  depth: number // mouse multiplier
  size: number
  opacity: number
  rotate?: number
}

export function ParallaxBackdrop({
  variant = 'landing',
  className = '',
}: ParallaxBackdropProps) {
  const scrollY = useScrollY()
  const reducedMotion = usePrefersReducedMotion()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (reducedMotion) return

    let ticking = false
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const w = window.innerWidth || 1000
          const h = window.innerHeight || 800
          setMousePos({
            x: (e.clientX / w) * 2 - 1, // -1 to 1
            y: (e.clientY / h) * 2 - 1,
          })
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [reducedMotion])

  const glyphs: FloatingGlyph[] = useMemo(() => {
    switch (variant) {
      case 'landing':
        return [
          {
            id: 'g1',
            text: '<devfy.io />',
            top: '10%',
            left: '6%',
            speed: -0.16,
            depth: 22,
            size: 13,
            opacity: 0.75,
            rotate: -6,
          },
          {
            id: 'g2',
            text: '{ status: 200, role: "developer" }',
            top: '26%',
            right: '8%',
            speed: 0.15,
            depth: -20,
            size: 12,
            opacity: 0.7,
            rotate: 8,
          },
          {
            id: 'g3',
            text: 'git push origin main',
            top: '46%',
            left: '4%',
            speed: -0.14,
            depth: 18,
            size: 12,
            opacity: 0.65,
            rotate: 4,
          },
          {
            id: 'g4',
            text: 'const dev = new Portfolio()',
            top: '64%',
            right: '5%',
            speed: 0.2,
            depth: -24,
            size: 12,
            opacity: 0.7,
            rotate: -5,
          },
          {
            id: 'g5',
            text: '✦ build & showcase projects',
            top: '82%',
            left: '8%',
            speed: -0.12,
            depth: 16,
            size: 13,
            opacity: 0.75,
            rotate: 2,
          },
        ]
      case 'auth':
        return [
          {
            id: 'a1',
            text: '{ auth: "session_valid" }',
            top: '15%',
            left: '10%',
            speed: -0.12,
            depth: 18,
            size: 12,
            opacity: 0.75,
            rotate: -7,
          },
          {
            id: 'a2',
            text: '<developer.account />',
            top: '22%',
            right: '12%',
            speed: 0.14,
            depth: -20,
            size: 13,
            opacity: 0.7,
            rotate: 6,
          },
          {
            id: 'a3',
            text: 'devfy.session.init()',
            top: '72%',
            left: '12%',
            speed: -0.1,
            depth: 16,
            size: 12,
            opacity: 0.65,
            rotate: 4,
          },
          {
            id: 'a4',
            text: '★ instant portfolio sync',
            top: '78%',
            right: '10%',
            speed: 0.16,
            depth: -18,
            size: 12,
            opacity: 0.7,
            rotate: -4,
          },
        ]
      case 'portfolio':
        return [
          {
            id: 'p1',
            text: '<Portfolio.Showcase />',
            top: '12%',
            left: '8%',
            speed: -0.16,
            depth: 22,
            size: 13,
            opacity: 0.75,
            rotate: -4,
          },
          {
            id: 'p2',
            text: 'verified developer ✓',
            top: '24%',
            right: '10%',
            speed: 0.16,
            depth: -22,
            size: 12,
            opacity: 0.7,
            rotate: 5,
          },
          {
            id: 'p3',
            text: '{ status: "open_to_work" }',
            top: '56%',
            left: '6%',
            speed: -0.12,
            depth: 18,
            size: 12,
            opacity: 0.65,
            rotate: -6,
          },
          {
            id: 'p4',
            text: '🚀 deployed on devfy',
            top: '80%',
            right: '8%',
            speed: 0.2,
            depth: -24,
            size: 12,
            opacity: 0.75,
            rotate: 3,
          },
        ]
      case 'project':
        return [
          {
            id: 'pr1',
            text: '<ProjectDetails.Preview />',
            top: '16%',
            right: '10%',
            speed: -0.14,
            depth: 20,
            size: 12,
            opacity: 0.75,
            rotate: 6,
          },
          {
            id: 'pr2',
            text: '{ live_demo: "online" }',
            top: '58%',
            left: '8%',
            speed: 0.16,
            depth: -18,
            size: 12,
            opacity: 0.7,
            rotate: -5,
          },
        ]
      case 'dashboard':
        return [
          {
            id: 'd1',
            text: '<workspace.devfy />',
            top: '90px',
            right: '8%',
            speed: -0.16,
            depth: 22,
            size: 12,
            opacity: 0.75,
            rotate: 4,
          },
          {
            id: 'd2',
            text: '{ status: "developer_active" }',
            top: '280px',
            right: '12%',
            speed: 0.15,
            depth: -20,
            size: 11,
            opacity: 0.7,
            rotate: -5,
          },
          {
            id: 'd3',
            text: 'git status --clean',
            top: '480px',
            left: '270px',
            speed: -0.14,
            depth: 20,
            size: 12,
            opacity: 0.65,
            rotate: 3,
          },
          {
            id: 'd4',
            text: '✦ portfolio sync ready',
            top: '720px',
            right: '8%',
            speed: 0.18,
            depth: -24,
            size: 12,
            opacity: 0.75,
            rotate: -4,
          },
          {
            id: 'd5',
            text: 'npm run deploy',
            top: '960px',
            left: '290px',
            speed: -0.12,
            depth: 18,
            size: 11,
            opacity: 0.65,
            rotate: 2,
          },
          {
            id: 'd6',
            text: '⚡ live database online',
            top: '1200px',
            right: '12%',
            speed: 0.16,
            depth: -20,
            size: 12,
            opacity: 0.7,
            rotate: 5,
          },
        ]
      default:
        return []
    }
  }, [variant])

  if (reducedMotion) {
    return null
  }

  // Calculate parallax offsets for ambient orbs
  const orb1Y = (scrollY * 0.12 + mousePos.y * 25).toFixed(1)
  const orb1X = (mousePos.x * 20).toFixed(1)

  const orb2Y = (scrollY * -0.15 + mousePos.y * -30).toFixed(1)
  const orb2X = (mousePos.x * -25).toFixed(1)

  const orb3Y = (scrollY * 0.08 + mousePos.y * 15).toFixed(1)
  const orb3X = (mousePos.x * 15).toFixed(1)

  return (
    <div
      className={`parallax-backdrop parallax-backdrop-${variant} ${className}`}
      aria-hidden="true"
    >
      {/* Dynamic Parallax Glow Orb 1 (Lime / Emerald) */}
      <div
        className="parallax-orb parallax-orb-primary"
        style={{
          transform: `translate3d(${orb1X}px, ${orb1Y}px, 0)`,
          willChange: 'transform',
        }}
      />

      {/* Dynamic Parallax Glow Orb 2 (Cyan / Soft Accent) */}
      <div
        className="parallax-orb parallax-orb-accent"
        style={{
          transform: `translate3d(${orb2X}px, ${orb2Y}px, 0)`,
          willChange: 'transform',
        }}
      />

      {/* Dynamic Parallax Glow Orb 3 (Warm Soft Amber) */}
      <div
        className="parallax-orb parallax-orb-secondary"
        style={{
          transform: `translate3d(${orb3X}px, ${orb3Y}px, 0)`,
          willChange: 'transform',
        }}
      />

      {/* Floating Developer Glyphs */}
      {glyphs.map((glyph) => {
        const yOffset = (scrollY * glyph.speed + mousePos.y * glyph.depth).toFixed(1)
        const xOffset = (mousePos.x * glyph.depth).toFixed(1)
        const rot = glyph.rotate || 0

        return (
          <div
            key={glyph.id}
            className="parallax-glyph"
            style={{
              top: glyph.top,
              left: glyph.left,
              right: glyph.right,
              fontSize: `${glyph.size}px`,
              opacity: glyph.opacity,
              transform: `translate3d(${xOffset}px, ${yOffset}px, 0) rotate(${rot}deg)`,
              willChange: 'transform',
            }}
          >
            <span>{glyph.text}</span>
          </div>
        )
      })}
    </div>
  )
}

