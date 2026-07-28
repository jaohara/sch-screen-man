import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['public/**'] },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
  },
  js.configs.recommended,
];
