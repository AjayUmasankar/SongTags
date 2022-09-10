const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");


module.exports = [
  {
    // entry: ["./extension/src/AddTagBoxes.ts", "./extension/src/components/TagBox/TagBox.ts", "./extension/src/components/BackendNotifier.ts",
    //         "./extension/src/components/AddTagButton/AddTagButton.scss"],
    // Webpack takes care of dependencies by starting from an entry and using those imports and etc.
    // Before we had imports/exports, we manually injected all our non-modules files (they had no export/import)
    // Hence, our files were  able to refer to another files class (e.g. AddTagBoxes to TagBox component) without an import
    // This happened because https://stackoverflow.com/questions/69416097/what-does-a-file-without-any-top-level-import-or-export-declarations-is-treated
    entry: ["./src/AddTagBoxes.ts",
    "./src/components/AddTagButton/AddTagButton.scss"],
            // "./extension/external_modules/bootstrap-5.1.3/js/bootstrap.js"], 
    context: path.resolve(__dirname, 'extension'),
    output: {
      path: path.resolve(__dirname, "extensionbuilt"),
      filename: "[name].js",
      publicPath: ''                    // or else some webpack related error occurs in browser
    },
    devtool: 'inline-source-map',       // This is actually cracked. Even though compilation results in one main.js, debugging in dev tools shows just your file .e.g TagBox
                                        // if you turn this off it just shows main.js, which is pretty much jibberish
    module: {
      // Module.rules allows yo to specify loaders within your webpack configuration 
      rules: [
        {
          test: /\.ts$/,
          loader: "babel-loader",   // Loaders are transformations that are applied to the source code of a module. e.g. ts->js
                                    // Loaders can even allow you to do things like import css files directly from ur js modules
                                    // If we used ts-loader, we will rely on tsconfig.json
          exclude: /node_modules/,
          options: {  presets: ["@babel/typescript"]  }
        },
        {
          test: /\.scss$/,
                                    // Loaders are executed from bottom to top
          use: [
            {
                loader: 'file-loader',                      // Think we use this just to move our css files
                options: { name: '[path][name].css'}        // this is meant to be .min.cs
            },
            'sass-loader'
          ]
        }
      ],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: "**/*.css", to: "[path][name][ext]"},
          { from: "**/*.png", to: "[path][name][ext]"},
          { from: "**/*.html", to: "[path][name][ext]"},
          { from: "external_modules/bootstrap-5.1.3/js/bootstrap.js", to: "external_modules/bootstrap-5.1.3/js/bootstrap.js"},
          { from: "manifest.json", to: "manifest.json"}
        ]
      })
    ],
    resolve: {
      extensions: ['.ts', '.js'],
    },
    target: "web",
    node: {
      __dirname: false,
    },
  }
];