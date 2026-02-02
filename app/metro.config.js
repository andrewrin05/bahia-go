const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Workaround for resolution error with @expo/metro-runtime/rsc/runtime on Windows
config.resolver = config.resolver || {};
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@expo/metro-runtime/rsc/runtime': path.resolve(projectRoot, 'node_modules/@expo/metro-runtime/rsc/runtime.js'),
};

module.exports = config;
