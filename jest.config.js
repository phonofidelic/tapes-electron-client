require('dotenv').config();

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/src/__e2e__/index.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  globals: {
    USER_API_KEY: process.env.USER_API_KEY,
  },
};
