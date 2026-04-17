import { action, silent } from "comwit";
import type { User, UserActions } from "../types";
import { user } from "../model";

type UserAuthActions = Pick<
  UserActions,
  "init" | "signIn" | "signUp" | "signOut"
>;

export const userAuthActions = action<UserAuthActions>(({ state }) => {
  class UserAuthActions {
    private model = state(user);

    /**
     * Initialize user from SSR
     * Use silent() to prevent re-render on initial load
     */
    init(user?: User | null | undefined): void {
      silent(() => {
        this.model.me = user;
        this.model.isLoading = false;
      });
    }

    /**
     * Sign in with username and password
     * TODO: Replace with actual API call
     * TODO: Connect with auth API client and persist session token
     */
    async signIn({
      username,
      password,
    }: {
      username: string;
      password: string;
    }): Promise<void> {
      this.model.isLoading = true;

      try {
        // TODO: const { error, user } = await authClient.signIn({ username, password })
        const nextUser: User = {
          id: "1",
          email: `${username}@example.com`,
          name: "Mock User",
          username,
          displayUsername: username,
          image: null,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.model.me = nextUser;
      } finally {
        this.model.isLoading = false;
      }
    }

    /**
     * Sign up with email, username, name, and password
     * TODO: Replace with actual API call
     * TODO: Fetch user profile immediately after signup
     */
    async signUp({
      email,
      username,
      name,
      password,
    }: {
      email: string;
      username: string;
      name: string;
      password: string;
    }): Promise<void> {
      this.model.isLoading = true;

      try {
        // TODO: const { error, user } = await authClient.signUp({ email, username, name, password })
        const nextUser: User = {
          id: "1",
          email,
          name,
          username,
          displayUsername: username,
          image: null,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.model.me = nextUser;
      } finally {
        this.model.isLoading = false;
      }
    }

    /**
     * Sign out current user
     * TODO: Replace with actual API call
     */
    async signOut(): Promise<void> {
      this.model.isLoading = true;

      try {
        // TODO: await authClient.signOut()
        this.model.me = null;
      } finally {
        this.model.isLoading = false;
      }
    }
  }

  return new UserAuthActions();
});
