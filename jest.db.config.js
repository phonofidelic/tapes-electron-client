module.exports = {
  preset: 'ts-jest',
  // testEnvironment: 'node',
  testEnvironment: 'jest-environment-node-single-context',
  testRegex: ['src/db/__tests__'],
  testPathIgnorePatterns: ['/node_modules/'],
  testTimeout: 15000,
};