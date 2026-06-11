module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    jest: true
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-param-reassign': ['error', { props: false }],
    'comma-dangle': ['error', 'never'],
    'consistent-return': 'off',
    'no-underscore-dangle': 'off',
    'max-len': ['error', { code: 100, ignoreComments: true }],
    'linebreak-style': 'off',
    'prefer-destructuring': 'warn',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }]
  }
};