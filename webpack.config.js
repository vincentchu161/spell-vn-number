const path = require('path');
const fs = require('fs');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// Create temp directory for stats
const tempDir = path.resolve(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

module.exports = (env) => {
  const config = {
    mode: 'production',
    entry: './src/index.ts',
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
          use: {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                target: 'es5',
                module: 'commonjs',
                removeComments: true,
                moduleResolution: 'node',
                esModuleInterop: true,
                noEmitOnError: true,
                strict: true,
                noImplicitAny: true,
                noUnusedLocals: true,
                noUnusedParameters: true
              }
            }
          },
          exclude: /node_modules/
        }
      ]
    },
    devtool: false,
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
              drop_debugger: true,
              dead_code: true,
              unused: true,
              passes: 5,
              pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
              collapse_vars: true,
              reduce_vars: true,
              hoist_funs: true,
              hoist_vars: true,
              if_return: true,
              join_vars: true,
              loops: true,
              properties: true,
              sequences: true,
              side_effects: true,
              unsafe: false
            },
            mangle: {
              safari10: true,
              keep_classnames: false,
              keep_fnames: false,
              toplevel: true
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
              beautify: false,
              indent_level: 0,
              max_line_len: 96,
              semicolons: true
            }
          },
          parallel: true,
          extractComments: false
        })
      ],
      usedExports: true,
      sideEffects: true
    },
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: env.analyze ? 'server' : 'disabled',
        generateStatsFile: env.analyze,
        statsFilename: path.join(tempDir, 'stats.json'),
        openAnalyzer: true,
        analyzerPort: 8888,
        logLevel: 'info'
      })
    ]
  };

  // Clean up temp directory after build
  if (env.analyze) {
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.done.tap('CleanupPlugin', () => {
          // Keep the stats file until the analyzer is closed
          setTimeout(() => {
            if (fs.existsSync(tempDir)) {
              fs.rmSync(tempDir, { recursive: true, force: true });
            }
          }, 1000);
        });
      }
    });
  }

  return config;
};
