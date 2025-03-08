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
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
    sourceMapFilename: '[file].map',
  },
  
  // External modules (modules that should not be bundled)
  externals: [
    nodeExternals({
      allowlist: ['webpack/hot/poll?1000', /\.(eot|woff|woff2|ttf|otf)(\?.*)?$/]
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