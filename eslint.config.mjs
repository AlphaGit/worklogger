// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

const tsLintConfig = tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict
);

export default tsLintConfig;