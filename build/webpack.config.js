const path = require('path')
// HTML模板配置处理
const HtmlWebpackPlugin = require('html-webpack-plugin')
// 打包工具分析处理
const { BundleAnalyzerPlugin } =  require('webpack-bundle-analyzer')
// 此插件会提取CSS到单独的文件
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// 此插件用于CSS的优化和压缩
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
// 此插件用于js的压缩
const TerserPlugin = require('terser-webpack-plugin')
// 此插件用于图片压缩
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
// 此插件用于编译VUE
const { VueLoaderPlugin } = require('vue-loader')

const appPath = path.resolve(__dirname, '../public/index.html')

//process.env.NODE_ENV 环境变量
const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  //mode属性用于区分是development开发环境还是production生产环境
  mode: isProd ? 'production': 'development',  
  //entry属性用于设置打包的入口文件路径
  entry: {
    index: './src/index.js',
    // ather: './src/ather-module.js' //多个入口
  },
  //devtool属性用于将编译后的代码映射回原始源代码，一般用于development开发环境，用于调试
  devtool: isProd ? false : 'inline-source-map',
  //output属性用于设置项目打包后的项目路径
  output: {
    //filename 打包后的文件名
    //[contenthash]将根据资源内容创建唯一哈希值。当资源内容发生变化时，[contenthash] 也会发生变化 用于缓存没有变化的数据
    filename: '[name].[contenthash:8].bundle.js', //[contenthash.8] 添加contenthash并截取保留8位
    path: path.resolve(__dirname, '../dist'),  //打包后的文件夹
    clean: true //每次构建都会清理上一次的构建产物
  },
  //optimization属性由于配置一些优化的配置项  
  optimization: {
    /**
     * splitchunkPlugin代码分离 用于对重复引用的模块按规则打包到指定的js里   
     * */
    // runtimeChunk: 'single',   //将引导模板runtime提取出来，保证[contenthash]缓存生效
    //chunk分离
    splitChunks: {
      cacheGroups: {
        //将第三方库提取到单独的vendors chunk中，因为它们很少像本地代码一样频繁改动
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        }
      }
    },
    //这将仅在生产环境开启CSS优化，如果还想再开发环境上启用，请将optimization.minimize设置为true
    minimizer: [ 
      //在webpack@5中，可以使用 `...` 语法来扩展现有的minimizer(即`terser-webpack-plugin`)JS压缩
      //js压缩
      new TerserPlugin(),
      //压缩CSS
      new CssMinimizerPlugin(),
      //图片压缩
      new ImageMinimizerPlugin({
        //无损压缩
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ["gifsicle", { interlaced: true}],
              ["jpegtran", { progressive: true}],
              ["optipng", { optimizationLevel: 5 }],
              ["svgo", {
                plugins: [{
                  name: "preset-default"
                }]
              }]
            ]
          }
        },
        //有损压缩
        // minimizer: {
        //   implementation: ImageMinimizerPlugin.squooshMinify,
        //   options: {

        //   }
        // }
      })
    ]
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "../dist")
    },
    // client: {
    //   progress: true,
    // },
    // compress: true,
    // historyApiFallback: true,
    hot: true,  //模块热更新
    open: true, //自动打开浏览器
    port: '8080',  //设置端口号
    // proxy: {
    //   "/api": {
    //     target: '',
    //     changeOrigin: true,   //本地会生成虚拟的服务器接收你的请求并代理你的请求，主要用于跨域
    //     pathRewrite: {
    //       // '^/api': ''
    //     }
    //   }
    // }
  },
  resolve: {
    // import引入文件的时候不需要加后缀，webpack会自动按顺序尝试解析
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    // 路径别名
    alias: { '@': path.resolve(__dirname, "../src")}
  },
  module: {
    rules: [
      //css文件加载
      {
        test: /\.css$/i,
        // 要保证loader顺序 style-loader在前，css-loader在后
        use: [isProd ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader', 'postcss-loader',]
      },
      {
        test: /\.less$/i,
        // 要保证loader顺序 style-loader在前，css-loader在后
        use: [isProd ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader', 'postcss-loader', 'less-loader']
      },
      //图片资源加载 使用内置的资源模块(Asset Modules), 它是一中模块类型，允许使用资源文件(字体，图标等)而无需配置额外的loader
      {
        test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
        type: 'asset/resource',
        //指定打包到哪个目录下
        generator: {
          filename: "assets/[hash][ext][query]"
        }
      },
      //字体资源加载
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        //指定打包到哪个目录下
        generator: {
          filename: "assets/[hash][ext][query]"
        }
      },
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        exclude: /(node_moudles)/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: !isProd, // 使用cacheDirectory 选项，将babel-loader 提速至少两倍。这会将转译的结果缓存到文件系统中
            // presets: [['@babel/preset-env', { targets: 'ie 11'}]],
            // plugins: ['@babel/plugin-transform-runtime']
            // 上边两项配置移动到babel.config.js中
          }
        }
      },
      {
        test: /\.vue$/,
        use: "vue-loader"
      }
    ]
  },
  plugins: [
    // html模板配置
    new HtmlWebpackPlugin({
      title: 'Vue3+webpack5框架系统',
      template: appPath,
      favicon: path.resolve(__dirname, '../public/favicon.ico'),
      // 附加一个唯一的webpack编译散列到所有包含的脚本和css文件。这对缓存破坏很有用
      // 这里所引用都用一个hash值每次编译所有的都会发生改变，所以用output的[contenthash]hash来替换这里
      // hash: true,
      xhtml: true   //如果为true, 则将链接标记呈现为自关闭
    }),
    // 打包工具分析
    new BundleAnalyzerPlugin({
      ananlyzerMode: 'static',  // 生成一个分析报告的html文件(默认生成一个report.html)
      openAnalyzer: false   // 默认值为true, 是否在浏览器中自动打开报表
    }),
    // 将css提取到单独的文件
    new MiniCssExtractPlugin({
      filename: "css/[name].[contenthash:8].css"
    }),
    new VueLoaderPlugin()
  ]
}