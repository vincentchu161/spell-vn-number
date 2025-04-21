const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: [
    'core-js/stable',
    'regenerator-runtime/runtime',
    './src/index.ts'
  ],
  output: {
    path: path.resolve(__dirname, 'dist/browser'),
    filename: 'spell-vn-number.min.js',
    library: {
      name: 'spellVnNumber',
      type: 'umd',
      export: 'default',
      umdNamedDefine: true
    },
    globalObject: 'this'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              target: 'es5',
              module: 'commonjs'
            }
          }
        },
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
      chunks: 'all',
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          filename: 'vendors.min.js'
        }
      }
    }
  }
}; 