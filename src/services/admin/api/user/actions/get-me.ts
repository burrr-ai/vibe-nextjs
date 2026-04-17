'use server'

import { createParallelAction } from '@/lib/utils'
import type { User } from '@/services/admin/state/user'

/**
 * Get current logged-in admin user
 * TODO: auth-setup 후 실제 인증으로 교체
 */
async function _getMe(): Promise<User | null> {
  return {
    id: 'mock-admin-001',
    email: 'admin@example.com',
    name: '관리자',
    username: 'admin',
    displayUsername: 'Admin',
    image: null,
    emailVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }
}

export const getMe = createParallelAction(_getMe)
