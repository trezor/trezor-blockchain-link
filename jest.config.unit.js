module.exports = {
    rootDir: './',
    testMatch: ['**/tests/unit/*.js'],
    coverageDirectory: './coverage/',
    collectCoverage: true,
    collectCoverageFrom: ['**/src/**/*.js'],
    modulePathIgnorePatterns: ['node_modules', '_old', 'src/types', 'src/ui', 'src/utils/ws.js'],
    setupFiles: ['./tests/setup.js'],
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
};