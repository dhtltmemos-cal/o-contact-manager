// Path: src-frontend/src/pages/NewContactPage.tsx

import { useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { TopBar } from '@/components/layout/TopBar'
import { ContactForm } from '@/components/contact/ContactForm'
import { useContactMutations } from '@/hooks/useContactMutations'
import { ROUTES } from '@/constants/routes'
import type { ContactFormValues } from '@/utils/validators'

export function NewContactPage() {
  const navigate = useNavigate()
  const { create } = useContactMutations()

  const handleSubmit = (data: ContactFormValues) => {
    create.mutate(data as Parameters<typeof create.mutate>[0], {
      onSuccess: (result) => {
        navigate(ROUTES.contactDetail(result.contactId))
      },
    })
  }

  return (
    <AppShell>
      <TopBar showBack title="Tạo liên hệ mới" />
      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
        <ContactForm
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          isLoading={create.isPending}
        />
      </div>
    </AppShell>
  )
}
