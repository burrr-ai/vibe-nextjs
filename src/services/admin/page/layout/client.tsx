'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAdminUser, type User } from '@/services/admin/state/user'
import { Button } from '@/lib/components/ui/button'
import {
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react'

function AdminUserInit({ user }: { user?: User | null }) {
  const init = useAdminUser(s => s.actions.init)
  init(user)
  return null
}

// TODO: 실제 메뉴에 맞게 수정
const navItems = [
  { label: '대시보드', href: '/admin', icon: LayoutDashboard },
]

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {/* 모바일 오버레이 */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-gray-200 bg-white transition-transform lg:static lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* 로고 영역 */}
        <div className="flex h-14 items-center justify-between px-4">
          <span className="text-lg font-bold text-gray-900">Admin</span>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-white/60 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </a>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export function AdminLayoutClient({
  user,
  children
}: {
  user?: User | null
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <AdminUserInit user={user} />
      <div className="flex h-screen bg-gray-100/50">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* 헤더 */}
          <header className="flex h-14 items-center gap-4 bg-white px-4 border-b border-gray-200">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
            {user && (
              <span className="text-sm text-gray-500">{user.name ?? user.email}</span>
            )}
          </header>

          {/* 콘텐츠 */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
