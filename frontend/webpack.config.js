const path = require("path");

module.exports = [
  {
    entry: ["./extension/src/AddTagBoxes.ts"], //"./extension/src/components/TagBox/TagBox.ts"
    output: {
      path: path.resolve(__dirname, "webpackbuilt/src"),
      filename: "[name].js",
    },
    devtool: 'inline-source-map',
    module: {
      // Module.rules allows yo to specify loaders within your webpack configuration 
      rules: [
        {
          test: /\.ts$/,
          loader: "babel-loader",   // Loaders are transformations that are applied to the source code of a module. e.g. ts->js
                                    // Loaders can even allow you to do things like import css files directly from ur js modules
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
                                    // Loaders are executed from bottom to top
          use: [  
            // // [style-loader](/loaders/style-loader)
            // { loader: 'style-loader' },
            // // [css-loader](/loaders/css-loader)
            // {
            //   loader: 'css-loader',
            //   options: {
            //     modules: true
            //   }
            // },
            { loader: 'sass-loader' }
          ]
        }
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    target: "web",
    node: {
      __dirname: false,
    },
  }
];