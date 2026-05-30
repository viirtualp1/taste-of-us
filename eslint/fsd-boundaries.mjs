import boundaries from 'eslint-plugin-boundaries'

const fsdLayers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared']

function allowLayers(...layers) {
  return layers.map((type) => ({ to: { type } }))
}

export default {
  plugins: {
    boundaries,
  },
  settings: {
    'boundaries/include': ['src/**/*'],
    'boundaries/dependency-nodes': ['import'],
    'boundaries/elements': [
      { type: 'app', pattern: 'app', mode: 'folder' },
      { type: 'pages', pattern: 'pages/*', mode: 'folder' },
      { type: 'widgets', pattern: 'widgets/*', mode: 'folder' },
      { type: 'features', pattern: 'features/*/*', mode: 'folder' },
      { type: 'entities', pattern: 'entities/*', mode: 'folder' },
      { type: 'shared', pattern: 'shared/*', mode: 'folder' },
    ],
  },
  rules: {
    'boundaries/dependencies': [
      'error',
      {
        default: 'disallow',
        rules: [
          { from: { type: 'app' }, allow: allowLayers(...fsdLayers) },
          {
            from: { type: 'pages' },
            allow: allowLayers('widgets', 'features', 'entities', 'shared'),
          },
          {
            from: { type: 'widgets' },
            allow: allowLayers('features', 'entities', 'shared'),
          },
          {
            from: { type: 'features' },
            allow: allowLayers('entities', 'shared'),
          },
          {
            from: { type: 'entities' },
            allow: allowLayers('shared'),
          },
          { from: { type: 'shared' }, allow: [] },
        ],
      },
    ],
  },
}
