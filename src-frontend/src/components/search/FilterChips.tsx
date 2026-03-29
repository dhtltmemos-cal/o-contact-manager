// Path: src-frontend/src/components/search/FilterChips.tsx

import { clsx } from 'clsx'
import { useFilterStore } from '@/store/filter.store'

interface ChipProps {
  label: string
  onRemove: () => void
}

function Chip({ label, onRemove }: ChipProps) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary text-body-sm font-medium">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Xóa filter: ${label}`}
        className="ml-0.5 hover:text-primary-700 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  )
}

interface FilterChipsProps {
  className?: string
}

export function FilterChips({ className }: FilterChipsProps) {
  const { category, domain, email, udKey, hasUD, setCategory, setDomain, setEmail, setUdKey, setHasUD, resetFilters, hasActiveFilters } =
    useFilterStore()

  if (!hasActiveFilters()) return null

  const chips: Array<{ label: string; onRemove: () => void }> = []

  if (category) chips.push({ label: `Nhóm: ${category}`, onRemove: () => setCategory(null) })
  if (domain) chips.push({ label: `Domain: ${domain}`, onRemove: () => setDomain(null) })
  if (email) chips.push({ label: `Email: ${email}`, onRemove: () => setEmail(null) })
  if (udKey) chips.push({ label: `Key: ${udKey}`, onRemove: () => setUdKey(null) })
  if (hasUD !== null)
    chips.push({
      label: hasUD ? 'Có trường tùy chỉnh' : 'Không có trường tùy chỉnh',
      onRemove: () => setHasUD(null),
    })

  return (
    <div className={clsx('flex items-center flex-wrap gap-2 px-4 py-2', className)}>
      {chips.map((chip) => (
        <Chip key={chip.label} {...chip} />
      ))}
      {chips.length >= 2 && (
        <button
          onClick={resetFilters}
          className="text-body-sm text-on-surface-variant hover:text-error transition-colors ml-1"
        >
          Xóa tất cả
        </button>
      )}
    </div>
  )
}
