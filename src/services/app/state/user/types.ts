/**
 * User state types
 *
 * ## Server-Side User Initialization
 *
 * When user is logged in, you need to hydrate the client state from server.
 * This is done in the root layout structure:
 *
 * @example
 * // src/page/layout/root-layout/index.tsx (Server Component)
 * import { getUserSession } from '@/api/auth'
 * import { RootLayoutClient } from './client'
 *
 * export async function RootLayout({ children }) {
 *   const user = await getUserSession() // Get user from server
 *   return <RootLayoutClient user={user}>{children}</RootLayoutClient>
 * }
 *
 * @example
 * // src/page/layout/root-layout/client.tsx (Client Component)
 * 'use client'
 * import { StateProvider } from '@/lib/state'
 * import { useUser, type User } from '@/state/user'
 *
 * function UserInit({ user }: { user?: User | null }) {
 *   const init = useUser(s => s.actions.init)
 *   init(user) // No useEffect - runs during render for SSR hydration
 *   return null
 * }
 *
 * export function RootLayoutClient({ user, children }) {
 *   return (
 *     <StateProvider>
 *       <UserInit user={user} />
 *       {children}
 *     </StateProvider>
 *   )
 * }
 */

// Better-auth user type
export type User = {
  id: string
  email: string
  name: string
  username?: string | null
  displayUsername?: string | null
  image?: string | null
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * User state
 */
export type UserState = {
  /** Current logged-in user */
  me?: User | null | undefined
  /** Loading state */
  isLoading: boolean
}

/**
 * User actions
 */
export type UserActions = {
  /** Initialize user from SSR */
  init: (user?: User | null | undefined) => void
  /** Sign in with username and password */
  signIn: (args: {username: string, password: string}) => Promise<void>
  /** Sign up with email, username, name, and password */
  signUp: (args: {email: string, username: string, name: string, password: string}) => Promise<void>
  /** Sign out */
  signOut: () => Promise<void>
}

/**
 * Internal actions (for cross-domain dependencies)
 */
export type InternalUserActions = UserActions
