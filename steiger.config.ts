import { defineConfig } from 'steiger'
import fsd from '@feature-sliced/steiger-plugin'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    files: ['./app/**'],
    rules: {
      'fsd/forbidden-imports': 'off',
      'fsd/public-api': 'off',
      'fsd/no-reserved-folder-names': 'off',
    },
  },
])
