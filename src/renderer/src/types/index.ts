// ============================================================================
// Lyrics Data Types
// ============================================================================

export interface LyricsData {
  title: string
  artist: string
  lines: string[]
}

// ============================================================================
// Typing Practice State Types
// ============================================================================

export interface TypingStats {
  wpm: number
  accuracy: number
  correctChars: number
  totalChars: number
  elapsedSeconds: number
}

export interface TypingState {
  currentLineIndex: number
  currentInput: string
  isComplete: boolean
  stats: TypingStats
}

// ============================================================================
// IPC API Types
// ============================================================================

export interface ElectronAPI {
  searchLyrics: (query: string) => Promise<LyricsData>
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
