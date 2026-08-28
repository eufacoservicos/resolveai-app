// Metro precisa enxergar a raiz do monorepo para resolver @eufaco/*
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Observa o workspace inteiro, senão mudanças em packages/ não recarregam
config.watchFolders = [workspaceRoot];

// Resolve primeiro no app, depois na raiz (onde o npm workspaces içou tudo)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Evita que o Metro suba a árvore sozinho e pegue cópias duplicadas de react
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
