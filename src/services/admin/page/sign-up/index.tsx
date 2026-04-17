'use client'

/**
 * Admin Sign Up Page
 *
 * TODO: auth-setup 후 실제 회원가입 폼 구현
 */
export default function AdminSignUp() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">관리자 회원가입</h1>
          <p className="text-gray-600 mt-2">관리자 계정을 생성하세요</p>
        </div>
        {/* TODO: 회원가입 폼 */}
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
          <p className="font-semibold">⚠️ 아이디를 만들고 나면 꼭 어드민 회원가입 기능을 막아주세요.</p>
          <p className="mt-1">AI에게 &quot;어드민 회원가입 막아줘&quot;라고 요청해주세요.</p>
        </div>
      </div>
    </div>
  )
}
