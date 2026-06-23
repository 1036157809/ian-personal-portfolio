import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import vuePlugin from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // 全局忽略目录
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/.codex/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/public/**',
      '**/vite.config.ts.timestamp-*',
      '**/dist-ssr/**',
      '**/*.sh',
      'apps/*/*.sh',
      // 排除所有测试文件
      '**/tests/**',
      '**/__tests__/**',
      '**/*.test.ts',
      '**/*.spec.ts',
    ],
  },

  // 基础推荐规则（JS）
  js.configs.recommended,

  // TypeScript 推荐规则（仅 src/）
  {
    files: [
      'apps/frontend/src/**/*.ts',
      'apps/frontend/src/**/*.tsx',
      'apps/backend/src/**/*.ts',
    ],
    plugins: {
      '@typescript-eslint': ts,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    rules: {
      ...ts.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' }],
    },
  },

  // Vue 文件配置（仅 src/）
  {
    files: ['apps/frontend/src/**/*.vue'],
    plugins: {
      vue: vuePlugin,
    },
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    rules: {
      ...vuePlugin.configs['vue3-recommended'].rules,
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',
    },
  },

  // 前端源文件：浏览器环境
  {
    files: ['apps/frontend/src/**/*.ts', 'apps/frontend/src/**/*.vue'],
    languageOptions: {
      globals: {
        ...globals.browser,
        RequestInit: 'readonly',
      },
    },
  },

  // 后端源文件：Node.js 环境
  {
    files: ['apps/backend/src/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },

  // 全局通用规则（仅 src/ 下的 JS/TS/Vue）
  {
    files: [
      'apps/*/src/**/*.js',
      'apps/*/src/**/*.ts',
      'apps/*/src/**/*.vue',
    ],
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off', // use @typescript-eslint/no-unused-vars instead
    },
  },

  // 针对 backend 子包覆盖（允许 console）
  {
    files: ['apps/backend/src/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },

  // 禁用与 Prettier 冲突的规则
  prettierConfig,

  // Node.js 脚本：构建配置、E2E 测试、SSR 服务
  {
    files: [
      'apps/frontend/*.cjs',
      'apps/frontend/spa-server.*',
      'apps/frontend/playwright.config.*',
      'apps/frontend/run-e2e.*',
      'apps/frontend/scripts/**',
    ],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'off',
    },
  },
];
