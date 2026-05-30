// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import fsdBoundaries from './eslint/fsd-boundaries.mjs'

export default withNuxt(fsdBoundaries, {
  rules: {
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
    '@typescript-eslint/no-explicit-any': 'off',
    'vue/html-self-closing': 'off',
    'vue/script-indent': [
      'error',
      2,
      {
        baseIndent: 0,
        switchCase: 1,
      },
    ],
    indent: 'off',
  },
})
