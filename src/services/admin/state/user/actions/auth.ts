import { action, silent } from 'comwit'
import type { User, UserActions } from '../types'
import { user } from '../model'

type UserAuthActions = Pick<UserActions, 'init' | 'signIn' | 'signUp' | 'signOut'>

export const userAuthActions = action<UserAuthActions>(({ state }) => {
  class UserAuthActions {
    private model = state(user)

    init(user?: User | null | undefined): void {
      silent(() => {
        this.model.me = user
        this.model.isLoading = false
      })
    }

    async signIn({ username, password }: { username: string; password: string }): Promise<void> {
      this.model.isLoading = true
      try {
        const nextUser: User = {
          id: '1',
          email: `${username}@example.com`,
          name: 'Admin User',
          username,
          displayUsername: username,
          image: null,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        this.model.me = nextUser
      } finally {
        this.model.isLoading = false
      }
    }

    async signUp({ email, username, name, password }: { email: string; username: string; name: string; password: string }): Promise<void> {
      this.model.isLoading = true
      try {
        const nextUser: User = {
          id: '1',
          email,
          name,
          username,
          displayUsername: username,
          image: null,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        this.model.me = nextUser
      } finally {
        this.model.isLoading = false
      }
    }

    async signOut(): Promise<void> {
      this.model.isLoading = true
      try {
        this.model.me = null
      } finally {
        this.model.isLoading = false
      }
    }
  }

  return new UserAuthActions()
})
