// Path: src-frontend/src/components/search/SearchResults.tsx

import { clsx } from 'clsx'
import { ContactAvatar } from '@/components/contact/ContactAvatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import type { ContactIndex } from '@/types/contact.types'

interface SearchResultsProps {
  contacts: ContactIndex[]
  query: string
  isLoading?: boolean
  onSelect?: (contact: ContactIndex) => void
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query || query.length < 2) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-100 text-on-surface font-semibold rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export function SearchResults({ contacts, query, isLoading, onSelect }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="md" className="text-primary" />
      </div>
    )
  }

  if (!query || query.length < 2) {
    return (
      <EmptyState
        title="Nhập từ khóa để tìm kiếm"
        description="Tìm theo tên, email, hoặc tổ chức (tối thiểu 2 ký tự)"
        icon={
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
        }
      />
    )
  }

  if (!contacts.length) {
    return (
      <EmptyState
        title="Không tìm thấy kết quả"
        description={`Không có liên hệ nào khớp với "${query}"`}
        icon={
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
        }
      />
    )
  }

  return (
    <div className="divide-y divide-divider">
      <p className="px-4 py-2 text-body-sm text-on-surface-variant">
        {contacts.length} kết quả cho &ldquo;<strong className="text-on-surface">{query}</strong>&rdquo;
      </p>
      {contacts.map((contact) => (
        <button
          key={contact.id}
          onClick={() => onSelect?.(contact)}
          className={clsx(
            'flex w-full items-center gap-3 px-4 py-3 text-left',
            'hover:bg-surface-container transition-colors duration-100'
          )}
        >
          <ContactAvatar name={contact.displayName} photoUrl={contact.photoUrl} size="md" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-body-md font-medium text-on-surface truncate">
              {highlight(contact.displayName || 'Không tên', query)}
            </p>
            {contact.primaryEmail && (
              <p className="text-body-sm text-on-surface-variant truncate">
                {highlight(contact.primaryEmail, query)}
              </p>
            )}
            {contact.organization && (
              <p className="text-body-sm text-on-surface-variant/70 truncate">
                {highlight(contact.organization, query)}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
