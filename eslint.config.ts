import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import type { ESLint, Linter } from 'eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import sonarjs from 'eslint-plugin-sonarjs';
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

    // SonarJS shared rule adjustments
    'sonarjs/redundant-type-aliases': 'off',
    'sonarjs/cognitive-complexity': ['error', 35],
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

    sonarjs.configs.recommended,

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

        rules: {
            ...sharedTsRules,
            '@typescript-eslint/no-misused-spread': 'off',
        },
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
    // Shadcn / Generated UI Components Override
    //
    {
        files: ['apps/web/src/components/ui/**/*.{ts,tsx}'],
        rules: {
            '@typescript-eslint/no-deprecated': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-unnecessary-condition': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            'react-refresh/only-export-components': 'off',
            'react-hooks/purity': 'off',
            'react-hooks/set-state-in-effect': 'off',
            'sonarjs/deprecation': 'off',
            'sonarjs/prefer-read-only-props': 'off',
            'sonarjs/no-redundant-optional': 'off',
            'sonarjs/pseudo-random': 'off',
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

        rules: {
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-extraneous-class': 'off',
            '@typescript-eslint/require-await': 'off',
            'sonarjs/no-hardcoded-passwords': 'off',
            'sonarjs/no-hardcoded-ip': 'off',
            'sonarjs/function-return-type': 'off',
        },
    },

    //
    // SDK Overrides (non-security internal hashing and parsing utils)
    //
    {
        files: ['packages/sdk/js/**/*.{ts,mts,cts}'],
        rules: {
            'sonarjs/hashing': 'off',
            'sonarjs/pseudo-random': 'off',
            'sonarjs/regex-complexity': 'off',
            'sonarjs/super-linear-regex': 'off',
            'sonarjs/public-static-readonly': 'off',
            'sonarjs/function-return-type': 'off',
        },
    },

    //
    // Disable formatting rules
    //
    eslintConfigPrettier,
]);