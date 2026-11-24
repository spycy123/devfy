import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function SmoothScroll() {
  const location = useLocation()
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      return
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.2,
    })

    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(updateTicker)
    gsap.ticker.lagSmoothing(0)

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (href && href.startsWith('#') && href.length > 1) {
        const targetElement = document.querySelector(href)
        if (targetElement) {
          e.preventDefault()
          lenis.scrollTo(targetElement as HTMLElement, {
            offset: -80,
            duration: 1.2,
          })
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)

    return () => {
      document.removeEventListener('click', handleAnchorClick)
      gsap.ticker.remove(updateTicker)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
  }, [location.pathname])

  return null
}
