'use strict';

// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('eslint-config-etherpad/patch/modern-module-resolution');

module.exports = {
  root: true,
  ignorePatterns: [
    '/dist/',
  ],
  extends: 'etherpad/plugin',
  overrides: [
    {
      files: ['*.ts'],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: './tsconfig.json',
      },
    },
  ],
};
