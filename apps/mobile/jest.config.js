module.exports = {
  preset: "jest-expo",
  setupFiles: ["<rootDir>/jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!(?:\\.pnpm/)?(?:@?)((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@sentry/.*|lucide-react-native|nativewind|@resolveai/.*|sonner-native))",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^react-native-worklets/plugin$": "<rootDir>/jest.mocks/worklets-plugin.js",
  },
  testMatch: ["**/__tests__/**/*.test.(ts|tsx|js|jsx)"],
};
