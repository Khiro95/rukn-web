const path = require('path');
const TranslatorPlugin = require('./src/plugins/translator-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const mode = process.env.NODE_ENV;
const isDev = mode === 'development';

const _publicPath = '/';
const combinerOptions = {
  componentsPath: 'src/components/',
  publicPath: _publicPath
};

module.exports = {
  mode,
  entry: {
    main: './src/main.js',
  },
  output: {
    filename: `js/[name]${isDev ? '' : '.[contenthash]'}.js`,
    path: path.resolve(__dirname, 'dist'),
    publicPath: _publicPath,
    clean: true,
  },
  devServer: !isDev ? undefined : {
    static: './dist',
    client: {
      overlay: {
        errors: true,
        warnings: true,
        runtimeErrors: false
      }
    },
    historyApiFallback: {
      rewrites: [
        { from: /^\/$/, to: '/en.index.html' },
        { from: /^\/en/, to: '/en.index.html' },
        { from: /^\/ar/, to: '/ar.index.html' },
      ]
    }
  },
  plugins: [
    new TranslatorPlugin({
      i18nOptions: {
        locales: ['en', 'ar']
      },
      hwpOptions: {
        template: `./src/loaders/combiner?${JSON.stringify(combinerOptions)}!./src/index.html`,
        chunks: ['main']
      }
    }),
    new MiniCssExtractPlugin({
      filename: `css/[name]${isDev ? '' : '.[contenthash]'}.css`,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "src/static",
          globOptions: {
            ignore: '**/js/*'
          }
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.xml$/i,
        type: 'asset/resource',
        generator: {
          filename: 'data/[name].xml'
        }
      },
      {
        test: /\.svg$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name].svg'
        }
      },
      {
        test: /\.ttf$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].ttf'
        }
      },
      {
        test: /\.js$/i,
        include: path.resolve(__dirname, 'src/static/js/'),
        type: 'asset/resource',
        generator: {
          filename: 'js/[name].js'
        }
      },
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, 'src/styles/'),
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: _publicPath
            }
          },
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [ 'autoprefixer' ]
              }
            }
          }
        ]
      },
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, 'src/components/'),
        type: 'asset/resource',
        generator: {
          filename: `css/[name]${isDev ? '' : '.[contenthash]'}.css`
        },
        use: {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [ 'autoprefixer' ]
            }
          }
        }
      },
      {
        test: /\.html$/i,
        use: [
          {
            loader: "html-loader",
            options: {
              sources: {
                list: [
                  "...",
                  {
                    tag: "meta",
                    attribute: "content",
                    type: "src",
                    filter: (tag, attribute, attributes, resourcePath) => {
                      return ["og:image", "twitter:image"].includes(attributes.find(a => a.name === 'property')?.value);
                    },
                  },
                ],
              },
              esModule: false
            }
          }
        ]
      },
    ]
  }
};