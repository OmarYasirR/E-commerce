module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/app.js',
    '!src/config/**',
    '!src/tests/**',
    '!src/docs/**',
    '!src/templates/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/unit/**/*.js',
    '**/tests/integration/**/*.js'
  ],
  setupFilesAfterEnv: ['./src/tests/setup.js'],
  testTimeout: 10000
};