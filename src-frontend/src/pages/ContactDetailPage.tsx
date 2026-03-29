// Path: src-frontend/src/pages/ContactDetailPage.tsx

import { useParams, useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { TopBar } from '@/components/layout/TopBar'
import { ContactDetail } from '@/components/contact/ContactDetail'
import { EmptyState } from '@/components/ui/EmptyState'
import { useContact } from '@/hooks/useContact'
import { ROUTES } from '@/constants/routes'

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: contact, isLoading, isError } = useContact(id)

  if (isError || (!isLoading && !contact)) {
    return (
      <AppShell>
        <TopBar showBack title="Liên hệ không tồn tại" />
        <EmptyState
          title="Không tìm thấy liên hệ"
          description="Liên hệ này đã bị xóa hoặc không tồn tại."
          action={
            <button
              onClick={() => navigate(ROUTES.home)}
              className="px-4 py-2 bg-primary text-white rounded-lg text-body-md hover:bg-primary-600 transition-colors"
            >
              Về trang chính
            </button>
          }
        />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <TopBar showBack />
      <div className="flex-1 overflow-hidden">
        {contact && (
          <ContactDetail
            contact={contact}
            isLoading={isLoading}
            onClose={() => navigate(ROUTES.home)}
          />
        )}
      </div>
    </AppShell>
  )
}
