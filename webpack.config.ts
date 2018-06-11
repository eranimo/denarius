var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function(env) {
  return {
    entry: [
      './src/sim.ts',
      './src/ui.ts',
      './node_modules/semantic-ui/dist/semantic.min.css'
    ],
    devtool: "source-map",
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: path.resolve(__dirname, 'dist', 'assets')
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: 'ts-loader'
        },
        {
          test: /\.css$/,
          use: [ 'style-loader', 'css-loader' ]
        },
        {
          test: /\.png$/,
          use: { loader: 'url-loader', options: { limit: 100000 } },
        },
        {
          test: /\.jpg$/,
          use: [ 'file-loader' ]
        },
        {
          test: /\.(eot|svg|ttf|woff|woff2)$/,
          use: [ 'file-loader' ]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Denarius - Economic Simulation',
        template: 'src/index.html'
      })
    ],
    devServer: {
      port: 8999,
      stats: 'errors-only',
      historyApiFallback: {
        index: path.resolve(__dirname, 'dist', 'assets')
      }
    }
  };
};
