import { memo } from 'react'

interface ProjectItem {
  name: string
  url: string
  tag: string
}

const PROJECTS: ProjectItem[] = [
  {
    name: 'sxmusic.lol',
    url: 'https://sxmusic.lol',
    tag: 'AUDIO',
  },
  {
    name: 'sxreaper.xyz',
    url: 'https://sxreaper.xyz',
    tag: 'UTILITY',
  },
  {
    name: 'sxaio.xyz',
    url: 'https://sxaio.xyz',
    tag: 'ALL-IN-ONE',
  },
]

interface ProjectsProps {
  mounted: boolean
}

export const Projects = memo(function Projects({ mounted }: ProjectsProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.5s',
        pointerEvents: 'auto',
      }}
    >
      {/* OUR PROJECTS Header */}
      <div
        style={{
          fontSize: '10px',
          letterSpacing: '0.38em',
          textTransform: 'uppercase',
          color: 'rgba(240, 236, 232, 0.4)',
          fontWeight: 600,
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <span style={{ width: '18px', height: '1px', background: 'rgba(196, 43, 43, 0.35)' }} />
        OUR PROJECTS
        <span style={{ width: '18px', height: '1px', background: 'rgba(196, 43, 43, 0.35)' }} />
      </div>

      {/* Project Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        {PROJECTS.map((project) => (
          <a
            key={project.name}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.025)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: 'rgba(240, 236, 232, 0.85)',
              textDecoration: 'none',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.04em',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: 'pointer',
              overflow: 'hidden',
              userSelect: 'none',
            }}
            onPointerEnter={(e) => {
              const el = e.currentTarget
              el.style.background = 'rgba(196, 43, 43, 0.16)'
              el.style.borderColor = 'rgba(220, 60, 60, 0.55)'
              el.style.transform = 'translateY(-3px) scale(1.04)'
              el.style.boxShadow = '0 10px 26px -4px rgba(196, 43, 43, 0.38), 0 0 16px rgba(220, 60, 60, 0.22)'
              el.style.color = '#ffffff'
            }}
            onPointerLeave={(e) => {
              const el = e.currentTarget
              el.style.background = 'rgba(255, 255, 255, 0.025)'
              el.style.borderColor = 'rgba(255, 255, 255, 0.08)'
              el.style.transform = 'translateY(0) scale(1)'
              el.style.boxShadow = 'none'
              el.style.color = 'rgba(240, 236, 232, 0.85)'
            }}
          >
            {/* Minimal red accent dot */}
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#ff3333',
                boxShadow: '0 0 6px #ff3333',
              }}
            />
            <span>{project.name}</span>
            <span
              style={{
                fontSize: '8px',
                padding: '2px 5px',
                borderRadius: '4px',
                background: 'rgba(196, 43, 43, 0.25)',
                color: 'rgba(255, 120, 120, 0.9)',
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}
            >
              {project.tag}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
})
