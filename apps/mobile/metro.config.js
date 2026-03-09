const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// For every package installed locally in apps/mobile/node_modules,
// pin Metro to the local copy and block the root copy.
// This prevents duplicate native module registrations and version mismatches.
const localModulesDir = path.resolve(projectRoot, 'node_modules');
const rootModulesDir = path.resolve(monorepoRoot, 'node_modules');

const localPackages = fs.readdirSync(localModulesDir).filter((name) => !name.startsWith('.'));

const extraNodeModules = {};
const blockPatterns = [];

for (const name of localPackages) {
  // Handle scoped packages (@expo/*, @react-navigation/*, etc.)
  if (name.startsWith('@')) {
    const scopedDir = path.resolve(localModulesDir, name);
    if (!fs.statSync(scopedDir).isDirectory()) continue;

    for (const scoped of fs.readdirSync(scopedDir)) {
      const fullName = `${name}/${scoped}`;
      extraNodeModules[fullName] = path.resolve(localModulesDir, fullName);

      const rootPath = path.resolve(rootModulesDir, fullName);
      if (fs.existsSync(rootPath)) {
        blockPatterns.push(new RegExp(`^${escape(rootPath)}/.*$`));
      }
    }
  } else {
    extraNodeModules[name] = path.resolve(localModulesDir, name);

    const rootPath = path.resolve(rootModulesDir, name);
    if (fs.existsSync(rootPath)) {
      blockPatterns.push(new RegExp(`^${escape(rootPath)}/.*$`));
    }
  }
}

config.resolver.extraNodeModules = extraNodeModules;
config.resolver.blockList = blockPatterns;

function escape(str) {
  return str.replace(/[/\\.*+?^${}()|[\]]/g, '\\$&');
}

module.exports = config;
