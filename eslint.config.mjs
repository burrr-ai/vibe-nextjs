import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Custom ESLint rules
const customRules = require("./eslint-rules/index.cjs");

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      custom: customRules,
    },
    rules: {
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
      // Structure rules
      "custom/state-structure": "error",
      "custom/api-structure": "error",
      "custom/app-structure": "error",
      "custom/server-actions": "error",
      // Client/Server boundary rules
      "custom/page-use-client": "error",
      "custom/no-use-client-in-app": "error",
      // Import restriction rules
      "custom/no-direct-comwit-import": "error",
      "custom/client-component-no-api-import": "error",
      "custom/no-next-image": "error",
      "custom/no-anchor-tag": "error",
      "custom/index-only-import": "error",
      "custom/api-only-server-action": "error",
      // Naming convention rules
      "custom/kebab-case-filename": "warn",
      // Mock import restriction
      "custom/no-page-mock-import": "error",
      "custom/no-root-app-folder": "error",
      "custom/no-db-in-api": "error",
      "custom/server-only-import": "error",
      "custom/api-create-action": "error",
      "custom/api-action-error": "error",
      "custom/better-auth-required-options": "error",
    }
  }
];

export default eslintConfig;
