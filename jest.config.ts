import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    roots: ['<rootDir>'],
    modulePaths: ['<rootDir>'],
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest'
    },
    collectCoverageFrom: [
        'src/modules/**/*.service.ts',
        'src/modules/**/*.controller.ts',
        '!**/node_modules/**'
    ],
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    coverageThreshold: {
        global: {
            branches: 30,
            functions: 50,
            lines: 50,
            statements: 50
        }
    },
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    coveragePathIgnorePatterns: [
        '<rootDir>/src/core/*',
        '<rootDir>/src/tests/*',
        '<rootDir>/src/modules/auth/firebase'
    ],
    coverageDirectory: '<rootDir>/coverage',
    maxWorkers: '50%',
    detectOpenHandles: true
};
export default config;
