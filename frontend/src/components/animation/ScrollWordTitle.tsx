import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export interface ScrollWordTitleProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'p' | 'span'
  children: ReactNode
  className?: string
  id?: string
  style?: CSSProperties
  delay?: number
  stagger?: number
  duration?: number
  threshold?: string
}

function processNode(node: ReactNode, keyPrefix: string): ReactNode {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return null
  }

  if (typeof node === 'string' || typeof node === 'number') {
    const text = String(node)
    const tokens = text.split(/(\s+)/)
    return tokens.map((token, index) => {
      if (!token) return null
      if (/^\s+$/.test(token)) {
        return token
      }
      return (
        <span
          key={`${keyPrefix}-${index}`}
          className="scroll-word-wrap"
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            verticalAlign: 'top',
            paddingBottom: '0.12em',
            marginBottom: '-0.12em',
          }}
        >
          <span
            className="scroll-word"
            style={{
              display: 'inline-block',
              transformOrigin: '0% 100%',
              willChange: 'transform, opacity, filter',
            }}
          >
            {token}
          </span>
        </span>
      )
    })
  }

  if (isValidElement(node)) {
    const element = node as ReactElement<{ children?: ReactNode }>
    if (element.type === 'br') {
      return <br key={keyPrefix} />
    }

    if (element.props && element.props.children !== undefined) {
      const processedChildren = Children.map(element.props.children, (child, idx) =>
        processNode(child, `${keyPrefix}-${idx}`),
      )
      return cloneElement(element, { key: element.key ?? keyPrefix }, processedChildren)
    }

    return element
  }

  if (Array.isArray(node)) {
    return node.map((child, idx) => processNode(child, `${keyPrefix}-${idx}`))
  }

  return node
}

export function ScrollWordTitle({
  as: Component = 'h2',
  children,
  className = '',
  id,
  style,
  delay = 0,
  stagger = 0.045,
  duration = 0.65,
  threshold = 'top 88%',
}: ScrollWordTitleProps) {
  const containerRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) return

    const words = el.querySelectorAll<HTMLElement>('.scroll-word')
    if (!words.length) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        {
          y: '115%',
          opacity: 0,
          rotateX: -35,
          filter: 'blur(5px)',
        },
        {
          y: '0%',
          opacity: 1,
          rotateX: 0,
          filter: 'blur(0px)',
          duration,
          stagger,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: threshold,
            once: true,
          },
        },
      )
    }, el)

    return () => ctx.revert()
  }, [delay, stagger, duration, threshold])

  const content = processNode(children, 'sw')

  const ComponentTag = Component as 'h2'

  return (
    <ComponentTag
      ref={containerRef}
      id={id}
      className={className}
      style={{
        perspective: 1000,
        ...style,
      }}
    >
      {content}
    </ComponentTag>
  )
}
