const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const history = require('connect-history-api-fallback');
const convert = require('koa-connect');


module.exports = function() {
  return {
    entry: [
      './src/index.ts',
    ],
    devtool: "source-map",
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      // publicPath: path.resolve(__dirname, 'dist', 'assets'),
      globalObject: 'this',
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".css"],
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    },
    module: {
      rules: [
        {
          test: /\.worker\.ts?$/,
          exclude: /node_modules/,
          loader: ['workerize-loader', 'ts-loader']
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: 'ts-loader'
        },
        {
          test: /\.css$/,
          include: /node_modules/,
          loader: 'css-loader',
        },
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [ 'style-loader', 'css-loader' ]
        },
        {
          test: /\.png$/,
          exclude: /node_modules/,
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
    mode: process.env.WEBPACK_SERVE ? 'development' : 'production',
    plugins: [
      new webpack.NamedModulesPlugin(),
      new HtmlWebpackPlugin({
        title: 'Denarius - Economic Simulation',
        template: 'src/index.html'
      })
    ],
    serve: {
      port: 8999,
      // dev: {
      //   publicPath: path.resolve(__dirname, 'dist', 'assets'),
      // },
      // clipboard: false,
      // content: [path.resolve(__dirname, 'dist')],
      // add: (app, middleware, options) => {
      //   const historyOptions = {
      //     // index: path.resolve(__dirname, 'dist', 'index.html')
      //   };
      //   app.use(convert(history(historyOptions)));
      //   // middleware.webpack();
      //   // middleware.content();
      // },
    }
  };
};
