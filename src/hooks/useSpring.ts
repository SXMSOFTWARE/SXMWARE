import { useRef, useCallback, useEffect } from 'react'

interface SpringConfig {
  stiffness: number // 0-1, how quickly it reaches target
  damping: number   // 0-1, how much oscillation is absorbed
}

interface SpringValue {
  value: number
  target: number
  velocity: number
}

/**
 * A simple spring physics hook that updates a value toward a target
 * using stiffness/damping. Updates happen via requestAnimationFrame
 * in the consuming component's animation loop — this hook just manages state.
 */
export function useSpring(
  initial: number,
  config: SpringConfig
): SpringValue {
  const ref = useRef<SpringValue>({
    value: initial,
    target: initial,
    velocity: 0,
  })

  // Update spring state each frame (called externally via rAF)
  const tick = useCallback(() => {
    const s = ref.current
    const force = (s.target - s.value) * config.stiffness
    s.velocity += force
    s.velocity *= config.damping
    s.value += s.velocity

    // Snap to target when close enough
    if (Math.abs(s.value - s.target) < 0.01 && Math.abs(s.velocity) < 0.01) {
      s.value = s.target
      s.velocity = 0
    }
  }, [config.stiffness, config.damping])

  // Auto-tick via shared rAF
  useEffect(() => {
    let frame: number
    const loop = () => {
      tick()
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [tick])

  return ref.current
}

