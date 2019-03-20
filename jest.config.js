module.exports = {
    rootDir: './tests',
    testMatch: ['**/?(*.)+(test).ts?(x)'],
    automock: false,
    coverageDirectory: './coverage/',
    collectCoverage: true,
    testURL: 'http://localhost',
    modulePathIgnorePatterns: [
        'node_modules',
    ],
    collectCoverageFrom: [
        'utils/**.ts',
    ],
    setupFiles: [
        './setupJest.js',
    ],
};