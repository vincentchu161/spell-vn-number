const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: ['core-js/stable', 'regenerator-runtime/runtime', './src/index.ts'],
  output: {
    path: path.resolve(__dirname, 'dist/browser'),
    filename: 'spell-vn-number.min.js',
    library: 'spellVnNumber',
    libraryTarget: 'umd',
    globalObject: 'this',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 5
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
            drop_console: true,
            drop_debugger: true
          },
          mangle: {
            safari10: true
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true
          }
        },
        parallel: true,
        extractComments: false
      })
    ],
    splitChunks: {
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          filename: 'vendors.min.js'
        }
      }
    }
  }
}; 