'use client'

import { useState, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/lib/components/ui/data-table'
import type { QueryData, Pageable } from '@/lib/components/ui/data-table'
import { Badge } from '@/lib/components/ui/badge'

// TODO: 실제 데이터 타입으로 교체
type User = {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

// TODO: 실제 컬럼에 맞게 수정
const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: '이름' },
  { accessorKey: 'email', header: '이메일' },
  {
    accessorKey: 'role',
    header: '역할',
    cell: ({ row }) => <Badge variant="secondary">{row.getValue('role')}</Badge>,
  },
  { accessorKey: 'status', header: '상태' },
  { accessorKey: 'createdAt', header: '가입일' },
]

// TODO: 목업 데이터 → state의 Query<Pageable<User>, { page: number }> 로 교체
const PAGE_SIZE = 5
const allMockUsers: User[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  name: `사용자 ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ['관리자', '일반', '게스트'][i % 3],
  status: ['활성', '비활성'][i % 2],
  createdAt: `2026-0${(i % 4) + 1}-${String((i + 1) * 2).padStart(2, '0')}`,
}))

export default function AdminDashboard() {
  // TODO: mock → useAdminUser((s) => ({ users: s.users, actions: s.actions }))
  // data={users}, onPageChange={(page) => actions.loadUsers(page)}
  const [page, setPage] = useState(1)
  const pageable: Pageable<User> = useMemo(() => ({
    items: allMockUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: allMockUsers.length,
    page,
    limit: PAGE_SIZE,
    totalPages: Math.ceil(allMockUsers.length / PAGE_SIZE),
  }), [page])

  // mock QueryData — 실제로는 comwit query 결과를 그대로 넘긴다
  const data: QueryData<User> = {
    data: pageable,
    isLoading: false,
    isFetching: false,
    isSuccess: true,
    isError: false,
    error: null,
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">사용자 관리</h1>
        <p className="text-gray-500 text-sm mt-1">
          전체 사용자 목록을 조회하고 관리합니다.
        </p>
      </div>
      {/* TODO: toolbar에 필터/검색/버튼 등 자유 배치 */}
      <DataTable
        columns={columns}
        data={data}
        onPageChange={setPage}
        onRowClick={(user) => console.log('clicked', user)}
      />
    </div>
  )
}
