const path = require('path');
const Dotenv = require('dotenv-webpack');


module.exports = {
  // mode: 'development', // 使用開發模式
  plugins: [
   // build_deploy.sh 用 ENV_FILE 指定 .env.staging／.env.production；沒設時（本機 docker 的 watch）照舊讀 .env
   new Dotenv({ path: process.env.ENV_FILE || './.env' })
  ],
  entry: {
    index: path.resolve(__dirname, 'react_src', 'index.jsx'),
  },
  devtool: 'inline-source-map',
  optimization: {
    splitChunks: {
      cacheGroups: {
        reactVendor: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
          name: 'vendor-react',
          chunks: 'all',
        },
      },
    },
  },
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
    // clean: true, 
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", "scss"]
  },

};