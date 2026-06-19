const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.watchFolders = [];
config.watcher = { watchman: { deferStates: [] } };
module.exports = config;