var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function(env) {
  return {
    entry: './src/index.js',
    devtool: "source-map",
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist')
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        }
      ]
    },
    plugins: [new HtmlWebpackPlugin({
      title: 'Denarius - Economic Simulation'
    })],
    devServer: {
      stats: 'errors-only'
    }
  };
};
