const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Monorepo: let Metro see the workspace root
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
// NOTE: keep hierarchical lookup enabled. pnpm uses isolated node_modules, so
// packages under .pnpm/ resolve their own deps by walking up their own folder —
// disabling it breaks every transitive require (e.g. expo-router -> @react-navigation/native).

// @resolveai/shared ships subpath "exports" (e.g. "@resolveai/shared/cn"), which
// Metro only honours with package exports enabled (off by default on SDK 52).
config.resolver.unstable_enablePackageExports = true;

// SVG como componente (o logo vem do mesmo arquivo que o PWA usa). Por padrao o
// Metro trata .svg como asset de imagem; aqui ele passa a ser codigo, compilado
// para react-native-svg pelo svgr. O entry "/expo" delega os demais arquivos ao
// transformer do Expo — o padrao apontaria para o do React Native puro.
config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer/expo"
);
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

module.exports = withNativeWind(config, { input: "./global.css" });
