/**
 * Sandbox Events System
 *
 * iframe 내에서 발생하는 이벤트를 부모 창(MVPStar)으로 전달하는 시스템
 * 부모가 postMessage로 수신하여 처리
 *
 * 사용 예시:
 * emitNavigation({ path: "/dashboard" });
 * emitReactGrab({ content: "<div>...", path: "/page" });
 */

// 부모에게 보내는 이벤트 타입
export type SandboxEventType =
  | "navigation" // URL 변경
  | "ready" // 앱 준비 완료
  | "error" // 에러 발생
  | "action" // 사용자 액션
  | "react-grab"; // react-grab으로 요소 선택

// 부모로부터 받는 명령 타입
export type ParentCommandType =
  | "navigate-back" // 뒤로 가기
  | "navigate-forward" // 앞으로 가기
  | "navigate-to" // 특정 경로로 이동
  | "refresh"; // 새로고침

// 이벤트 페이로드 타입 정의
export interface SandboxEventPayloads {
  navigation: {
    path: string;
    search?: string;
    hash?: string;
  };
  ready: {
    path: string;
  };
  error: {
    message: string;
    code?: string;
  };
  action: {
    name: string;
    data?: unknown;
  };
  "react-grab": {
    content: string; // 선택된 요소의 HTML
    elementTag?: string; // 요소 태그명
    path: string; // 현재 페이지 경로
    position?: { x: number; y: number }; // 선택된 요소의 위치
    prompt?: string; // 사용자 입력 프롬프트 (agent mode)
  };
}

export interface ParentMessage<T extends SandboxEventType = SandboxEventType> {
  source: "mvpstar-sandbox";
  type: T;
  payload: SandboxEventPayloads[T];
  timestamp: number;
}

export interface ParentCommand {
  source: "mvpstar-parent";
  type: ParentCommandType;
  payload?: Record<string, unknown>;
  timestamp: number;
}

/**
 * 부모 창으로 이벤트 전송
 */
function emit<T extends SandboxEventType>(
  type: T,
  payload: SandboxEventPayloads[T]
): void {
  if (typeof window === "undefined") return;
  if (window.parent === window) return; // iframe이 아닌 경우

  const message: ParentMessage<T> = {
    source: "mvpstar-sandbox",
    type,
    payload,
    timestamp: Date.now(),
  };

  window.parent.postMessage(message, "*");
}

// 이벤트 발행 함수들
export const emitNavigation = (
  payload: SandboxEventPayloads["navigation"]
): void => emit("navigation", payload);

export const emitReady = (payload: SandboxEventPayloads["ready"]): void =>
  emit("ready", payload);

export const emitError = (payload: SandboxEventPayloads["error"]): void =>
  emit("error", payload);

export const emitAction = (payload: SandboxEventPayloads["action"]): void =>
  emit("action", payload);

export const emitReactGrab = (
  payload: SandboxEventPayloads["react-grab"]
): void => emit("react-grab", payload);
