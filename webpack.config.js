const path = require('path');
const Dotenv = require('dotenv-webpack');


module.exports = {
  plugins: [
   new Dotenv()
  ],
  entry: path.resolve(__dirname, 'react_src', 'index.jsx'),
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
    filename: 'bundle.js',
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", "scss"]
  },
};