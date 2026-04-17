import { AdminLayoutClient } from './client'
import { adminUser } from '@/services/admin/api/user'

/**
 * AdminLayout Component (Server Component)
 *
 * Admin 서비스 전용 레이아웃.
 * 서버에서 어드민 사용자 세션을 가져와 클라이언트로 전달.
 */
export async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await adminUser.getMe()

  return (
    <AdminLayoutClient user={user}>
      {children}
    </AdminLayoutClient>
  )
}
