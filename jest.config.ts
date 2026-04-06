import type { Config } from 'jest';

const sharedProjectConfig = (
    displayName: string,
    rootDir: string,
    testMatch: string[],
): NonNullable<Config['projects']>[number] => ({
    displayName,
    rootDir,
    testMatch,
    moduleFileExtensions: ['js', 'json', 'ts'],
    modulePathIgnorePatterns: ['<rootDir>/dist'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    transform: {
        '^.+\\.(t|j)s$': ['ts-jest', { useESM: true }],
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    extensionsToTreatAsEsm: ['.ts'],
    testEnvironment: 'node',
});

const config: Config = {
    projects: [
        sharedProjectConfig('api', 'apps/api', ['<rootDir>/src/**/*.spec.ts']),
        sharedProjectConfig('sdk', 'packages/sdk/js', [
            '<rootDir>/test/**/*.spec.ts',
        ]),
    ],
};

export default config;
