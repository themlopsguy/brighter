const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add .riv extension to asset extensions so Metro can bundle Rive files
config.resolver.assetExts.push('riv');

module.exports = config;