import "server-only";

/**
 * Server-side configuration
 *
 * Store sensitive values here (API keys, secrets, etc.)
 * This file is protected by 'server-only' - it cannot be imported in client components.
 *
 * Usage:
 * import { config } from '@/server/config';
 * const apiKey = config.SOME_API_KEY;
 */

export const config = {
  // Add your sensitive environment variables here
  // Example:
  // OPENAI_API_KEY: "sk-xxx...",
  // DATABASE_SECRET: "xxx...",
} as const;
