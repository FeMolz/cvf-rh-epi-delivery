/** @type {import('jest').Config} */
export default {
    testEnvironment: 'node',
    transform: {},
    testTimeout: 15000,
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    testPathIgnorePatterns: ['/node_modules/', 'integracao\\.test'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/**/*.test.js',
        '!src/shared/testes/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'json-summary'],
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100
        }
    }
};
