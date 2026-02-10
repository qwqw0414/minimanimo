import { useState, useCallback } from 'react'
import type { LyricsData } from '@/types'
import SearchForm from '@/components/SearchForm'
import TypingPractice from '@/components/TypingPractice'

// ============================================================================
// Types
// ============================================================================

type AppView = 'search' | 'practice'

interface AppState {
  view: AppView
  lyrics: LyricsData | null
  isLoading: boolean
  error: string | null
}

// ============================================================================
// Constants
// ============================================================================

const INITIAL_STATE: AppState = {
  view: 'search',
  lyrics: null,
  isLoading: false,
  error: null
}

// ============================================================================
// Component
// ============================================================================

export default function App(): JSX.Element {
  const [state, setState] = useState<AppState>(INITIAL_STATE)

  const handleSearch = useCallback(async (query: string): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const lyrics = await window.api.searchLyrics(query)
      setState({ view: 'practice', lyrics, isLoading: false, error: null })
    } catch (err) {
      const message = err instanceof Error ? err.message : '가사 검색에 실패했습니다'
      setState((prev) => ({ ...prev, isLoading: false, error: message }))
    }
  }, [])

  const handleBack = useCallback((): void => {
    setState(INITIAL_STATE)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-surface">
      {/* Draggable title bar area */}
      <div className="h-7 shrink-0" />

      {state.view === 'search' && (
        <div className="flex-1 flex items-center justify-center px-5">
          <div className="flex flex-col gap-3 w-full">
            {/* Branding */}
            <h1 className="text-sm font-bold text-primary tracking-tight">minimanimo</h1>

            {/* Search form + spinner */}
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <SearchForm onSearch={handleSearch} isLoading={state.isLoading} />
              </div>
              {state.isLoading && (
                <div className="shrink-0">
                  <div className="w-4 h-4 border-2 border-primary-dim border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Error message */}
          {state.error && (
            <div className="absolute bottom-3 left-5 right-5 rounded-lg bg-wrong/10 border border-wrong/20 px-3 py-1.5">
              <p className="text-xs text-wrong">{state.error}</p>
            </div>
          )}
        </div>
      )}

      {state.view === 'practice' && state.lyrics && (
        <div className="flex-1 min-h-0">
          <TypingPractice lyrics={state.lyrics} onBack={handleBack} />
        </div>
      )}
    </div>
  )
}
