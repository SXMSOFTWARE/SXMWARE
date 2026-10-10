import { useRef, useEffect, memo } from 'react'

interface CursorGlowProps {
  cursorRef: React.MutableRefObject<{ x: number; y: number }>
}

/**
 * A soft radial glow that follows the cursor, illuminating the background.
 * Uses direct DOM manipulation for 60fps without React re-renders.
 */
export const CursorGlow = memo(function CursorGlow({ cursorRef }: CursorGlowProps) {
  const elRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame: number
    // Smoothed position
    let sx = cursorRef.current.x
    let sy = cursorRef.current.y

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const loop = () => {
      const el = elRef.current
      if (!el) return

      // Smooth follow with lerp
      sx += (cursorRef.current.x - sx) * 0.08
      sy += (cursorRef.current.y - sy) * 0.08

      el.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -50%)`
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [cursorRef])

  return (
    <div
      ref={elRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 26, 26, 0.08) 0%, rgba(80, 15, 15, 0.03) 40%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 2,
        willChange: 'transform',
      }}
    />
  )
})

