import {fileURLToPath} from 'node:url';

import etherpad from 'eslint-config-etherpad/flat/ts/plugin.js';

export default [
  {
    // Build output.
    ignores: ['dist/'],
  },
  ...etherpad,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)),
        project: './tsconfig.json',
      },
    },
  },
];
