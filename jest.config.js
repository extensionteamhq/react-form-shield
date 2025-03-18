module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    testEnvironmentOptions: {
        customExportConditions: ["node", "node-addons"],
    },
    setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
    coverageDirectory: "coverage",
    collectCoverageFrom: [
        "src/**/*.{ts,tsx}",
        "!src/**/*.d.ts",
        "!src/**/index.{ts,tsx}",
        "!src/**/*.stories.{ts,tsx}",
    ],
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                tsconfig: "tsconfig.json",
            },
        ],
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
