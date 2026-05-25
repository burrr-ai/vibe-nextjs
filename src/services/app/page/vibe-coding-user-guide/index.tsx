"use client"

import { MousePointerClick } from "lucide-react"

export default function VibeCodingUserGuide() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-lg p-8 sm:p-10">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-6">
          <MousePointerClick className="w-6 h-6 text-gray-700" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
          고치고 싶은 부분, 정확히 짚어주세요
        </h1>
        <p className="text-gray-600 leading-relaxed mb-6">
          미리보기 화면에서 수정하고 싶은 영역을 클릭한 뒤,
          아래 단축키를 누르면 해당 위치가 복사돼요. 채팅창에 붙여넣고
          어떻게 바꾸고 싶은지 말씀해 주세요.
        </p>

        <div className="flex items-center gap-3 p-4 rounded-md bg-gray-50 border border-gray-200">
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 text-sm font-mono bg-white border border-gray-300 rounded shadow-sm text-gray-800">
              Cmd
            </kbd>
            <span className="text-gray-400">+</span>
            <kbd className="px-2 py-1 text-sm font-mono bg-white border border-gray-300 rounded shadow-sm text-gray-800">
              C
            </kbd>
          </div>
          <span className="text-sm text-gray-500">Mac</span>
          <span className="mx-2 h-4 w-px bg-gray-300" />
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 text-sm font-mono bg-white border border-gray-300 rounded shadow-sm text-gray-800">
              Ctrl
            </kbd>
            <span className="text-gray-400">+</span>
            <kbd className="px-2 py-1 text-sm font-mono bg-white border border-gray-300 rounded shadow-sm text-gray-800">
              C
            </kbd>
          </div>
          <span className="text-sm text-gray-500">Windows</span>
        </div>
      </div>
    </div>
  )
}
