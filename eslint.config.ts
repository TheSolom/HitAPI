import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import type { ESLint, Linter } from 'eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Rules shared by every TS environment (backend + React). Kept in one place
// so the two blocks below can't quietly drift apart.
const sharedTsRules: Linter.RulesRecord = {
    '@typescript-eslint/no-explicit-any': 'off',

    '@typescript-eslint/no-unused-vars': [
        'warn',
        {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
            ignoreRestSiblings: true,
        },
    ],

    '@typescript-eslint/no-extraneous-class': [
        'error',
        {
            allowWithDecorator: true,
        },
    ],

    '@typescript-eslint/require-await': 'warn',
};


// eslint-plugin-react-hooks (7.0.x / 7.1.x) ships a `configs.flat` shape that
// doesn't satisfy ESLint's `Plugin` type, so TS rejects it under `plugins`.
// This is an upstream typings bug (facebook/react#35045), not a config
// mistake — the plugin works correctly at runtime, only its .d.ts is wrong.
// Safe to cast; remove this once the package ships a fix.
const reactHooksPlugin = reactHooks as unknown as ESLint.Plugin;

export default defineConfig([
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/coverage/**',
            '**/.turbo/**',
            '**/.next/**',
            '**/logs/**',
        ],
    },

    {
        linterOptions: {
            reportUnusedDisableDirectives: 'warn',
        },
    },

    eslint.configs.recommended,

    ...tseslint.configs.strictTypeChecked,

    //
    // Backend
    //
    {
        files: ['**/*.{ts,mts,cts}'],
        ignores: ['apps/web/**'],

        languageOptions: {
            sourceType: 'module',

            globals: globals.node,

            parserOptions: {
                ecmaVersion: 'latest',
                projectService: true,
                tsconfigRootDir: __dirname,
            },
        },

        rules: sharedTsRules,
    },

    //
    // Web / React / Configs
    //
    {
        files: ['apps/web/**/*.{js,jsx,mjs,cjs,ts,tsx}'],

        languageOptions: {
            sourceType: 'module',

            globals: {
                ...globals.browser,
                ...globals.node,
            },

            parserOptions: {
                ecmaVersion: 'latest',
                projectService: true,
                tsconfigRootDir: __dirname,
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },

        plugins: {
            'react-hooks': reactHooksPlugin,
            'react-refresh': reactRefresh,
        },

        rules: {
            ...reactHooks.configs.recommended.rules,
            ...sharedTsRules,

            'react-refresh/only-export-components': [
                'warn',
                {
                    allowConstantExport: true,
                },
            ],
        },
    },

    //
    // Tests
    //
    {
        files: [
            '**/*.test.{ts,tsx}',
            '**/*.spec.{ts,tsx}',
            '**/__tests__/**/*.{ts,tsx}',
        ],

        languageOptions: {
            globals: globals.jest,
        },
    },

    //
    // Disable formatting rules
    //
    eslintConfigPrettier,
]);