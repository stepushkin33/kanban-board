import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      'fsd/import-locality': 'error',
      // The single-page app keeps its board and user actions as separate slices.
      'fsd/insignificant-slice': 'off',
    },
  },
])
