import { AppLayoutClient } from './client'
import { user as userApi } from '@/services/app/api/user'

/**
 * AppLayout Component (Server Component)
 *
 * App 서비스 전용 레이아웃.
 * 서버에서 사용자 세션을 가져와 클라이언트로 전달.
 */
export async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await userApi.getMe()

  return (
    <AppLayoutClient user={user}>
      {children}
    </AppLayoutClient>
  )
}
