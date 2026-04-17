import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Noto_Sans_KR, Noto_Sans_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { RootLayout } from "@/lib/layout";
import { ReactGrabInit } from "@/lib/components/react-grab-init";
import { SandboxBridge } from "@/lib/components/sandbox-bridge";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
});

const notoSansMono = Noto_Sans_Mono({
  variable: "--font-noto-sans-mono",
  subsets: ["latin"],
});

// Disable prerendering for all pages
export const dynamic = "force-dynamic";

// Set maximum execution time for server actions and routes (5 minutes)
export const maxDuration = 300;

// Viewport settings - prevent zoom on mobile input focus
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

/**
 * SEO & Open Graph Metadata
 *
 * TODO: Customize these values for your service
 * 아래 값들을 귀하의 서비스에 맞게 수정하세요
 *
 * metadataBase는 헤더에서 hostname을 가져와 동적으로 설정됩니다
 */
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get("host") || "localhost:3000";
  const protocol = "https";

  return {
    metadataBase: new URL(`${protocol}://${hostname}`),

    title: {
      default: "MVPStar Template",
      template: "%s | MVPStar Template", // Page titles will be "Page Title | MVPStar Template"
    },
    description:
      "MVPStar에서 제작한 빠른 MVP 개발 템플릿입니다. Next.js 15 기반으로 구축되어 아이디어를 신속하게 실현할 수 있습니다.",

    // Open Graph metadata for social sharing
    openGraph: {
      type: "website",
      locale: "ko_KR",
      title: "MVPStar Template",
      description:
        "MVPStar에서 제작한 빠른 MVP 개발 템플릿입니다. Next.js 15 기반으로 구축되어 아이디어를 신속하게 실현할 수 있습니다.",
      siteName: "MVPStar Template",
      images: [
        {
          url: "/og.png", // 상대 경로 사용 - metadataBase가 절대 URL로 변환
          width: 1200,
          height: 630,
          alt: "MVPStar Template",
        },
      ],
    },

    // Twitter Card metadata
    twitter: {
      card: "summary_large_image",
      title: "MVPStar Template",
      description:
        "MVPStar에서 제작한 빠른 MVP 개발 템플릿입니다. Next.js 15 기반으로 구축되어 아이디어를 신속하게 실현할 수 있습니다.",
      images: ["/og.png"], // 상대 경로 사용
    },

    // Additional metadata
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pretendard.variable} ${notoSansKr.variable} ${notoSansMono.variable} antialiased`}
      >
        <RootLayout>{children}</RootLayout>
        <ReactGrabInit />
        <SandboxBridge />
      </body>
    </html>
  );
}
