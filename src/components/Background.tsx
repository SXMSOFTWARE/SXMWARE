import { memo } from 'react'

/**
 * Multi-layered atmospheric background.
 * Uses stacked radial/conic gradients for depth without Canvas overhead.
 */
export const Background = memo(function Background() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      {/* Layer 1: Near-black base */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#060202',
        }}
      />

      {/* Layer 2: Deep burgundy radials */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 60% at 25% 30%, rgba(42, 10, 10, 0.7) 0%, transparent 70%),
            radial-gradient(ellipse 60% 80% at 75% 70%, rgba(60, 12, 12, 0.5) 0%, transparent 60%),
            radial-gradient(ellipse 100% 50% at 50% 100%, rgba(30, 6, 6, 0.6) 0%, transparent 50%)
          `,
        }}
      />

      {/* Layer 3: Subtle warm focal point */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 40% 35% at 50% 48%, rgba(100, 18, 18, 0.15) 0%, transparent 70%)
          `,
        }}
      />

      {/* Layer 4: Very faint perspective grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.015,
          backgroundImage: `
            linear-gradient(rgba(255,100,100,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,100,100,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          backgroundPosition: 'center center',
          maskImage: 'radial-gradient(ellipse 50% 40% at 50% 55%, black 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 50% 40% at 50% 55%, black 0%, transparent 80%)',
        }}
      />

      {/* Layer 5: Top-down fade for depth */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 40%, transparent 70%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  )
})

