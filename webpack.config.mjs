import { fileURLToPath } from 'node:url'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

export default (_, { mode }) => {
  const isProduction = mode === 'production'

  return {
    entry: './src/main.tsx',
    output: {
      path: fileURLToPath(new URL('./dist', import.meta.url)),
      filename: isProduction ? 'assets/[name].[contenthash:8].js' : 'assets/[name].js',
      assetModuleFilename: 'assets/[name].[contenthash:8][ext]',
      publicPath: 'auto',
      clean: true,
    },
    devtool: isProduction ? false : 'eval-cheap-module-source-map',
    resolve: { extensions: ['.tsx', '.ts', '.js'] },
    module: {
      rules: [
        { test: /\.tsx?$/, exclude: /node_modules/, loader: 'ts-loader', options: { transpileOnly: true } },
        { test: /\.css$/i, use: [isProduction ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader'] },
        { test: /\.(?:webp|avif|jpe?g|png|woff2)$/i, type: 'asset/resource' },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: './public/index.html' }),
      ...(isProduction ? [new MiniCssExtractPlugin({ filename: 'assets/[name].[contenthash:8].css' })] : []),
    ],
    devServer: {
      host: '127.0.0.1',
      port: 8080,
      static: false,
    },
  }
}
