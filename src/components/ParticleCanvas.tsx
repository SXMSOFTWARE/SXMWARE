import { useRef, useEffect, memo } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  maxOpacity: number
  life: number
  maxLife: number
  bright: boolean
}

const PARTICLE_COUNT = 60
const BRIGHT_RATIO = 0.08

function createParticle(w: number, h: number, bright = false): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -Math.random() * 0.4 - 0.1, // Drift upward like embers
    size: bright ? Math.random() * 2.5 + 1.5 : Math.random() * 1.5 + 0.5,
    opacity: 0,
    maxOpacity: bright ? Math.random() * 0.6 + 0.4 : Math.random() * 0.25 + 0.05,
    life: 0,
    maxLife: Math.random() * 600 + 200,
    bright,
  }
}

export const ParticleCanvas = memo(function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let w = window.innerWidth
    let h = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialize particles
    const particles: Particle[] = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const bright = i < PARTICLE_COUNT * BRIGHT_RATIO
      const p = createParticle(w, h, bright)
      p.life = Math.random() * p.maxLife // Stagger start
      particles.push(p)
    }

    let frame: number
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      if (prefersReduced) {
        frame = requestAnimationFrame(draw)
        return
      }

      for (const p of particles) {
        p.life++
        const lifeRatio = p.life / p.maxLife

        // Fade in/out
        if (lifeRatio < 0.1) {
          p.opacity = (lifeRatio / 0.1) * p.maxOpacity
        } else if (lifeRatio > 0.8) {
          p.opacity = ((1 - lifeRatio) / 0.2) * p.maxOpacity
        } else {
          p.opacity = p.maxOpacity
        }

        p.x += p.vx
        p.y += p.vy

        // Add slight sine wobble
        p.x += Math.sin(p.life * 0.01 + p.y * 0.005) * 0.15

        // Recycle
        if (p.life >= p.maxLife || p.y < -20 || p.x < -20 || p.x > w + 20) {
          Object.assign(p, createParticle(w, h, p.bright))
          p.y = h + 10 // Start from bottom
        }

        // Draw
        if (p.bright) {
          // Brighter ember with glow
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
          grad.addColorStop(0, `rgba(196, 60, 60, ${p.opacity})`)
          grad.addColorStop(0.4, `rgba(139, 26, 26, ${p.opacity * 0.5})`)
          grad.addColorStop(1, 'rgba(139, 26, 26, 0)')
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
          ctx.fill()
        }

        // Core dot
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.bright
          ? `rgb(220, 80, 80)`
          : `rgb(160, 60, 60)`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  )
})

