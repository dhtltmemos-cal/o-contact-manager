// Path: src-frontend/src/pages/UdKeysPage.tsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { TopBar } from '@/components/layout/TopBar'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useUdKeys } from '@/hooks/useStats'
import { useFilterStore } from '@/store/filter.store'
import { ROUTES } from '@/constants/routes'

export function UdKeysPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const setUdKey = useFilterStore((s) => s.setUdKey)
  const { data, isLoading } = useUdKeys()

  const keys = data?.data ?? []
  const filtered = search
    ? keys.filter((k) => k.key.toLowerCase().includes(search.toLowerCase()))
    : keys

  const handleSelect = (key: string) => {
    setUdKey(key)
    navigate(ROUTES.home)
  }

  return (
    <AppShell>
      <TopBar showBack title="UserDefined Keys" />

      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm key..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-divider bg-white text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="md" className="text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Không có keys nào"
          description="Thêm userDefined fields vào contacts để thấy keys tại đây."
          icon={
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" strokeLinecap="round" />
            </svg>
          }
        />
      ) : (
        <div className="flex-1 overflow-y-auto divide-y divide-divider">
          {filtered.map((item) => (
            <button
              key={item.key}
              onClick={() => handleSelect(item.key)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-container transition-colors"
            >
              <span className="text-primary shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" strokeLinecap="round" />
                </svg>
              </span>
              <span className="flex-1 font-mono text-body-md text-on-surface truncate">{item.key}</span>
              <span className="shrink-0 text-label bg-primary-50 text-primary rounded-full px-2 py-0.5 min-w-[1.5rem] text-center">
                {item.count}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="px-4 py-2 border-t border-divider text-body-sm text-on-surface-variant">
        Tổng: {keys.length} keys • {keys.reduce((s, k) => s + k.count, 0)} contacts
      </div>
    </AppShell>
  )
}
