import { contextBridge, ipcRenderer } from 'electron'

// ============================================================================
// IPC Bridge
// ============================================================================

contextBridge.exposeInMainWorld('api', {
  /**
   * Searches for song lyrics via the main process AI pipeline.
   *
   * @param query - Free-form query (e.g. "아이유 좋은날", "BTS Dynamite")
   * @returns Structured lyrics data for typing practice
   */
  searchLyrics: (query: string) =>
    ipcRenderer.invoke('search-lyrics', query)
})
