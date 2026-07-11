import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },

  // Base: JS + TypeScript recommended rules for all source files.
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Allow intentionally-unused identifiers when prefixed with `_`
  // (e.g. destructuring to omit a property).
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },

  // Node-side code (CLI, server, core, shared).
  {
    files: ["src/{core,server,cli,shared}/**/*.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },

  // Browser/React code.
  {
    files: ["src/web/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },

  // Turn off ESLint rules that conflict with Prettier. Must come last.
  eslintConfigPrettier,
);
