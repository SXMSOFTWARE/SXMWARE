import { useRef, useCallback, useEffect, useState } from 'react'
import { Background } from './components/Background'
import { ParticleCanvas } from './components/ParticleCanvas'
import { HeroWord } from './components/HeroWord'
import { CursorGlow } from './components/CursorGlow'
import { LightSweep } from './components/LightSweep'
import { Projects } from './components/Projects'
import { Socials } from './components/Socials'
import { glassAudio } from './utils/audio'

export default function App() {
  const cursorRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const [mounted, setMounted] = useState(false)

  const handlePointerMove = useCallback((e: React.PointerEvent | PointerEvent) => {
    cursorRef.current.x = e.clientX
    cursorRef.current.y = e.clientY
  }, [])

  useEffect(() => {
    // Preload & decode glass audio immediately
    glassAudio.loadAudio()

    // Prime audio context on first user interaction (browser autoplay policy)
    const primeAudio = () => {
      glassAudio.loadAudio()
      window.removeEventListener('pointerdown', primeAudio)
      window.removeEventListener('keydown', primeAudio)
    }
    window.addEventListener('pointerdown', primeAudio)
    window.addEventListener('keydown', primeAudio)

    // Entrance animation delay
    const t = setTimeout(() => setMounted(true), 100)
    window.addEventListener('pointermove', handlePointerMove as EventListener)

    return () => {
      clearTimeout(t)
      window.removeEventListener('pointermove', handlePointerMove as EventListener)
      window.removeEventListener('pointerdown', primeAudio)
      window.removeEventListener('keydown', primeAudio)
    }
  }, [handlePointerMove])

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <Background />
      <ParticleCanvas />
      <CursorGlow cursorRef={cursorRef} />
      <LightSweep />
      <HeroWord mounted={mounted} cursorRef={cursorRef} />

      {/* Footer Navigation: OUR PROJECTS & ALL SOCIALS */}
      <div
        style={{
          position: 'absolute',
          bottom: 'clamp(20px, 4.5vh, 48px)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(14px, 2.5vh, 24px)',
          width: '90%',
          maxWidth: '900px',
        }}
      >
        {/* OUR PROJECTS */}
        <Projects mounted={mounted} />

        {/* ALL SOCIALS */}
        <Socials mounted={mounted} />
      </div>

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
          zIndex: 10,
        }}
      />
    </div>
  )
}
