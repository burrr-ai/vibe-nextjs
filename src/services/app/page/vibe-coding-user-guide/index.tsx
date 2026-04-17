"use client"

import { useRef, useState, useEffect } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { MessageSquare, Rocket, Camera, Bug, RefreshCw, Zap, Sparkles } from "lucide-react"

const TYPING_EXAMPLES = [
  "미니멀한 흑백 톤의 의류 쇼핑몰 만들어줘",
  "신뢰감 있는 IT 스타트업 회사 소개 페이지 만들어줘",
  "예약 기능 있는 네일샵 홈페이지 만들어줘",
  "고급스러운 느낌의 인테리어 업체 홈페이지 만들어줘",
]

function TypingAnimation() {
  const [text, setText] = useState("")
  const [exampleIndex, setExampleIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentExample = TYPING_EXAMPLES[exampleIndex]

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (text.length < currentExample.length) {
          setText(currentExample.slice(0, text.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 1500)
        }
      } else {
        if (text.length > 0) {
          setText(text.slice(0, -1))
        } else {
          setIsDeleting(false)
          setExampleIndex((prev) => (prev + 1) % TYPING_EXAMPLES.length)
        }
      }
    }, isDeleting ? 30 : 80)

    return () => clearTimeout(timeout)
  }, [text, isDeleting, exampleIndex])

  return (
    <span className="text-white">
      &quot;{text}&quot;
      <span className="inline-block w-0.5 h-5 bg-white ml-0.5 animate-pulse align-middle" />
    </span>
  )
}

export default function VibeCodingUserGuide() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useGSAP(() => {
    if (!containerRef.current) return

    gsap.fromTo(
      cardsRef.current.filter(Boolean),
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
      }
    )
  }, [])

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-5 py-12 sm:py-20">
        {/* Header - Editorial Style */}
        <header className="mb-12 sm:mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-stone-300" />
            <p className="text-[10px] font-medium tracking-[0.2em] text-stone-500 uppercase">
              User Guide
            </p>
            <div className="h-px flex-1 bg-stone-300" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight text-center">
            바이브코딩 가이드
          </h1>
          <div className="w-12 h-1 bg-red-500 mx-auto mt-6" />
        </header>

        {/* Bento Grid - Editorial Style */}
        <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-6 gap-4">
          {/* Card 1 - 첫 요청 (span 4) */}
          <div
            ref={(el) => { cardsRef.current[0] = el }}
            className="sm:col-span-4 bg-red-600 p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-medium tracking-[0.15em] text-white/70 uppercase">
                Getting Started
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
              첫 요청 잘하는 법
            </h2>
            <p className="text-white/90 text-lg sm:text-xl leading-relaxed">
              무엇을 만들고 싶은지 <span className="font-bold text-white">최대한 자세히</span> 말해주세요
            </p>
            <div className="mt-5 p-4 bg-black/20 border border-white/10">
              <p className="text-[10px] font-medium tracking-[0.15em] text-white/60 uppercase mb-2">Example</p>
              <p className="text-lg sm:text-xl font-medium h-8">
                <TypingAnimation />
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-white/20 space-y-3">
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-white/80 mt-0.5 shrink-0" />
                <p className="text-white/90 text-sm sm:text-base">
                  GPT에게 먼저 기획서를 작성해달라고 하면 더 좋은 결과가 나와요
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-white/80 mt-0.5 shrink-0" />
                <p className="text-white/90 text-sm sm:text-base">
                  디자인 개선을 원하시면 &apos;프론트엔드 스킬을 활용해 개선해줘&apos;라고 요청해보세요
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 - 배포 (span 2) */}
          <div
            ref={(el) => { cardsRef.current[1] = el }}
            className="sm:col-span-2 bg-white border border-stone-200 p-5 sm:p-6 flex flex-col justify-between min-h-[200px] sm:min-h-[240px]"
          >
            <div>
              <div className="w-10 h-10 border-2 border-stone-900 flex items-center justify-center mb-3">
                <Rocket className="w-5 h-5 text-stone-900" />
              </div>
              <p className="text-[10px] font-medium tracking-[0.15em] text-stone-500 uppercase mb-2">
                Deploy
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                배포하기
              </h2>
            </div>
            <div className="space-y-3">
              <p className="text-stone-600 text-sm leading-relaxed">
                완성된 사이트를 링크로 공유하세요.<br />
                <span className="text-stone-900 font-medium">상단의 배포하기 버튼</span>을 눌러주세요
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-[10px] px-3 py-1.5 bg-stone-100 text-stone-600 tracking-wider uppercase">
                  3분 소요
                </span>
                <span className="text-[10px] px-3 py-1.5 bg-red-50 text-red-600 tracking-wider uppercase font-medium">
                  무료
                </span>
              </div>
            </div>
          </div>

          {/* Card 3 - 스크린샷 (span 3) */}
          <div
            ref={(el) => { cardsRef.current[2] = el }}
            className="sm:col-span-3 bg-white border border-stone-200 p-5 sm:p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 border-2 border-stone-900 flex items-center justify-center">
                <Camera className="w-5 h-5 text-stone-900" />
              </div>
              <p className="text-[10px] font-medium tracking-[0.15em] text-stone-500 uppercase">
                Visual Feedback
              </p>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 mb-2">
              스크린샷 활용
            </h2>
            <p className="text-stone-600 text-base leading-relaxed">
              고치고 싶은 부분이 있다면<br />
              <span className="font-bold text-stone-900">스크린샷</span>을 찍어서 올려주세요
            </p>
            <div className="mt-4 p-3 bg-stone-50 border border-stone-200">
              <p className="text-stone-600 text-xs">
                <span className="font-bold text-stone-900">Tip:</span> 미리보기에서 <span className="font-mono bg-stone-200 px-1.5 py-0.5 rounded text-stone-700">Cmd+C</span> (Windows: <span className="font-mono bg-stone-200 px-1.5 py-0.5 rounded text-stone-700">Ctrl+C</span>)를 누르면 해당 파일 위치가 복사돼요. 붙여넣기하면 더 정확히 고쳐줘요!
              </p>
            </div>
          </div>

          {/* Card 4 - 에러 (span 3) */}
          <div
            ref={(el) => { cardsRef.current[3] = el }}
            className="sm:col-span-3 bg-white border border-stone-200 p-5 sm:p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 border-2 border-stone-900 flex items-center justify-center">
                <Bug className="w-5 h-5 text-stone-900" />
              </div>
              <p className="text-[10px] font-medium tracking-[0.15em] text-stone-500 uppercase">
                Debugging
              </p>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 mb-2">
              에러 발견시
            </h2>
            <p className="text-stone-600 text-base leading-relaxed">
              에러 메시지를 <span className="font-bold text-stone-900">그대로 복사</span>해서<br />
              붙여넣기 해주세요
            </p>
            <div className="mt-4 p-3 bg-stone-50 border border-stone-200">
              <p className="text-stone-500 text-xs font-mono">
                F12 → 콘솔 → 빨간 에러 복사
              </p>
            </div>
          </div>

          {/* Card 5 - 서버 에러 (span 4) */}
          <div
            ref={(el) => { cardsRef.current[4] = el }}
            className="sm:col-span-4 bg-white border border-stone-200 p-5 sm:p-6 flex items-center gap-4 sm:gap-6"
          >
            <div className="w-12 h-12 border-2 border-stone-900 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6 text-stone-900" />
            </div>
            <div>
              <p className="text-[10px] font-medium tracking-[0.15em] text-stone-500 uppercase mb-1">
                Troubleshooting
              </p>
              <h2 className="text-lg sm:text-xl font-black text-stone-900 mb-1">
                Sandbox 에러가 안 고쳐질 때
              </h2>
              <p className="text-stone-600 text-base sm:text-lg">
                AI에게 <span className="font-bold text-stone-900">&apos;개발서버 껐다 켜줘&apos;</span>라고 요청해보세요
              </p>
            </div>
          </div>

          {/* Card 6 - 새 대화모드 (span 2) */}
          <div
            ref={(el) => { cardsRef.current[5] = el }}
            className="sm:col-span-2 bg-white border border-stone-200 p-5 sm:p-6 flex flex-col justify-between min-h-[180px]"
          >
            <div>
              <div className="w-10 h-10 border-2 border-stone-900 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-stone-900" />
              </div>
              <p className="text-[10px] font-medium tracking-[0.15em] text-stone-500 uppercase mb-1">
                Performance
              </p>
              <h2 className="text-lg font-black text-stone-900">
                새 대화모드
              </h2>
            </div>
            <p className="text-stone-600 text-sm leading-relaxed">
              대화가 길어지면 새로 시작!<br />
              더 빠르고 정확해져요
            </p>
          </div>

          {/* Card 7 - 리팩토링 (span 6) */}
          <div
            ref={(el) => { cardsRef.current[6] = el }}
            className="sm:col-span-6 bg-white border border-stone-200 p-5 sm:p-6 flex items-center gap-4 sm:gap-6"
          >
            <div className="w-12 h-12 bg-stone-900 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-medium tracking-[0.15em] text-stone-500 uppercase mb-1">
                Maintenance
              </p>
              <h2 className="text-lg sm:text-xl font-black text-stone-900 mb-1">
                작업이 많아지면 코드 정리
              </h2>
              <p className="text-stone-600 text-base sm:text-lg">
                업무 마무리 시 채팅창 하단의 <span className="font-bold text-stone-900">새 대화</span>를 누르고 <span className="font-bold text-stone-900">&apos;리팩토링 해줘&apos;</span>라고 요청하세요. 코드가 정리되어 다음 요청이 수월해져요.
              </p>
            </div>
          </div>
        </div>

        {/* Footer - Editorial Style */}
        <footer className="mt-16 sm:mt-20 text-center">
          <div className="flex items-center gap-4 justify-center mb-4">
            <div className="h-px w-12 bg-stone-300" />
            <div className="w-2 h-2 bg-red-500" />
            <div className="h-px w-12 bg-stone-300" />
          </div>
          <p className="text-[10px] font-medium tracking-[0.2em] text-stone-500 uppercase">
            Made with love by <span className="text-red-500">MVPSTAR</span>
          </p>
        </footer>
      </div>
    </div>
  )
}
