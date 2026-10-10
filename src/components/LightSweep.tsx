import { memo } from 'react'

/**
 * A subtle red light sweep that passes across the hero area periodically.
 * Pure CSS animation for zero JS overhead.
 */
export const LightSweep = memo(function LightSweep() {
  return (
    <>
      <style>{`
        @keyframes lightSweep {
          0% {
            transform: translateX(-120%) skewX(-15deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(120vw) skewX(-15deg);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .light-sweep {
            animation: none !important;
            display: none;
          }
        }
      `}</style>
      <div
        className="light-sweep"
        style={{
          position: 'absolute',
          top: '35%',
          left: 0,
          width: '200px',
          height: '30%',
          background: 'linear-gradient(90deg, transparent, rgba(196, 43, 43, 0.04), rgba(255, 60, 60, 0.06), rgba(196, 43, 43, 0.04), transparent)',
          pointerEvents: 'none',
          zIndex: 3,
          animation: 'lightSweep 8s ease-in-out infinite',
          animationDelay: '3s',
          willChange: 'transform',
        }}
      />
    </>
  )
})

