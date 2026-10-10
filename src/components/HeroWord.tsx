import { useRef, useEffect, useCallback, useState, useMemo, memo } from 'react'
import { Letter3D } from './Letter3D'
import { useSpring } from '../hooks/useSpring'
import { getRandomFonts } from '../utils/fonts'

interface HeroWordProps {
  mounted: boolean
  cursorRef: React.MutableRefObject<{ x: number; y: number }>
}

const LETTERS = ['S', 'X', 'M', 'W', 'A', 'R', 'E'] as const

export const HeroWord = memo(function HeroWord({ mounted, cursorRef }: HeroWordProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chromaRef = useRef<HTMLDivElement>(null)
  const [entered, setEntered] = useState(false)

  // Generate randomized fonts for each letter on refresh / mount
  const letterFonts = useMemo(() => {
    return getRandomFonts(LETTERS.length)
  }, [])

  // Magnetic attraction — gently pull the word toward the cursor
  const magnetX = useSpring(0, { stiffness: 0.015, damping: 0.92 })
  const magnetY = useSpring(0, { stiffness: 0.015, damping: 0.92 })

  // Track cursor velocity for chromatic aberration
  const prevCursor = useRef({ x: 0, y: 0 })
  const velocity = useRef(0)

  const animFrameRef = useRef<number>(0)

  const update = useCallback(() => {
    if (!containerRef.current) {
      animFrameRef.current = requestAnimationFrame(update)
      return
    }

    const rect = containerRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = cursorRef.current.x - cx
    const dy = cursorRef.current.y - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const maxDist = 600
    const strength = Math.max(0, 1 - dist / maxDist) * 8
    magnetX.target = dx * strength * 0.006
    magnetY.target = dy * strength * 0.006

    containerRef.current.style.transform = `translate(${magnetX.value}px, ${magnetY.value}px)`

    // Cursor velocity for chromatic aberration
    const vx = cursorRef.current.x - prevCursor.current.x
    const vy = cursorRef.current.y - prevCursor.current.y
    const speed = Math.sqrt(vx * vx + vy * vy)
    velocity.current = velocity.current * 0.85 + speed * 0.15
    prevCursor.current = { x: cursorRef.current.x, y: cursorRef.current.y }

    // Apply chromatic aberration proportional to velocity
    if (chromaRef.current) {
      const chromaStrength = Math.min(velocity.current * 0.08, 3)
      if (chromaStrength > 0.3) {
        const angle = Math.atan2(vy, vx)
        const offsetX = Math.cos(angle) * chromaStrength
        const offsetY = Math.sin(angle) * chromaStrength
        chromaRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px)`
        chromaRef.current.style.opacity = String(Math.min(chromaStrength * 0.15, 0.3))
      } else {
        chromaRef.current.style.opacity = '0'
      }
    }

    animFrameRef.current = requestAnimationFrame(update)
  }, [cursorRef, magnetX, magnetY])

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(update)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [update])

  const handleFirstEnter = useCallback(() => {
    if (!entered) setEntered(true)
  }, [entered])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
        perspective: '1200px',
        perspectiveOrigin: '50% 50%',
      }}
    >
      {/* Main word container */}
      <div
        ref={containerRef}
        onPointerEnter={handleFirstEnter}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'baseline',
          gap: 'clamp(1px, 0.4vw, 8px)',
          willChange: 'transform',
        }}
      >
        {LETTERS.map((letter, i) => (
          <Letter3D
            key={letter + i}
            letter={letter}
            index={i}
            total={LETTERS.length}
            font={letterFonts[i]}
            mounted={mounted}
            entered={entered}
            cursorRef={cursorRef}
          />
        ))}

        {/* Chromatic aberration ghost layer */}
        <div
          ref={chromaRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'baseline',
            gap: 'clamp(1px, 0.4vw, 8px)',
            pointerEvents: 'none',
            opacity: 0,
            mixBlendMode: 'screen',
            filter: 'blur(1px)',
            color: 'rgba(196, 43, 43, 0.5)',
            fontSize: 'clamp(48px, 12vw, 180px)',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          {LETTERS.map((l, i) => (
            <span
              key={i}
              style={{
                padding: '0 0.03em',
                fontFamily: letterFonts[i].family,
                fontWeight: letterFonts[i].weight ?? 900,
                fontStyle: letterFonts[i].style ?? 'normal',
              }}
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
})
