const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const config = require('../../../configs');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      "path": require.resolve("path-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "crypto": require.resolve("crypto-browserify"),
      "fs": false,
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
      "vm": require.resolve("vm-browserify")
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
    new webpack.DefinePlugin({
      'process.env.API_URL': JSON.stringify(process.env.API_URL || `http://localhost:${config.services.trainingPortal.backendPort}`),
      'process.env.FRONTEND_PORT': JSON.stringify(process.env.FRONTEND_PORT || config.services.trainingPortal.frontendPort),
      'process.env.WANDB_BASE_URL': JSON.stringify(process.env.WANDB_BASE_URL || 'http://localhost:8083')
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: process.env.FRONTEND_PORT || config.services.trainingPortal.frontendPort,
    proxy: {
      '/api': {
        target: process.env.API_URL || `http://localhost:${config.services.trainingPortal.backendPort}`,
        changeOrigin: true,
      },
    },
  }
}; 