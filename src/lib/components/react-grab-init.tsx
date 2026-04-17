"use client";

import { useEffect, useRef } from "react";
import { emitReactGrab } from "@/lib/utils/sandbox-events";

/**
 * React Grab Initializer
 *
 * MVPStar Editorial Style Theme
 * - Primary Red: #dc2626
 * - Wine: #881337
 * - Stone-900: #1c1917
 */

export function ReactGrabInit() {
  const lastMousePositionRef = useRef<{ x: number; y: number } | null>(null);

  // 마우스 위치 트래킹
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      lastMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const initReactGrab = async () => {
      try {
        const { init } = await import("react-grab/core");

        // 기본 색상: rgb(210, 57, 192) ≈ HSL(307°)
        // 빨간색 #dc2626 ≈ HSL(0°)
        // hue-rotate: 307° → 0° = 53°
        init({
          theme: {
            hue: 53,
          },

          onCopySuccess: (elements, content) => {
            const element = elements?.[elements.length - 1];

            // 저장된 마우스 위치 우선 사용, 없으면 요소 중심 하단으로 fallback
            let position: { x: number; y: number } | undefined =
              lastMousePositionRef.current ?? undefined;
            if (!position) {
              const rect = element?.getBoundingClientRect?.();
              position = rect
                ? { x: rect.left + rect.width / 2, y: rect.bottom }
                : undefined;
            }

            // 부모 창으로 react-grab 이벤트 전송
            emitReactGrab({
              content,
              elementTag: element?.tagName?.toLowerCase(),
              path: window.location.pathname,
              position,
            });

            // 사용 후 초기화
            lastMousePositionRef.current = null;
          },
        });
      } catch (error) {
        console.error("Failed to initialize react-grab:", error);
      }
    };

    initReactGrab();
  }, []);

  return null;
}
