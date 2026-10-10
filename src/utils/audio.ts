/**
 * Premium Glass Audio Controller
 * Loads the user's glass.mp3 sample, slices all individual crystal hits/chimes,
 * and dynamically plays them with variable pitch, random slice selection,
 * spatial panning, and smooth volume ramping when hovering over SXMWARE letters.
 */

// Precise onset timestamps (in seconds) of the distinct glass hits in glass.mp3
const GLASS_CUES = [
  { start: 0.68, duration: 1.8 },
  { start: 3.14, duration: 1.9 },
  { start: 5.68, duration: 1.8 },
  { start: 8.12, duration: 1.7 },
  { start: 10.43, duration: 1.6 },
  { start: 12.65, duration: 1.8 },
  { start: 15.15, duration: 1.8 },
  { start: 17.58, duration: 1.6 },
  { start: 19.76, duration: 1.7 },
  { start: 22.08, duration: 1.7 },
  { start: 24.33, duration: 1.8 },
  { start: 26.76, duration: 1.6 },
  { start: 28.98, duration: 1.4 },
  { start: 30.93, duration: 1.4 },
  { start: 32.83, duration: 1.5 },
  { start: 34.91, duration: 1.5 },
  { start: 37.01, duration: 1.6 },
  { start: 39.23, duration: 1.6 },
]

class GlassAudioEngine {
  private ctx: AudioContext | null = null
  private audioBuffer: AudioBuffer | null = null
  private isLoading = false
  private lastTriggerTime = 0
  private lastCueIndex = -1

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  /**
   * Preload and decode glass.mp3 into an in-memory AudioBuffer for zero-latency playback
   */
  async loadAudio() {
    if (this.audioBuffer || this.isLoading) return
    this.isLoading = true

    try {
      const ctx = this.initContext()
      if (!ctx) return

      const res = await fetch('/sounds/glass.mp3')
      const arrayBuffer = await res.arrayBuffer()
      this.audioBuffer = await ctx.decodeAudioData(arrayBuffer)
    } catch (err) {
      console.warn('Could not decode glass.mp3 audio:', err)
    } finally {
      this.isLoading = false
    }
  }

  /**
   * Plays a dynamic glass slice when hovering on a letter.
   * @param letterIndex 0 to 6 (S X M W A R E)
   * @param relativeX normalized cursor position within the letter (-1 to 1)
   */
  playLetterHover(letterIndex: number, relativeX = 0) {
    const now = Date.now()
    // Soft debounce to prevent harsh audio clipping
    if (now - this.lastTriggerTime < 85) return
    this.lastTriggerTime = now

    const ctx = this.initContext()
    if (!ctx) return

    // If buffer not loaded yet, initiate load and return
    if (!this.audioBuffer) {
      this.loadAudio()
      return
    }

    // Pick a cue index based on letter index + slight randomization
    // Ensures adjacent letters don't sound identical while rotating through the 18 cues
    let cueIdx = (letterIndex * 2 + Math.floor(Math.random() * 3)) % GLASS_CUES.length
    if (cueIdx === this.lastCueIndex) {
      cueIdx = (cueIdx + 1) % GLASS_CUES.length
    }
    this.lastCueIndex = cueIdx

    const cue = GLASS_CUES[cueIdx]

    // Create buffer source
    const source = ctx.createBufferSource()
    source.buffer = this.audioBuffer

    // Variable pitch calculation:
    // Base pitch gently ascends across SXMWARE letters (e.g. 0.88x to 1.18x)
    // + micro pitch variation based on cursor position (-0.05x to +0.05x)
    // + slight random detune (+- 0.04x) for organic crystal resonance
    const letterPitchBase = 0.88 + (letterIndex / 6) * 0.32
    const cursorPitchMod = relativeX * 0.05
    const randomPitchMod = (Math.random() - 0.5) * 0.06
    const playbackRate = Math.max(0.6, Math.min(1.8, letterPitchBase + cursorPitchMod + randomPitchMod))
    source.playbackRate.value = playbackRate

    // Gain envelope (soft attack, crystal decay)
    const gainNode = ctx.createGain()
    const t = ctx.currentTime
    const duration = cue.duration / playbackRate

    gainNode.gain.setValueAtTime(0.001, t)
    gainNode.gain.linearRampToValueAtTime(0.42, t + 0.02) // Gentle onset
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + duration)

    // Stereo panning (spatial audio from left to right letters)
    let panner: StereoPannerNode | null = null
    if (ctx.createStereoPanner) {
      panner = ctx.createStereoPanner()
      // Map letter index 0..6 to pan -0.65 .. +0.65
      const pan = -0.65 + (letterIndex / 6) * 1.3
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), t)
      source.connect(gainNode)
      gainNode.connect(panner)
      panner.connect(ctx.destination)
    } else {
      source.connect(gainNode)
      gainNode.connect(ctx.destination)
    }

    // Play sliced audio segment
    source.start(t, cue.start, cue.duration)
  }

  /**
   * Continuous subtle glide when moving inside a letter
   */
  playLetterGlide(letterIndex: number, relativeX: number) {
    const now = Date.now()
    if (now - this.lastTriggerTime < 130) return
    this.playLetterHover(letterIndex, relativeX)
  }
}

export const glassAudio = new GlassAudioEngine()
