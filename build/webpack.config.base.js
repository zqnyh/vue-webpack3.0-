const path = require('path')
const createVueLoaderOption = require('./vue-loader.config')
// webpack-dev-server@2.x 依赖于此版本下的才可以正常运行请注意
// 如webpack升级的4.0 请关注到另外的一个版本

const isDev = process.env.NODE_ENV === 'development'
const config = {
  mode:process.env.NODE_ENV||"production",
  target: 'web',
  entry: path.join(__dirname, '../src/index.js'),
  output: {
    filename: 'bundle.[hash:8].js',
    path: path.join(__dirname, '../dist')
  },
  module: {
    rules: [
      {
        // 使用真正vue-loader去加载，去预处理
        test: /\.(vue|js|jsx)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
        enforce: 'pre'
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: createVueLoaderOption(isDev)
      },
      {
        test: /\.jsx$/,
        loader: 'babel-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(gif|jpg|jpeg|png|svg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 1024,
            name: 'resources/[path][name].[hash].[ext]'
          }
        }
        ]
      }
    ]
  }
}

module.exports = config
