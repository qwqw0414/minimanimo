import { useState, useCallback, useRef, useEffect } from 'react'
import type { LyricsData, TypingStats } from '@/types'

// ============================================================================
// Constants
// ============================================================================

const SECONDS_PER_MINUTE = 60
const CHARS_PER_WORD = 5

// ============================================================================
// Types
// ============================================================================

interface UseTypingReturn {
  currentLineIndex: number
  currentInput: string
  isComplete: boolean
  stats: TypingStats
  handleInput: (value: string) => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  reset: () => void
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Custom hook for managing typing practice state.
 * Tracks user input against lyrics lines, calculates WPM and accuracy.
 *
 * @param lyrics - Structured lyrics data to practice with
 * @returns Typing state and handlers
 */
export function useTyping(lyrics: LyricsData | null): UseTypingReturn {
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [currentInput, setCurrentInput] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [correctChars, setCorrectChars] = useState(0)
  const [totalChars, setTotalChars] = useState(0)

  const startTimeRef = useRef<number | null>(null)
  const elapsedRef = useRef(0)

  // ============================================================================
  // Timer
  // ============================================================================

  useEffect(() => {
    if (!lyrics || isComplete) return

    if (startTimeRef.current === null && totalChars > 0) {
      startTimeRef.current = Date.now()
    }

    const interval = setInterval(() => {
      if (startTimeRef.current !== null) {
        elapsedRef.current = (Date.now() - startTimeRef.current) / 1000
      }
    }, 200)

    return (): void => clearInterval(interval)
  }, [lyrics, isComplete, totalChars])

  // ============================================================================
  // Stats Calculation
  // ============================================================================

  const calculateStats = useCallback((): TypingStats => {
    const elapsed = elapsedRef.current
    const hasElapsed = elapsed > 0
    const wpm = hasElapsed ? Math.round((correctChars / CHARS_PER_WORD) / (elapsed / SECONDS_PER_MINUTE)) : 0
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100

    return {
      wpm,
      accuracy,
      correctChars,
      totalChars,
      elapsedSeconds: Math.floor(elapsed)
    }
  }, [correctChars, totalChars])

  // ============================================================================
  // Input Handlers
  // ============================================================================

  const handleInput = useCallback(
    (value: string): void => {
      if (!lyrics || isComplete) return
      setCurrentInput(value)
    },
    [lyrics, isComplete]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): void => {
      if (!lyrics || isComplete) return

      if (e.key !== 'Enter') return

      const target = lyrics.lines[currentLineIndex]
      if (!target) return

      const input = currentInput

      // Count correct and total characters for this line
      const lineCorrect = countCorrectChars(input, target)
      const lineTotal = Math.max(input.length, target.length)

      setCorrectChars((prev) => prev + lineCorrect)
      setTotalChars((prev) => prev + lineTotal)

      const nextIndex = currentLineIndex + 1
      if (nextIndex >= lyrics.lines.length) {
        setIsComplete(true)
      } else {
        setCurrentLineIndex(nextIndex)
      }

      setCurrentInput('')
    },
    [lyrics, isComplete, currentLineIndex, currentInput]
  )

  // ============================================================================
  // Reset
  // ============================================================================

  const reset = useCallback((): void => {
    setCurrentLineIndex(0)
    setCurrentInput('')
    setIsComplete(false)
    setCorrectChars(0)
    setTotalChars(0)
    startTimeRef.current = null
    elapsedRef.current = 0
  }, [])

  return {
    currentLineIndex,
    currentInput,
    isComplete,
    stats: calculateStats(),
    handleInput,
    handleKeyDown,
    reset
  }
}

// ============================================================================
// Private Helpers
// ============================================================================

/**
 * Counts how many characters in the input match the target at each position.
 */
function countCorrectChars(input: string, target: string): number {
  let correct = 0
  const minLen = Math.min(input.length, target.length)

  for (let i = 0; i < minLen; i++) {
    if (input[i] === target[i]) {
      correct++
    }
  }

  return correct
}
