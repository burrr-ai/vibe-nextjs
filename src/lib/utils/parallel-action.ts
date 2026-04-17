/**
 * Server Action 병렬 실행 유틸리티
 * @see https://github.com/icflorescu/next-server-actions-parallel
 */
export function createParallelAction<T, U extends unknown[]>(action: (...args: U) => Promise<T>) {
  return async (...args: U) => [action(...args)] as const;
}

export async function runParallelAction<T>(result: Promise<readonly [Promise<T>]>) {
  return (await result)[0];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParallelActionFn = (...args: any[]) => Promise<readonly [Promise<any>]>

type ResolvedActions<T extends Record<string, ParallelActionFn>> = {
  [K in keyof T]: T[K] extends (...args: infer A) => Promise<readonly [Promise<infer R>]>
    ? (...args: A) => Promise<R>
    : never
}

export function resolveActions<T extends Record<string, ParallelActionFn>>(
  actions: T
): ResolvedActions<T> {
  const resolved = {} as Record<string, unknown>
  for (const key in actions) {
    const action = actions[key]
    resolved[key] = (...args: unknown[]) => runParallelAction(action(...args))
  }
  return resolved as ResolvedActions<T>
}

