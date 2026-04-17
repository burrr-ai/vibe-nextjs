"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  emitNavigation,
  emitReady,
  type ParentCommand,
} from "@/lib/utils/sandbox-events";

/**
 * Sandbox Bridge
 *
 * iframe 내에서 부모 창(MVPStar)과 통신하는 브릿지 컴포넌트
 *
 * 역할:
 * 1. 내비게이션 이벤트 발행 (pushState, popstate 감지)
 * 2. 부모로부터 오는 명령 수신 및 처리
 * 3. 앱 준비 완료 알림
 */

export function SandboxBridge() {
  const router = useRouter();

  // 현재 경로 이벤트 발행
  const emitCurrentNavigation = useCallback(() => {
    emitNavigation({
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    });
  }, []);

  // 부모로부터 오는 명령 처리
  const handleParentCommand = useCallback(
    (event: MessageEvent) => {
      // mvpstar-parent에서 온 메시지만 처리
      if (event.data?.source !== "mvpstar-parent") return;

      const { type, payload } = event.data as ParentCommand;

      switch (type) {
        case "navigate-back":
          router.back();
          break;
        case "navigate-forward":
          router.forward();
          break;
        case "navigate-to":
          if (payload?.path && typeof payload.path === "string") {
            router.push(payload.path);
          }
          break;
        case "refresh":
          router.refresh();
          break;
      }
    },
    [router]
  );

  useEffect(() => {
    // iframe이 아닌 경우 실행하지 않음
    if (window.parent === window) return;

    // 부모로부터 오는 명령 수신 (subscribe)
    window.addEventListener("message", handleParentCommand);

    // 앱 준비 완료 알림
    emitReady({ path: window.location.pathname });

    // 초기 네비게이션 발행
    emitCurrentNavigation();

    // popstate 이벤트 (뒤로가기/앞으로가기)
    const handlePopState = () => {
      emitCurrentNavigation();
    };
    window.addEventListener("popstate", handlePopState);

    // pushState/replaceState 감지 (Next.js App Router 등)
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = function (...args) {
      originalPushState(...args);
      // 약간의 지연 후 발행 (Next.js가 URL 업데이트 완료 후)
      setTimeout(emitCurrentNavigation, 0);
    };

    history.replaceState = function (...args) {
      originalReplaceState(...args);
      setTimeout(emitCurrentNavigation, 0);
    };

    return () => {
      window.removeEventListener("message", handleParentCommand);
      window.removeEventListener("popstate", handlePopState);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [emitCurrentNavigation, handleParentCommand]);

  return null;
}

