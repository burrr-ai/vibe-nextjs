'use client'

import { useUser, type User } from '@/services/app/state/user'

/**
 * UserInit Component (Internal)
 *
 * Initializes user state from server-side data.
 * Uses silent() to prevent re-render on initial load.
 */
function UserInit({ user }: { user?: User | null }) {
  const init = useUser(s => s.actions.init)

  /**
   * Initialize user state from server
   * DO NOT wrap in useEffect - needs to run during render for SSR
   */
  init(user)

  return null
}

/**
 * AppLayoutClient Component
 *
 * App 서비스 클라이언트 레이아웃:
 * - User state 초기화 (UserInit)
 * - App UI (헤더, 네비게이션 등)
 *
 * TODO: 헤더, 사이드바, 푸터 등 App UI 컴포넌트 추가
 */
export function AppLayoutClient({
  user,
  children
}: {
  user?: User | null
  children: React.ReactNode
}) {
  return (
    <>
      <UserInit user={user} />
      {children}
    </>
  )
}
