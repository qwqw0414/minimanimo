import { useRef, useEffect } from 'react'
import type { LyricsData } from '@/types'
import { useTyping } from '@/hooks/useTyping'
import Stats from './Stats'

// ============================================================================
// Constants
// ============================================================================

const PREVIEW_LINES_COUNT = 3

// ============================================================================
// Types
// ============================================================================

interface TypingPracticeProps {
  lyrics: LyricsData
  onBack: () => void
}

// ============================================================================
// Component
// ============================================================================

export default function TypingPractice({ lyrics, onBack }: TypingPracticeProps): JSX.Element {
  const {
    currentLineIndex,
    currentInput,
    isComplete,
    stats,
    handleInput,
    handleKeyDown,
    reset
  } = useTyping(lyrics)

  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus on the input
  useEffect(() => {
    inputRef.current?.focus()
  }, [currentLineIndex])

  const currentLine = lyrics.lines[currentLineIndex]
  const nextLines = lyrics.lines.slice(currentLineIndex + 1, currentLineIndex + 1 + PREVIEW_LINES_COUNT)

  return (
    <div className="flex flex-col h-full">
      {/* Top bar: nav + stats inline */}
      <div className="flex items-center gap-3 px-4 py-1.5 border-b border-border shrink-0">
        <button
          onClick={onBack}
          className="text-text-dim hover:text-text text-xs transition-colors shrink-0"
        >
          ←
        </button>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-text-dim">{lyrics.artist}</span>
          <span className="text-[11px] text-text-dim">-</span>
          <span className="text-[11px] text-text font-medium">{lyrics.title}</span>
        </div>
        <div className="flex-1" />
        <Stats
          stats={stats}
          totalLines={lyrics.lines.length}
          currentLine={currentLineIndex}
          isComplete={isComplete}
        />
        <button
          onClick={reset}
          className="text-text-dim hover:text-text text-xs transition-colors shrink-0"
        >
          다시
        </button>
      </div>

      {isComplete ? (
        <CompleteScreen stats={stats} onReset={reset} onBack={onBack} />
      ) : (
        <div className="flex-1 flex flex-col min-h-0 px-5 py-3 gap-2">
          {/* Input field */}
          <div className="shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="여기에 입력하세요... (Enter로 다음 줄)"
              className="w-full rounded-lg bg-surface-alt px-3 py-2 text-sm text-text
                         placeholder:text-text-dim border border-border
                         focus:outline-none focus:border-primary-dim
                         font-mono transition-colors"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {/* Current line: character comparison */}
          {currentLine && (
            <div className="shrink-0 bg-surface-alt/50 rounded-lg px-3 py-2 border border-primary-dim/30">
              <span className="text-sm font-mono leading-relaxed">
                {renderCharComparison(currentLine, currentInput)}
              </span>
            </div>
          )}

          {/* Upcoming lines */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-1 pt-1">
            {nextLines.map((line, index) => (
              <div
                key={currentLineIndex + 1 + index}
                className="px-3"
                style={{ opacity: 0.4 - index * 0.1 }}
              >
                <span className="text-sm text-text-dim font-mono">{line}</span>
              </div>
            ))}
          </div>

          {/* Line counter */}
          <p className="shrink-0 text-[10px] text-text-dim text-right">
            {currentLineIndex + 1} / {lyrics.lines.length}  |  Enter로 다음 줄
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Private Components
// ============================================================================

function CompleteScreen({
  stats,
  onReset,
  onBack
}: {
  stats: { wpm: number; accuracy: number; elapsedSeconds: number }
  onReset: () => void
  onBack: () => void
}): JSX.Element {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex-1 flex items-center justify-center gap-10 px-6">
      <div className="text-center">
        <p className="text-xl font-bold text-primary mb-0.5">완료</p>
        <p className="text-[10px] text-text-dim">타자연습을 마쳤습니다</p>
      </div>

      <div className="flex gap-6">
        <div className="text-center">
          <p className="text-2xl font-mono font-bold text-text">{stats.wpm}</p>
          <p className="text-[10px] text-text-dim mt-0.5">WPM</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-mono font-bold text-text">{stats.accuracy}%</p>
          <p className="text-[10px] text-text-dim mt-0.5">정확도</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-mono font-bold text-text">{formatTime(stats.elapsedSeconds)}</p>
          <p className="text-[10px] text-text-dim mt-0.5">소요시간</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onReset}
          className="rounded-lg bg-primary-dim px-3 py-1.5 text-xs font-medium text-white
                     hover:bg-primary-dim/80 transition-colors"
        >
          다시 하기
        </button>
        <button
          onClick={onBack}
          className="rounded-lg bg-surface-alt px-3 py-1.5 text-xs font-medium text-text-dim
                     hover:bg-surface-hover transition-colors border border-border"
        >
          다른 곡
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// Private Helpers
// ============================================================================

function renderCharComparison(target: string, input: string): JSX.Element[] {
  const elements: JSX.Element[] = []

  for (let i = 0; i < target.length; i++) {
    const targetChar = target[i]
    const inputChar = input[i]

    if (inputChar === undefined) {
      elements.push(
        <span key={i} className="text-text-dim">
          {targetChar}
        </span>
      )
    } else if (inputChar === targetChar) {
      elements.push(
        <span key={i} className="text-correct">
          {targetChar}
        </span>
      )
    } else {
      elements.push(
        <span key={i} className="text-wrong bg-wrong/10 rounded-sm">
          {targetChar}
        </span>
      )
    }
  }

  if (input.length > target.length) {
    const extra = input.slice(target.length)
    elements.push(
      <span key="extra" className="text-wrong bg-wrong/20 rounded-sm">
        {extra}
      </span>
    )
  }

  return elements
}
