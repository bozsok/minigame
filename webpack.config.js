const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * Multi-config Webpack Setup
 * - Library mode: ES Module output (React/Vite integráció)
 * - Standalone mode: UMD output (development server)
 */
module.exports = (env = {}, argv) => {
  const configName = env.configName || 'standalone';
  const isLibrary = configName === 'library';
  
  // Közös konfiguráció
  const baseConfig = {
    entry: isLibrary ? './src/library.ts' : './src/index.ts',
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
  };

  // LIBRARY MODE - ES Module output
  if (isLibrary) {
    return {
      ...baseConfig,
      output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'library.js',
        library: {
          type: 'module',  // ← ES MODULE!
        },
        environment: {
          module: true,
        },
        clean: true,
      },
      experiments: {
        outputModule: true,  // ← Webpack 5 ESM support
      },
      plugins: [
        new CopyWebpackPlugin({
          patterns: [
            {
              from: 'minigame',
              to: 'minigame',
            },
          ],
        }),
      ],
      externals: {
        phaser: 'Phaser',  // Phaser külső dependency marad
      },
    };
  }

  // STANDALONE MODE - UMD output (dev server)
  return {
    ...baseConfig,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js',
      library: {
        type: 'umd',
        name: 'EgerKalandJatek',
        export: 'default',
      },
      globalObject: 'this',
      clean: true,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'index.html',
        filename: 'index.html',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'minigame',
            to: 'minigame',
          },
          {
            from: 'favicon.ico',
            to: 'favicon.ico',
          },
        ],
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: 8080,
      hot: true,
    },
  };
};