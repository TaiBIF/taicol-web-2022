const path = require('path');
const Dotenv = require('dotenv-webpack');


module.exports = {
  // mode: 'development', // 使用開發模式
  plugins: [
   new Dotenv()
  ],
  entry: {
    index: path.resolve(__dirname, 'react_src', 'index.jsx'),
    api: path.resolve(__dirname, 'react_src', 'api.jsx'),
    article_de: path.resolve(__dirname, 'react_src', 'article_de.jsx'),
    article_list: path.resolve(__dirname, 'react_src', 'article_list.jsx'),
    news_de: path.resolve(__dirname, 'react_src', 'news_de.jsx'),
    news_list: path.resolve(__dirname, 'react_src', 'news_list.jsx'),
    download: path.resolve(__dirname, 'react_src', 'download.jsx'),
    statistics: path.resolve(__dirname, 'react_src', 'statistics.jsx'),
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'ts-loader'
      },
    ],
  },
  output: {  
    path: path.resolve(__dirname, 'static', 'react_component'),
    filename: '[name].bundle.js',
  },
  // 如果是開發模式時打開
  // watch: true, 
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", "scss"]
  },

};