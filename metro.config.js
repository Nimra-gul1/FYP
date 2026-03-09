const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ignore the backend folder
config.watchFolders = [];
config.resolver.assetExts.push('cjs');
config.resolver.blockList = [/backend\/.*/];

module.exports = config;
