import { useRef, useEffect, useCallback, memo } from 'react'
import { useSpring } from '../hooks/useSpring'
import type { FontDefinition } from '../utils/fonts'
import { glassAudio } from '../utils/audio'

interface Letter3DProps {
  letter: string
  index: number
  total: number
  font: FontDefinition
  mounted: boolean
  entered: boolean
  cursorRef: React.MutableRefObject<{ x: number; y: number }>
}

// Per-letter kerning adjustments (optical)
const KERN: Record<string, string> = {
  W: '-0.02em',
  A: '-0.02em',
  R: '-0.01em',
}

export const Letter3D = memo(function Letter3D({
  letter,
  index,
  total,
  font,
  mounted,
  entered,
  cursorRef,
}: Letter3DProps) {
  const elRef = useRef<HTMLDivElement>(null)
  const hovering = useRef(false)
  const animRef = useRef(0)

  // Spring-animated values — tuned for satisfying, tactile response
  const rotX = useSpring(0, { stiffness: 0.06, damping: 0.82 })
  const rotY = useSpring(0, { stiffness: 0.06, damping: 0.82 })
  const liftZ = useSpring(0, { stiffness: 0.08, damping: 0.78 })
  const scale = useSpring(1, { stiffness: 0.07, damping: 0.8 })
  const glowIntensity = useSpring(0, { stiffness: 0.05, damping: 0.85 })
  const specularX = useSpring(50, { stiffness: 0.04, damping: 0.88 })
  const specularY = useSpring(50, { stiffness: 0.04, damping: 0.88 })
  const entrancePop = useSpring(0, { stiffness: 0.12, damping: 0.7 })

  const updateTransform = useCallback(() => {
    const el = elRef.current
    if (!el) return

    if (hovering.current) {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = cursorRef.current.x - cx
      const dy = cursorRef.current.y - cy
      const rx = Math.max(rect.width / 2, 1)
      const ry = Math.max(rect.height / 2, 1)

      // Normalize to [-1, 1] relative to this letter's bounding box
      const nx = Math.max(-1, Math.min(1, dx / rx))
      const ny = Math.max(-1, Math.min(1, dy / ry))

      // Tilt: rotate around X and Y
      rotY.target = nx * 25
      rotX.target = -ny * 20
      liftZ.target = 35
      scale.target = 1.05
      glowIntensity.target = 1

      // Specular highlight tracks cursor within letter
      specularX.target = 50 + nx * 45
      specularY.target = 50 + ny * 45
    } else {
      rotX.target = entrancePop.value * 5
      rotY.target = 0
      liftZ.target = 0
      scale.target = 1
      glowIntensity.target = 0
      specularX.target = 50
      specularY.target = 50
    }

    // Apply transforms
    const transform = [
      `perspective(800px)`,
      `translateZ(${liftZ.value}px)`,
      `rotateX(${rotX.value}deg)`,
      `rotateY(${rotY.value}deg)`,
      `scale(${scale.value})`,
    ].join(' ')

    el.style.transform = transform

    // Dynamic multi-layer text shadow for depth and crimson glow
    const g = glowIntensity.value
    el.style.textShadow = [
      `0 0 ${18 * g}px rgba(196, 43, 43, ${0.35 * g})`,
      `0 0 ${50 * g}px rgba(139, 26, 26, ${0.12 * g})`,
      `0 ${4 + 10 * g}px ${16 + 24 * g}px rgba(0, 0, 0, ${0.25 + 0.25 * g})`,
    ].join(', ')

    // Update specular highlight overlay
    const specEl = el.querySelector('[data-role="spec"]') as HTMLElement | null
    if (specEl) {
      specEl.style.background = `radial-gradient(
        ellipse 55% 55% at ${specularX.value}% ${specularY.value}%,
        rgba(255, 255, 255, ${0.15 * g}) 0%,
        transparent 70%
      )`
      specEl.style.opacity = String(g)
    }

    // Update all edge elements
    const edgeEls = el.querySelectorAll('[data-role="edge"]')
    edgeEls.forEach((edgeEl) => {
      ;(edgeEl as HTMLElement).style.opacity = String(g * 0.7)
    })

    // Update bottom reflection
    const reflectEl = el.querySelector('[data-role="reflect"]') as HTMLElement | null
    if (reflectEl) {
      reflectEl.style.opacity = String(0.06 + g * 0.08)
    }

    animRef.current = requestAnimationFrame(updateTransform)
  }, [cursorRef, rotX, rotY, liftZ, scale, glowIntensity, specularX, specularY, entrancePop])

  useEffect(() => {
    animRef.current = requestAnimationFrame(updateTransform)
    return () => cancelAnimationFrame(animRef.current)
  }, [updateTransform])

  const handlePointerEnter = useCallback((e: React.PointerEvent) => {
    hovering.current = true
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * 2 - 1
    // Play dynamic crystal hit from glass.mp3 with pitch modulation
    glassAudio.playLetterHover(index, relX)
  }, [index])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * 2 - 1
    // Subtle glide variance while floating cursor inside the letter
    glassAudio.playLetterGlide(index, relX)
  }, [index])

  const handlePointerLeave = useCallback(() => {
    hovering.current = false
  }, [])

  // Entrance ripple
  useEffect(() => {
    if (entered) {
      const delay = index * 90
      const t1 = setTimeout(() => {
        entrancePop.target = 1
      }, delay)
      const t2 = setTimeout(() => {
        entrancePop.target = 0
      }, delay + 250)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    }
  }, [entered, index, entrancePop])

  const entranceDelay = 0.25 + index * 0.08
  const kern = KERN[letter] || '0em'

  return (
    <div
      ref={elRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        position: 'relative',
        display: 'inline-block',
        fontSize: 'clamp(48px, 12vw, 180px)',
        fontWeight: font.weight ?? 900,
        fontFamily: font.family,
        fontStyle: font.style ?? 'normal',
        color: '#f0ece8',
        lineHeight: 1,
        cursor: 'default',
        userSelect: 'none',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        marginLeft: kern,
        opacity: mounted ? 1 : 0,
        transition: `opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1) ${entranceDelay}s`,
        touchAction: 'none',
        padding: '0 0.03em',
      }}
    >
      {/* The letter glyph */}
      {letter}

      {/* Specular highlight */}
      <div
        data-role="spec"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          mixBlendMode: 'overlay',
          opacity: 0,
          borderRadius: '2px',
        }}
      />

      {/* Thin crimson border highlight */}
      <div
        data-role="edge"
        style={{
          position: 'absolute',
          inset: '-3px',
          pointerEvents: 'none',
          border: '1px solid rgba(196, 43, 43, 0.35)',
          borderRadius: '3px',
          opacity: 0,
        }}
      />

      {/* Corner geometric details */}
      <svg
        data-role="edge"
        style={{
          position: 'absolute',
          top: '-8px',
          left: '-8px',
          width: '14px',
          height: '14px',
          opacity: 0,
          pointerEvents: 'none',
        }}
        viewBox="0 0 14 14"
      >
        <path d="M0 10 L0 0 L10 0" fill="none" stroke="rgba(196,43,43,0.45)" strokeWidth="0.8" />
      </svg>
      <svg
        data-role="edge"
        style={{
          position: 'absolute',
          bottom: '-8px',
          right: '-8px',
          width: '14px',
          height: '14px',
          opacity: 0,
          pointerEvents: 'none',
        }}
        viewBox="0 0 14 14"
      >
        <path d="M14 4 L14 14 L4 14" fill="none" stroke="rgba(196,43,43,0.45)" strokeWidth="0.8" />
      </svg>

      {/* Bottom reflection */}
      <div
        data-role="reflect"
        style={{
          position: 'absolute',
          left: '10%',
          right: '10%',
          bottom: '-12px',
          height: '8px',
          background: 'radial-gradient(ellipse at center, rgba(196, 43, 43, 0.3), transparent)',
          filter: 'blur(4px)',
          pointerEvents: 'none',
          opacity: 0.06,
        }}
      />
    </div>
  )
})
