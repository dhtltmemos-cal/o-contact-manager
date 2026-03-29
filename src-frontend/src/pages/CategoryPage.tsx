// Path: src-frontend/src/pages/CategoryPage.tsx

import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { TopBar } from '@/components/layout/TopBar'
import { ContactList } from '@/components/contact/ContactList'
import { ContactDetail } from '@/components/contact/ContactDetail'
import { useInfiniteContacts } from '@/hooks/useContacts'
import { useContact } from '@/hooks/useContact'
import { useFilterStore } from '@/store/filter.store'
import { useUIStore } from '@/store/ui.store'
import { ROUTES } from '@/constants/routes'
import type { ContactIndex } from '@/types/contact.types'

export function CategoryPage() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const setCategory = useFilterStore((s) => s.setCategory)
  const resetFilters = useFilterStore((s) => s.resetFilters)
  const selectedId = useUIStore((s) => s.selectedContactId)
  const setSelectedId = useUIStore((s) => s.setSelectedContactId)

  useEffect(() => {
    if (name) setCategory(decodeURIComponent(name))
    return () => resetFilters()
  }, [name])

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteContacts({ category: name ? decodeURIComponent(name) : undefined })

  const contacts = data?.contacts ?? []
  const { data: selectedContact, isLoading: isDetailLoading } = useContact(selectedId)

  return (
    <AppShell>
      <div className={`flex flex-col flex-1 min-w-0 ${selectedContact ? 'hidden lg:flex' : 'flex'}`}>
        <TopBar
          showBack
          title={`Nhóm: ${name ? decodeURIComponent(name) : ''}`}
          actions={
            <span className="ml-2 text-body-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
              {contacts.length}
            </span>
          }
        />
        <ContactList
          contacts={contacts}
          selectedId={selectedId}
          onSelect={(c: ContactIndex) => setSelectedId(c.id)}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage ?? false}
          fetchNextPage={fetchNextPage}
        />
      </div>

      {selectedId && selectedContact && (
        <div className="flex flex-col w-full lg:w-[420px] xl:w-[480px] shrink-0 border-l border-divider">
          <ContactDetail
            contact={selectedContact}
            isLoading={isDetailLoading}
            onClose={() => setSelectedId(null)}
          />
        </div>
      )}
    </AppShell>
  )
}
