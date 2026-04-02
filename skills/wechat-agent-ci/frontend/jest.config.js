module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  collectCoverageFrom: [
    '*.js',
    '!node_modules/**'
  ]
};
