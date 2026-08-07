import type { Config } from 'jest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sharedProjectConfig = (
    displayName: string,
    relativeDir: string,
    testMatch: string[],
): NonNullable<Config['projects']>[number] => ({
    displayName,
    rootDir: path.resolve(__dirname, relativeDir),
    testMatch,
    moduleFileExtensions: ['js', 'json', 'ts'],
    modulePathIgnorePatterns: ['<rootDir>/dist'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    transform: {
        '^.+\\.(t|j)s$': [
            'ts-jest',
            { useESM: true, tsconfig: path.resolve(__dirname, relativeDir, 'tsconfig.test.json') },
        ],
    },
    moduleNameMapper: {
        '^@hitapi/shared/enums$': path.resolve(__dirname, 'packages/shared/src/enums/index.ts'),
        '^@hitapi/shared/utils$': path.resolve(__dirname, 'packages/shared/src/utils/index.ts'),
        '^@hitapi/shared/(.*)$': path.resolve(__dirname, 'packages/shared/src/$1'),
        '^@hitapi/shared$': path.resolve(__dirname, 'packages/shared/src/index.ts'),
        '^@hitapi/types/(.*)$': path.resolve(__dirname, 'packages/types/src/$1'),
        '^@hitapi/types$': path.resolve(__dirname, 'packages/types/src/index.ts'),
        '^@hitapi/js/(.*)$': path.resolve(__dirname, 'packages/sdk/js/src/$1'),
        '^@hitapi/js$': path.resolve(__dirname, 'packages/sdk/js/src/index.ts'),
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
