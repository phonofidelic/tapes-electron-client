module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/src/__e2e__/index.test.ts'],
  setupFiles: ['<rootDir>/src/setupTests.ts'],
};
