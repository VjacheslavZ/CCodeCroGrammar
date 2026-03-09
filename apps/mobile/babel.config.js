module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // In monorepo, babel-preset-expo (hoisted to root) can't resolve expo-router
      // (local to apps/mobile), so the router plugin isn't auto-loaded.
      // Include it explicitly to ensure process.env.EXPO_ROUTER_APP_ROOT is replaced.
      require('babel-preset-expo/build/expo-router-plugin').expoRouterBabelPlugin,
    ],
  };
};
