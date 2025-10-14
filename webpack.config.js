const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isLibrary = argv.mode === 'production';
  
  return {
    entry: isLibrary ? './src/library.ts' : './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isLibrary ? 'library.js' : 'index.js',
      library: {
        type: 'umd',
        name: 'EgerKalandJatek',
      },
      clean: true,
    },
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
    plugins: [
      // HtmlWebpackPlugin csak development módban
      ...(isLibrary ? [] : [
        new HtmlWebpackPlugin({
          template: 'index.html',
          filename: 'index.html',
        })
      ]),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'minigame',      // ← ÚJ: fizikai minigame mappa
            to: 'minigame',        // ← célmappa is minigame
          },
          ...(isLibrary ? [] : [
            {
              from: 'favicon.ico',
              to: 'favicon.ico',
            }
          ]),
        ],
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: 8080,
    },
  };
};