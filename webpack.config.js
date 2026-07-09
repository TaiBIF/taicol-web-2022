const path = require('path');
const Dotenv = require('dotenv-webpack');


module.exports = {
  // mode: 'development', // 使用開發模式
  plugins: [
   new Dotenv()
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