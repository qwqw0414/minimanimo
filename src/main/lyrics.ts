import { google } from '@ai-sdk/google'
import { generateText, Output } from 'ai'
import { z } from 'zod'

// ============================================================================
// Constants
// ============================================================================

const MODEL_ID = 'gemini-2.5-flash'

const LYRICS_SCHEMA = z.object({
  lines: z
    .array(z.string().describe('A single line of lyrics for typing practice'))
    .describe('Array of lyrics lines for typing practice')
})

const SONG_INFO_SCHEMA = z.object({
  artist: z.string().describe('Artist name extracted from the lyrics search'),
  title: z.string().describe('Song title extracted from the lyrics search')
})

// ============================================================================
// Public API
// ============================================================================

/**
 * Searches for song lyrics from a free-form query using Gemini with Google Search grounding,
 * then restructures the result into a typed JSON format for typing practice.
 *
 * @param query - Free-form search query (e.g. "아이유 좋은날", "BTS Dynamite")
 * @returns Structured lyrics data for typing practice
 */
export async function searchLyrics(
  query: string
): Promise<{ title: string; artist: string; lines: string[] }> {
  const rawLyrics = await fetchLyricsWithGrounding(query)
  const [structuredLyrics, songInfo] = await Promise.all([
    structureLyrics(rawLyrics),
    extractSongInfo(query)
  ])
  return { title: songInfo.title, artist: songInfo.artist, lines: structuredLyrics.lines }
}

// ============================================================================
// Private Helpers
// ============================================================================

/**
 * Step 1: Fetch raw lyrics text using Google Search grounding.
 */
async function fetchLyricsWithGrounding(query: string): Promise<string> {
  console.log(`[step]=[ 1] [action]=[fetchLyricsWithGrounding] [query]=[${query}]`)

  const { text } = await generateText({
    model: google(MODEL_ID),
    tools: {
      google_search: google.tools.googleSearch({})
    },
    prompt: [
      `다음 검색어로 노래 가사 전체를 찾아줘: "${query}"`,
      '가사 원문만 출력하고, 다른 설명은 하지 마.',
      '가사를 찾을 수 없으면 "LYRICS_NOT_FOUND"라고만 출력해.'
    ].join('\n')
  })

  console.log(`[step]=[ 1] [result]=[rawLyrics] [length]=[${text.length}]`)
  console.log(text)

  if (text.includes('LYRICS_NOT_FOUND')) {
    throw new Error(`가사를 찾을 수 없습니다: "${query}"`)
  }

  return text
}

/**
 * Step 2: Split raw lyrics into typing-practice-ready lines.
 */
async function structureLyrics(
  rawLyrics: string
): Promise<z.infer<typeof LYRICS_SCHEMA>> {
  console.log(`[step]=[ 2] [action]=[structureLyrics] [rawLyricsLength]=[${rawLyrics.length}]`)

  const { output } = await generateText({
    model: google(MODEL_ID),
    output: Output.object({ schema: LYRICS_SCHEMA }),
    prompt: [
      '다음 노래 가사를 타자연습용 줄 단위로 나눠줘.',
      '',
      '규칙:',
      '- 빈 줄이나 반복 표시("[반복]", "x2" 등)는 제거하고 실제 가사만 포함',
      '- 각 줄은 타자연습으로 치기에 적당한 길이(대략 한 줄에 20~60자)로 분리',
      '- 너무 짧은 줄("아", "오" 같은 감탄사 단독)은 앞뒤 줄과 합쳐',
      '',
      '가사:',
      rawLyrics
    ].join('\n')
  })

  console.log(`[step]=[ 2] [result]=[structuredLyrics] [lineCount]=[${output?.lines?.length ?? 0}]`)

  if (!output) {
    throw new Error('가사 구조화에 실패했습니다')
  }

  return output
}

/**
 * Step 2b: Extract artist and title from the query (runs in parallel with structureLyrics).
 */
async function extractSongInfo(
  query: string
): Promise<z.infer<typeof SONG_INFO_SCHEMA>> {
  const { output } = await generateText({
    model: google(MODEL_ID),
    output: Output.object({ schema: SONG_INFO_SCHEMA }),
    prompt: `다음 검색어에서 가수명과 곡 제목을 추출해줘: "${query}"`
  })

  if (!output) {
    return { artist: '', title: query }
  }

  return output
}
