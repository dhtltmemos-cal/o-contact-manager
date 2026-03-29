// Path: src-frontend/src/pages/SearchPage.tsx

import { useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { SearchBar } from '@/components/search/SearchBar'
import { SearchResults } from '@/components/search/SearchResults'
import { useInfiniteContacts } from '@/hooks/useContacts'
import { useFilterStore } from '@/store/filter.store'
import { useDebounce } from '@/hooks/useDebounce'
import { addRecentSearch, getRecentSearches, clearRecentSearches } from '@/utils/storage'
import { ROUTES } from '@/constants/routes'
import { SEARCH_DEBOUNCE_MS } from '@/constants/config'
import { useUIStore } from '@/store/ui.store'
import type { ContactIndex } from '@/types/contact.types'

export function SearchPage() {
  const navigate = useNavigate()
  const search = useFilterStore((s) => s.search)
  const setSelectedId = useUIStore((s) => s.setSelectedContactId)
  const debounced = useDebounce(search, SEARCH_DEBOUNCE_MS)

  const { data, isLoading } = useInfiniteContacts(
    debounced.length >= 2 ? { search: debounced } : {}
  )
  const contacts = data?.contacts ?? []

  const recentSearches = getRecentSearches()

  const handleSelect = (contact: ContactIndex) => {
    if (search) addRecentSearch(search)
    setSelectedId(contact.id)
    navigate(ROUTES.contactDetail(contact.id))
  }

  return (
    <AppShell>
      <div className="flex flex-col flex-1 min-w-0">
        {/* Search bar header */}
        <div className="px-4 py-3 border-b border-divider">
          <SearchBar autoFocus />
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Recent searches when no query */}
          {!search && recentSearches.length > 0 && (
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-label text-on-surface-variant uppercase tracking-wider">Tìm kiếm gần đây</p>
                <button
                  onClick={clearRecentSearches}
                  className="text-body-sm text-primary hover:underline"
                >
                  Xóa tất cả
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => useFilterStore.getState().setSearch(term)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-body-sm text-on-surface hover:bg-primary-50 hover:text-primary transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="12 8 12 12 14 14" strokeLinecap="round" />
                      <path d="M3.05 11a9 9 0 111.19 5.27" strokeLinecap="round" />
                    </svg>
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          <SearchResults
            contacts={contacts}
            query={debounced}
            isLoading={isLoading && debounced.length >= 2}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </AppShell>
  )
}
