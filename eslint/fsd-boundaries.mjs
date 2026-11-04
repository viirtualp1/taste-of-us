import boundaries from 'eslint-plugin-boundaries'

const fsdLayers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared']

const layer = (type) => ({ element: { type } })

function allowLayers(...layers) {
  return layers.map((type) => ({ to: layer(type) }))
}

export default {
  plugins: {
    boundaries,
  },
  settings: {
    'boundaries/include': ['src/**/*'],
    'boundaries/dependency-nodes': ['import'],
    // Without a resolver every import target is "unknown" and no policy can match.
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './src/tsconfig.json',
        extensions: ['.ts', '.tsx', '.js', '.mjs', '.vue'],
      },
    },
    // Folder matching is the default in eslint-plugin-boundaries v7.
    'boundaries/elements': [
      { type: 'app', pattern: 'app' },
      { type: 'pages', pattern: 'pages/*' },
      { type: 'widgets', pattern: 'widgets/*' },
      { type: 'features', pattern: 'features/*/*' },
      { type: 'entities', pattern: 'entities/*' },
      { type: 'shared', pattern: 'shared/*' },
    ],
  },
  rules: {
    'boundaries/dependencies': [
      'error',
      {
        default: 'disallow',
        policies: [
          { from: layer('app'), allow: allowLayers(...fsdLayers) },
          {
            from: layer('pages'),
            allow: allowLayers('widgets', 'features', 'entities', 'shared'),
          },
          {
            from: layer('widgets'),
            allow: allowLayers('features', 'entities', 'shared'),
          },
          {
            from: layer('features'),
            allow: allowLayers('entities', 'shared'),
          },
          {
            from: layer('entities'),
            allow: allowLayers('shared'),
          },
          { from: layer('shared'), allow: allowLayers('shared') },
        ],
      },
    ],
  },
}
