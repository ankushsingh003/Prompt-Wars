export default {
  testEnvironment: 'jsdom',
  transform: {},
  extensionsToTreatAsEsm: ['.js', '.jsx'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/tests/__mocks__/fileMock.js',
    '\\.(jpg|jpeg|png|gif|svg|ico)$': '<rootDir>/src/tests/__mocks__/fileMock.js',
  },
  setupFilesAfterFramework: ['@testing-library/jest-dom'],
};
