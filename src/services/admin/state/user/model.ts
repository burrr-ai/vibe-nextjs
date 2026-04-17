import { model } from 'comwit'
import type { UserState } from './types'

export const user = model<UserState>({
  me: undefined,
  isLoading: false,
})
