// Path: src-frontend/src/pages/EditContactPage.tsx

import { useParams, useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { TopBar } from '@/components/layout/TopBar'
import { ContactForm } from '@/components/contact/ContactForm'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useContact } from '@/hooks/useContact'
import { useContactMutations } from '@/hooks/useContactMutations'
import { ROUTES } from '@/constants/routes'
import type { ContactFormValues } from '@/utils/validators'

export function EditContactPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: contact, isLoading, isError } = useContact(id)
  const { update } = useContactMutations()

  const handleSubmit = (data: ContactFormValues) => {
    if (!id) return
    update.mutate(
      { id, data: data as Parameters<typeof update.mutate>[0]['data'] },
      { onSuccess: () => navigate(ROUTES.contactDetail(id)) }
    )
  }

  if (isLoading) {
    return (
      <AppShell>
        <TopBar showBack title="Chỉnh sửa" />
        <div className="flex items-center justify-center flex-1">
          <Spinner size="lg" className="text-primary" />
        </div>
      </AppShell>
    )
  }

  if (isError || !contact) {
    return (
      <AppShell>
        <TopBar showBack title="Không tìm thấy" />
        <EmptyState title="Không tìm thấy liên hệ" description="Liên hệ đã bị xóa hoặc không tồn tại." />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <TopBar showBack title={`Chỉnh sửa: ${contact.displayName}`} />
      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
        <ContactForm
          contact={contact}
          onSubmit={handleSubmit}
          onCancel={() => navigate(ROUTES.contactDetail(id!))}
          isLoading={update.isPending}
        />
      </div>
    </AppShell>
  )
}
