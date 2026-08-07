// Jest global setup for @resolveai/mobile.
// @testing-library/react-native v13+ ships jest matchers by default,
// so no explicit @testing-library/jest-native/extend-expect import is
// needed here. Add mocks or global stubs below as the app grows.

// As envs EXPO_PUBLIC_* sao definidas em jest.config.js: o babel-preset-expo
// as inlineia na transformacao, que acontece antes deste arquivo rodar.

// AsyncStorage e um modulo nativo: sem mock, qualquer arvore que importe o
// client Supabase quebra no Jest.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// expo-location tambem depende de modulo nativo (usado pelo LocationProvider).
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: "denied" })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: { latitude: 0, longitude: 0 },
  })),
  Accuracy: { Balanced: 3 },
}));
