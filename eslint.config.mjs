import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

/**
 * One config for the whole repo: the two React portals share browser globals,
 * the Express server and its scripts are CommonJS on Node, and the test suite
 * gets the Node test globals.
 */
export default [
  { ignores: ['**/dist/**', '**/node_modules/**'] },

  /* ── React portals ──────────────────────────────────────────── */
  {
    files: ['client/src/**/*.{js,jsx}', 'admin/src/**/*.{js,jsx}', 'telegram/src/**/*.{js,jsx}'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // Syncing a prop into state costs an extra render pass but is not a
      // defect. Flagged for cleanup rather than treated as a failure.
      'react-hooks/set-state-in-effect': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Unused args are common in handler signatures; flag variables only,
      // and allow the _-prefixed convention for deliberate discards.
      // caughtErrors: this bundler rejects bare `catch {}`, so an unused
      // binding is the only way to write one — do not flag those.
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none', varsIgnorePattern: '^_' }],
      'no-empty': ['warn', { allowEmptyCatch: true }],
    },
  },

  /* ── Express server + maintenance scripts ───────────────────── */
  {
    files: ['server/**/*.js', 'api/**/*.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
      // caughtErrors: this bundler rejects bare `catch {}`, so an unused
      // binding is the only way to write one — do not flag those.
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none', varsIgnorePattern: '^_' }],
      'no-empty': ['warn', { allowEmptyCatch: true }],
    },
  },

  /* ── Test suite ─────────────────────────────────────────────── */
  {
    files: ['tests/**/*.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      ...js.configs.recommended.rules,
      // caughtErrors: this bundler rejects bare `catch {}`, so an unused
      // binding is the only way to write one — do not flag those.
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none', varsIgnorePattern: '^_' }],
      'no-empty': ['warn', { allowEmptyCatch: true }],
    },
  },
];
