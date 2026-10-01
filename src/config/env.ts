import * as path from 'node:path';
import * as dotenv from 'dotenv';

/**
 * Single place where the process environment is read.
 *
 * Loaded from `.env` at the repo root, which is git-ignored. `override: false`
 * (the dotenv default) means real environment variables win over the file, so CI
 * injects the same names from its own secret store and never ships a `.env`.
 *
 * Nothing else in the framework should touch `process.env` — import `env` instead,
 * so a missing or malformed variable fails once, loudly, with a useful message.
 */
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
  quiet: true,
});

/** A variable with no safe default. Missing it is a hard failure, never a fallback. */
function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}.\n` +
        'Copy .env.example to .env and fill in the values (see CLAUDE.md > Environment).',
    );
  }
  return value;
}

/** Non-secret configuration that has a sensible default. */
function optional(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

export const env = {
  baseURL: optional('BASE_URL', 'https://www.saucedemo.com'),

  /**
   * Usernames are not secrets (SauceDemo lists them on its login page), so they
   * carry defaults. The password has none on purpose: a hardcoded fallback for a
   * credential is the bug this file exists to prevent.
   */
  users: {
    standard: optional('STANDARD_USERNAME', 'standard_user'),
    lockedOut: optional('LOCKED_OUT_USERNAME', 'locked_out_user'),
    problem: optional('PROBLEM_USERNAME', 'problem_user'),
    performanceGlitch: optional('PERFORMANCE_GLITCH_USERNAME', 'performance_glitch_user'),
    error: optional('ERROR_USERNAME', 'error_user'),
    visual: optional('VISUAL_USERNAME', 'visual_user'),
  },

  get password(): string {
    return required('USER_PASSWORD');
  },
} as const;
