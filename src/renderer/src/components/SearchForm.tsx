import { useState } from 'react'

// ============================================================================
// Types
// ============================================================================

interface SearchFormProps {
  onSearch: (query: string) => void
  isLoading: boolean
}

// ============================================================================
// Component
// ============================================================================

export default function SearchForm({ onSearch, isLoading }: SearchFormProps): JSX.Element {
  const [query, setQuery] = useState('')

  const canSubmit = query.trim().length > 0 && !isLoading

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!canSubmit) return
    onSearch(query.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        placeholder="가수, 곡 제목을 입력하세요"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={isLoading}
        className="flex-1 min-w-0 rounded-lg bg-surface-alt px-3 py-1.5 text-sm text-text
                   placeholder:text-text-dim border border-border
                   focus:outline-none focus:border-primary-dim
                   disabled:opacity-50 transition-colors"
      />
      <button
        type="submit"
        disabled={!canSubmit}
        className="shrink-0 rounded-lg bg-primary-dim px-4 py-1.5 text-sm font-medium text-white
                   hover:bg-primary-dim/80 disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors"
      >
        {isLoading ? '검색 중...' : '검색'}
      </button>
    </form>
  )
}
