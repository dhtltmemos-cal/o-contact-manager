// Path: src-frontend/src/App.tsx

import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTE_PATTERNS } from '@/constants/routes'
import { useAuthStore } from '@/store/auth.store'

// Pages
import { ContactsPage } from '@/pages/ContactsPage'
import { ContactDetailPage } from '@/pages/ContactDetailPage'
import { NewContactPage } from '@/pages/NewContactPage'
import { EditContactPage } from '@/pages/EditContactPage'
import { SearchPage } from '@/pages/SearchPage'
import { CategoryPage } from '@/pages/CategoryPage'
import { UdKeysPage } from '@/pages/UdKeysPage'
import { StatsPage } from '@/pages/StatsPage'
import { SettingsPage } from '@/pages/SettingsPage'

/**
 * ProtectedRoute: redirect đến /settings nếu chưa có API key
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATTERNS.settings} replace />
  }
  return <>{children}</>
}

/**
 * NotFoundPage
 */
function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 text-center p-6">
      <div className="text-6xl">🔍</div>
      <h1 className="text-headline text-on-surface font-medium">Trang không tìm thấy</h1>
      <p className="text-body-md text-on-surface-variant">URL không hợp lệ hoặc trang đã bị xóa.</p>
      <a href="/" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-body-md">
        Về trang chính
      </a>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Settings không cần auth (để nhập key lần đầu) */}
      <Route path={ROUTE_PATTERNS.settings} element={<SettingsPage />} />

      {/* Protected routes */}
      <Route path={ROUTE_PATTERNS.home} element={<ProtectedRoute><ContactsPage /></ProtectedRoute>} />
      <Route path={ROUTE_PATTERNS.contactNew} element={<ProtectedRoute><NewContactPage /></ProtectedRoute>} />
      <Route path={ROUTE_PATTERNS.contactDetail} element={<ProtectedRoute><ContactDetailPage /></ProtectedRoute>} />
      <Route path={ROUTE_PATTERNS.contactEdit} element={<ProtectedRoute><EditContactPage /></ProtectedRoute>} />
      <Route path={ROUTE_PATTERNS.search} element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
      <Route path={ROUTE_PATTERNS.category} element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
      <Route path={ROUTE_PATTERNS.udKeys} element={<ProtectedRoute><UdKeysPage /></ProtectedRoute>} />
      <Route path={ROUTE_PATTERNS.stats} element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
