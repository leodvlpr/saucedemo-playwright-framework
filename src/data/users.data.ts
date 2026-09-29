import { env } from '../config/env';

export interface UserCredentials {
  readonly username: string;
  readonly password: string;
}

/**
 * Accounts under test. Usernames and the shared password come from the
 * environment (see `src/config/env.ts`), never from a literal in the repo.
 *
 * `password` is a getter so the required-variable check fires when a test
 * actually uses a credential, rather than at import time for suites that don't.
 */
function account(username: string): UserCredentials {
  return {
    username,
    get password(): string {
      return env.password;
    },
  };
}

export const USERS = {
  standard: account(env.users.standard),
  lockedOut: account(env.users.lockedOut),
  problem: account(env.users.problem),
  performanceGlitch: account(env.users.performanceGlitch),
  error: account(env.users.error),
  visual: account(env.users.visual),
} as const satisfies Record<string, UserCredentials>;

export type UserKey = keyof typeof USERS;

/** Error banners shown by the login form, verified against the live site. */
export const LOGIN_ERRORS = {
  lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
  invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
  usernameRequired: 'Epic sadface: Username is required',
  passwordRequired: 'Epic sadface: Password is required',
} as const;
