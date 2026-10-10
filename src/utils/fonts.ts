export interface FontDefinition {
  name: string
  family: string
  weight?: number | string
  style?: string
  letterSpacing?: string
}

export const FONT_COLLECTION: FontDefinition[] = [
  { name: 'Cinzel Decorative', family: "'Cinzel Decorative', serif", weight: 900 },
  { name: 'Syne', family: "'Syne', sans-serif", weight: 800 },
  { name: 'Orbitron', family: "'Orbitron', sans-serif", weight: 900 },
  { name: 'UnifrakturMaguntia', family: "'UnifrakturMaguntia', cursive", weight: 400 },
  { name: 'Cabinet Grotesk', family: "'Montserrat', sans-serif", weight: 900 },
  { name: 'Space Grotesk', family: "'Space Grotesk', sans-serif", weight: 700 },
  { name: 'Bebas Neue', family: "'Bebas Neue', cursive", weight: 400 },
  { name: 'Playfair Display', family: "'Playfair Display', serif", weight: 900, style: 'italic' },
  { name: 'Major Mono Display', family: "'Major Mono Display', monospace", weight: 400 },
  { name: 'Righteous', family: "'Righteous', cursive", weight: 400 },
  { name: 'Russo One', family: "'Russo One', sans-serif", weight: 400 },
  { name: 'Silkscreen', family: "'Silkscreen', cursive", weight: 700 },
  { name: 'Rubik Glitch', family: "'Rubik Glitch', cursive", weight: 400 },
  { name: 'Inter Black', family: "'Inter', sans-serif", weight: 900 },
  { name: 'Monospace Tech', family: "'Courier New', Courier, monospace", weight: 800 },
]

export function getRandomFonts(count: number): FontDefinition[] {
  // Fisher-Yates shuffle
  const shuffled = [...FONT_COLLECTION]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  // Return count fonts, if count > pool wrap around with random selection
  const result: FontDefinition[] = []
  for (let i = 0; i < count; i++) {
    result.push(shuffled[i % shuffled.length])
  }
  return result
}

