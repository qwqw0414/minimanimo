import type { TypingStats } from '@/types'

// ============================================================================
// Types
// ============================================================================

interface StatsProps {
  stats: TypingStats
  totalLines: number
  currentLine: number
  isComplete: boolean
}

// ============================================================================
// Component
// ============================================================================

/**
 * Inline horizontal stats bar designed for wide layout.
 * Renders as a compact row with progress bar and stat items.
 */
export default function Stats({ stats, totalLines, currentLine, isComplete }: StatsProps): JSX.Element {
  const progress = totalLines > 0 ? Math.round((currentLine / totalLines) * 100) : 0
  const displayProgress = isComplete ? 100 : progress

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-3">
      {/* Progress bar */}
      <div className="w-20 h-1 bg-surface-alt rounded-full overflow-hidden shrink-0">
        <div
          className="h-full bg-primary-dim rounded-full transition-all duration-300"
          style={{ width: `${displayProgress}%` }}
        />
      </div>

      {/* Stats inline */}
      <div className="flex items-center gap-3 text-[11px] text-text-dim">
        <StatItem label="WPM" value={String(stats.wpm)} />
        <StatItem label="정확도" value={`${stats.accuracy}%`} />
        <StatItem label="진행" value={`${isComplete ? totalLines : currentLine}/${totalLines}`} />
        <StatItem label="시간" value={formatTime(stats.elapsedSeconds)} />
      </div>
    </div>
  )
}

// ============================================================================
// Private Components
// ============================================================================

function StatItem({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <span className="whitespace-nowrap">
      <span className="text-text font-mono font-semibold">{value}</span>
      <span className="ml-0.5 text-text-dim">{label}</span>
    </span>
  )
}
