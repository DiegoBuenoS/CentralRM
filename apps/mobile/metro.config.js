const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Keep SDK-compatible packages pinned to the mobile workspace versions.
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  expo: path.resolve(projectRoot, 'node_modules/expo'),
  'expo-asset': path.resolve(projectRoot, 'node_modules/expo-asset'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  '@central-rm/shared': path.resolve(workspaceRoot, 'packages/shared'),
  '@react-native/virtualized-lists': path.resolve(
    projectRoot,
    'node_modules/@react-native/virtualized-lists'
  ),
};

config.watchFolders = [
  ...(config.watchFolders || []),
  path.resolve(workspaceRoot, 'packages/shared'),
];

module.exports = config;
