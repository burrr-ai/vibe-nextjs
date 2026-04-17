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

export type UserState = {
  me?: User | null | undefined
  isLoading: boolean
}

export type UserActions = {
  init(user?: User | null | undefined): void
  signIn(args: { username: string; password: string }): Promise<void>
  signUp(args: { email: string; username: string; name: string; password: string }): Promise<void>
  signOut(): Promise<void>
}
