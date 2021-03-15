module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: ['src/__e2e__/index.test.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  testTimeout: 15000,
};
