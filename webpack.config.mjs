import { fileURLToPath } from 'node:url'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { PrecachePlugin } from './scripts/precache-plugin.mjs'

export default (_, { mode }) => {
  const isProduction = mode === 'production'

  return {
    entry: './src/app/index.tsx',
    output: {
      path: fileURLToPath(new URL('./dist', import.meta.url)),
      filename: isProduction ? 'assets/[name].[contenthash:8].js' : 'assets/[name].js',
      assetModuleFilename: 'assets/[name].[contenthash:8][ext]',
      publicPath: 'auto',
      clean: true,
    },
    devtool: isProduction ? false : 'eval-cheap-module-source-map',
    resolve: { extensions: ['.tsx', '.ts', '.js'], tsconfig: true },
    module: {
      rules: [
        { test: /\.tsx?$/, exclude: /node_modules/, loader: 'ts-loader', options: { transpileOnly: true } },
        {
          test: /\.scss$/i,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: /\.module\.scss$/i,
                  namedExport: false,
                  localIdentName: isProduction ? '[hash:base64:8]' : '[name]__[local]__[hash:base64:5]',
                },
              },
            },
            { loader: 'sass-loader', options: { api: 'modern' } },
          ],
        },
        { test: /\.(?:webp|avif|jpe?g|png|woff2)$/i, type: 'asset/resource' },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: './public/index.html', favicon: './public/favicon.svg' }),
      ...(isProduction
        ? [new MiniCssExtractPlugin({ filename: 'assets/[name].[contenthash:8].css' }), new PrecachePlugin()]
        : []),
    ],
    devServer: {
      host: 'localhost',
      port: 8080,
      static: false,
    },
  }
}
