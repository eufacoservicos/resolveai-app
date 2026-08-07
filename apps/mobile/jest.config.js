// src/lib/supabase.ts lanca se as envs faltarem, e o babel-preset-expo inlineia
// process.env.EXPO_PUBLIC_* na transformacao — por isso os defaults ficam aqui,
// avaliados antes dos workers do Jest, e nao em jest.setup.js.
process.env.EXPO_PUBLIC_SUPABASE_URL ||= "https://test.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||= "test-anon-key";

module.exports = {
  preset: "jest-expo",
  setupFiles: ["<rootDir>/jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!(?:\\.pnpm/)?(?:@?)((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@sentry/.*|lucide-react-native|nativewind|@resolveai/.*|sonner-native))",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // O transformer de SVG e do Metro; no Jest o import vira um stub.
    "\\.svg$": "<rootDir>/jest.mocks/svg.js",
  },
  testMatch: ["**/__tests__/**/*.test.(ts|tsx|js|jsx)"],
};
