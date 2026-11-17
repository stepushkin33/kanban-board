import eslint from '@eslint/js'
import prettier from 'eslint-config-prettier'
import boundaries from 'eslint-plugin-boundaries'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared']

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['*.mjs', 'scripts/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    ...reactHooks.configs['recommended-latest'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.json' } },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        ...['pages', 'widgets', 'features', 'entities'].map((type) => ({
          type,
          pattern: `src/${type}/*`,
        })),
        { type: 'shared', pattern: 'src/shared/*/*' },
      ],
      'boundaries/files': [{ pattern: 'tasks.json', category: 'task-fixture' }],
    },
    rules: {
      'boundaries/no-unknown-files': 'error',
      'boundaries/no-unknown-dependencies': 'error',
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            ...layers.map((layer, index) => ({
              from: { element: { type: layer } },
              allow: {
                to: {
                  element: {
                    types: layer === 'shared' ? ['shared'] : layers.slice(index + 1),
                    fileInternalPath: 'index.{ts,tsx}',
                  },
                },
              },
            })),
            {
              from: { element: { type: 'entities' } },
              allow: { to: { file: { categories: 'task-fixture' } } },
            },
          ],
        },
      ],
    },
  },
  { files: ['public/service-worker.js'], languageOptions: { globals: globals.serviceworker } },
  prettier,
)
