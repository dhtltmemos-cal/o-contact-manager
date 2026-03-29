// Path: src-frontend/src/components/bulk/ExportButton.tsx

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Dropdown } from '@/components/ui/Dropdown'
import { Button } from '@/components/ui/Button'
import { exportContacts } from '@/api/bulk.api'
import { useFilterStore } from '@/store/filter.store'

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false)
  const { category } = useFilterStore()

  const doExport = async (format: 'json' | 'vcf', filtered = false) => {
    setIsExporting(true)
    try {
      const params: { format: 'json' | 'vcf'; category?: string } = { format }
      if (filtered && category) params.category = category

      const blob = await exportContacts(params)
      const ext = format === 'vcf' ? 'vcf' : 'json'
      const name = filtered && category
        ? `contacts_${category}.${ext}`
        : `contacts_all.${ext}`

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Đã xuất file ${name}`)
    } catch (err) {
      toast.error('Xuất thất bại: ' + (err as Error).message)
    } finally {
      setIsExporting(false)
    }
  }

  const items = [
    {
      label: 'Export JSON',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
      onClick: () => doExport('json'),
    },
    {
      label: 'Export VCF',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      ),
      onClick: () => doExport('vcf'),
    },
    ...(category
      ? [
          {
            label: `Export VCF (${category})`,
            divider: true,
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" strokeLinecap="round" />
              </svg>
            ),
            onClick: () => doExport('vcf', true),
          },
        ]
      : []),
  ]

  return (
    <Dropdown
      trigger={
        <Button
          variant="secondary"
          size="sm"
          loading={isExporting}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" />
            </svg>
          }
        >
          Export
        </Button>
      }
      items={items}
      align="right"
    />
  )
}
