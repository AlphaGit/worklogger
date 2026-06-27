const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  // Specify that we're in development or production
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  
  // Entry points - dynamically created from serverless.yml
  entry: slsw.lib.entries,
  
  // Target node.js environment
  target: 'node',
  
  // Enable source maps
  devtool: 'source-map',
  
  experiments: {
    outputModule: true,
  },
  
  // Resolve .ts and .js extensions
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    fallback: {
      "path": false,
      "fs": false
    }
  },
  
  // Output configuration
  output: {
    library: {
      type: 'module',
    },
    module: true,
    environment: {
      module: true,
    },
    path: path.join(__dirname, '.webpack'),
    filename: '[name].mjs',
    sourceMapFilename: '[file].map',
    chunkFormat: 'module',
  },
  
  // External modules (modules that should not be bundled)
  externals: [
    nodeExternals({
      allowlist: [
        'webpack/hot/poll?1000',
        /\.(eot|woff|woff2|ttf|otf)(\?.*)?$/,
        'moment-timezone'
      ],
      importType: 'module',
    }),
  ],
  
  // Module rules for TypeScript
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.json',
              compilerOptions: {
                module: 'ESNext',
                moduleResolution: 'node',
              }
            },
          },
        ],
      },
    ],
  },
  
  // Optimization
  optimization: {
    minimize: false, // Lambda doesn't need minified code
  },
  
  // Performance hints
  performance: {
    hints: false,
  },
  
  // Stats configuration for build output
  stats: {
    colors: true,
    reasons: true,
    chunks: false,
  },
}; 