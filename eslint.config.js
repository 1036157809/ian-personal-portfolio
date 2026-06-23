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
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
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
    },
  },

  // 前端源文件：浏览器环境
  {
    files: ['apps/frontend/src/**/*.ts', 'apps/frontend/src/**/*.vue'],
    languageOptions: {
      globals: globals.browser,
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
];
