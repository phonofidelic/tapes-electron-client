module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  // testEnvironment: 'jest-environment-node-single-context',
  testRegex: ['src/db/__tests__'],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testTimeout: 15000,
};