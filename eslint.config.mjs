// ============================================================
// ESLint 扁平配置（ESLint 10 / flat config）
// ------------------------------------------------------------
// 分工：ESLint 只负责「可能出错的地方」（未定义变量、无效的 Vue 用法、
// 可疑的 TS 写法），排版一律交给 Prettier——两者职责重叠的规则由
// eslint-config-prettier 关掉，避免 eslint --fix 与 prettier --write
// 互相打架、来回抖动。
//
// 为什么不装 @nuxt/eslint：它会连带引入 @stylistic 一整套排版规则，
// 与 Prettier 冲突，且要求在 nuxt.config 里注册模块、改构建期行为。
// 这里只需要 Nuxt 目录约定，不需要那套格式规则。
// ============================================================
import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import prettier from 'eslint-config-prettier/flat';

export default tseslint.config(
  {
    // 构建产物与缓存（与 .gitignore / .prettierignore 保持一致）
    ignores: [
      '**/node_modules/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/.data/**',
      '**/.nitro/**',
      '**/.cache/**',
      '**/dist/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  {
    // 运行时全局：浏览器 API + 构建脚本（build/*.ts、server/*）用到的 Node API
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        // SFC 的 <script setup lang="ts"> 交给 TS 解析器，否则类型语法直接报错
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      // Nuxt 自动导入 + TS 已有 undefined 检查，no-undef 在 .vue 里只会误报
      'no-undef': 'off',
    },
  },

  {
    rules: {
      // 路由即文件（pages/index.vue、pages/posts/[slug].vue），文件名由约定决定
      'vue/multi-word-component-names': 'off',
      // defineProps 的类型声明已经表达默认值，这条规则只对 Options API 有意义
      'vue/require-default-prop': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
    },
  },

  prettier,

  {
    // 硬约束：语句结束必须写分号。
    // 放在 prettier 之后，否则会被 eslint-config-prettier 关掉；
    // 这里与 .prettierrc.json 的 "semi": true 方向一致，两个工具不会打架，
    // 只是把「漏分号」从格式问题升级成 lint 错误 —— 手写/粘贴代码时不写分号
    // 会直接红，不必等到 format:check 才发现。
    plugins: { '@stylistic': stylistic },
    rules: {
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/no-extra-semi': 'error',
    },
  },
);
