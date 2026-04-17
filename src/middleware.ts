import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================================
// 미들웨어 리다이렉트/인증 로직 작성 시 주의사항
// ============================================================
//
// 아래 경로들은 반드시 제외해야 합니다:
//
// 1. API 라우트: /api/*
// 2. 정적 파일: /_next/static/*, /_next/image/*, /favicon.ico
// 3. 공개 에셋: /images/*, /fonts/*, etc.
//
// matcher 설정 예시:
// export const config = {
//   matcher: [
//     // 아래 경로를 제외한 모든 경로에 미들웨어 적용
//     '/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)',
//   ],
// };
//
// 또는 함수 내부에서 직접 체크:
// if (
//   request.nextUrl.pathname.startsWith('/api') ||
//   request.nextUrl.pathname.startsWith('/_next') ||
//   request.nextUrl.pathname.includes('.')
// ) {
//   return NextResponse.next();
// }
//
// ============================================================

export function middleware(request: NextRequest) {
  // 여기에 리다이렉트/인증 로직 작성

  return NextResponse.next();
}

// 미들웨어를 적용할 경로 설정
// API, 정적 파일, 이미지 등은 제외
export const config = {
  matcher: [
    /*
     * 아래 경로로 시작하는 요청을 제외한 모든 요청에 매칭:
     * - api (API 라우트)
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘)
     * - images (public/images 폴더)
     * - fonts (public/fonts 폴더)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)",
  ],
};
